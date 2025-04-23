import argparse
import os
from collections import defaultdict
from itertools import combinations

import ezdxf
import numpy as np
import psycopg2
from shapely.geometry import LineString, Polygon, Point
from shapely.ops import linemerge, polygonize
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# ---------------------------------------------------------------------------
# LAYER →  (DXF‑Query, Geom‑Typ)
# ---------------------------------------------------------------------------
LAYER_MAP = {
    "wall":       ('LINE[layer=="A_WAENDE"]',              "LINESTRING"),
    "door":       ('POLYLINE[layer=="A_TUEREN"]',          "POLYGON"),
    "room":       ('LINE[layer=="A_RAEUME"]',              "POLYGON_FROM_LINES"),
    "staircase":  ('POLYLINE[layer=="A_TREPPEN"]',         "POLYGON"),  # ggf. Layernamen anpassen
    "elevator":   ('POLYLINE[layer=="A_FAHRSTUH"]',        "POLYGON"),
}

FLOOR_NAMES_DEFAULT = ["Keller", "Erdgeschoss", "1.OG", "2.OG", "3.OG"]
SRID = 0  # CAD‑Koordinaten – keine Projektion

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def choose_kmeans(X: np.ndarray, k: int | None):
    if k and k >= 2:
        return KMeans(n_clusters=k, random_state=0).fit(X)
    # auto: best silhouette 2..10
    best_k, best_score = 2, -1
    for cand in range(2, min(10, len(X)) + 1):
        km = KMeans(n_clusters=cand, random_state=0).fit(X)
        sc = silhouette_score(X, km.labels_)
        if sc > best_score:
            best_k, best_score = cand, sc
            best_km = km
    return best_km


def insert_floor(cur, name: str) -> int:
    cur.execute("INSERT INTO floor (name) VALUES (%s) RETURNING id", (name,))
    return cur.fetchone()[0]


def insert_geom(cur, table: str, floor_id: int, geom_wkt: str):
    cur.execute(
        f"""
        INSERT INTO {table} (floor_id, geom)
        VALUES (
            %s,
            ST_Force2D(                 -- Z abschneiden
                ST_GeomFromText(%s, {SRID})
            )
        )
        """,
        (floor_id, geom_wkt),
    )


def insert_node(cur, floor_id: int, point: Point, ntype: str) -> int:
    cur.execute(
        """
        INSERT INTO node (floor_id, geom, type)
        VALUES (
            %s,
            ST_Force2D(ST_GeomFromText(%s,{srid})),
            %s
        ) RETURNING id
        """.format(srid=SRID),
        (floor_id, point.wkt, ntype),
    )
    return cur.fetchone()[0]


def insert_edge(cur, a_id: int, b_id: int, weight: float):
    cur.execute(
        "INSERT INTO edge (from_node, to_node, weight) VALUES (%s,%s,%s)",
        (a_id, b_id, weight),
    )

# ---------------------------------------------------------------------------
# Hauptfunktion
# ---------------------------------------------------------------------------

def process(path: str, db_cfg: dict, k_floors: int | None):
    conn = psycopg2.connect(**db_cfg)
    cur = conn.cursor()

    doc = ezdxf.readfile(path)
    ms = doc.modelspace()

    # 1) Walls sammeln → Clustering
    centroids, wall_geoms = [], []
    for ent in ms.query(LAYER_MAP["wall"][0]):
        ls = LineString([ent.dxf.start, ent.dxf.end])
        centroids.append([ls.centroid.x, ls.centroid.y])
        wall_geoms.append(ls)
    X = np.array(centroids)
    kmeans = choose_kmeans(X, k_floors)
    labels = kmeans.labels_
    n_clusters = kmeans.n_clusters

    print(f"Gefundene Geschosse: {n_clusters}")

    # 2) Floor‑IDs anlegen
    cluster2fid = {}
    for cl in range(n_clusters):
        name = FLOOR_NAMES_DEFAULT[cl] if cl < len(FLOOR_NAMES_DEFAULT) else f"Floor_{cl+1}"
        cluster2fid[cl] = insert_floor(cur, name)

    # 3) Geometrien iterieren
    # für room lines
    room_lines_by_cluster = defaultdict(list)

    for table, (query, gtype) in LAYER_MAP.items():
        for ent in ms.query(query):
            if gtype == "LINESTRING":
                geom = LineString([ent.dxf.start, ent.dxf.end])
            elif gtype == "POLYGON":
                pts = [(p[0], p[1]) for p in ent.points()]
                # mind. 4 Koordinaten nötig –
                if len(pts) < 3:
                    # zu wenig Punkte ➜ ignorieren
                    continue
                if len(pts) == 3:
                    # Dreieck schließen, falls nur 3 Punkte vorhanden
                    pts.append(pts[0])
                pts  = [(p[0], p[1]) for p in ent.points()]
                if len(pts) < 3:
                    continue
                if len(pts) == 3:
                    pts.append(pts[0])          # Dreieck schließen
                geom = Polygon(pts)
            elif gtype == "POLYGON_FROM_LINES":
                line = LineString([ent.dxf.start, ent.dxf.end])
                cl = kmeans.predict([[line.centroid.x, line.centroid.y]])[0]
                room_lines_by_cluster[cl].append(line)
                continue
            else:
                continue

            cl = kmeans.predict([[geom.centroid.x, geom.centroid.y]])[0]
            fid = cluster2fid[cl]
            insert_geom(cur, table, fid, geom.wkt)

            # Tür‑, Treppen‑, Fahrstuhl‑Centroid → node
            if table in ("door", "staircase", "elevator"):
                insert_node(cur, fid, geom.centroid, table)

    # 4) Rooms aus Lines polygonisieren
    for cl, lines in room_lines_by_cluster.items():
        fid = cluster2fid[cl]
        for poly in polygonize(linemerge(lines)):
            insert_geom(cur, "room", fid, poly.wkt)

    # 5) Horizontale Edges Tür‑zu‑Tür pro Floor
    for fid in cluster2fid.values():
        cur.execute("SELECT id, ST_X(geom), ST_Y(geom) FROM node WHERE floor_id=%s AND type='door'", (fid,))
        nodes = cur.fetchall()
        for (id1, x1, y1), (id2, x2, y2) in combinations(nodes, 2):
            dist = ((x1-x2)**2 + (y1-y2)**2) ** 0.5
            insert_edge(cur, id1, id2, dist)

    # 6) Vertikale Edges (Lift / Treppe)
    for vtype in ("elevator", "staircase"):
        cur.execute("""
                    SELECT id, ST_X(geom), ST_Y(geom), floor_id
                    FROM node WHERE type=%s ORDER BY ST_X(geom), ST_Y(geom)
                    """, (vtype,))
        rows = cur.fetchall()
        # gruppiere nach (x,y) Round 2 decimals
        buckets = defaultdict(list)
        for nid, x, y, fid in rows:
            buckets[(round(x,2), round(y,2))].append(nid)
        for nids in buckets.values():
            for a, b in combinations(sorted(nids), 2):
                insert_edge(cur, a, b, 0)  # vertikal → 0 Kosten

    conn.commit()
    cur.close(); conn.close()
    print("Import abgeschlossen.")

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cli():
    p = argparse.ArgumentParser(description="DXF → PostGIS Import & Routing")
    p.add_argument("dxf", help="Pfad zur DXF-Datei")
    p.add_argument("--floors", type=int, help="Geschoss-Anzahl (optional)")
    p.add_argument("--db-host", default=os.getenv("DB_HOST", "db"))
    p.add_argument("--db-port", default=os.getenv("DB_PORT", 5432), type=int)
    p.add_argument("--db-name", default=os.getenv("DB_NAME", "school"))
    p.add_argument("--db-user", default=os.getenv("DB_USER", "postgres"))
    p.add_argument("--db-pass", default=os.getenv("DB_PASS", "postgres"))
    args = p.parse_args()

    cfg = dict(host=args.db_host, port=args.db_port, dbname=args.db_name,
               user=args.db_user, password=args.db_pass)
    process(args.dxf, cfg, args.floors)

if __name__ == "__main__":
    cli()
