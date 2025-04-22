import sys
import ezdxf
import psycopg2
from psycopg2 import sql

# -----------------------
# 1) CLI‑Argument prüfen
# -----------------------
if len(sys.argv) != 2:
    print("Usage: python import_dxf.py <path/to/file.dxf>")
    sys.exit(1)

dxf_path = sys.argv[1]

# -----------------------
# 2) DXF‑Datei einlesen
# -----------------------
doc = ezdxf.readfile(dxf_path)
ms  = doc.modelspace()
layers = [layer.dxf.name for layer in doc.layers]

# -----------------------
# 3) Layer‑Namen ermitteln
# -----------------------
def find_layer(keyword):
    matches = [l for l in layers if keyword in l.upper()]
    return matches[0] if matches else None

layer_wall      = "A_WAENDE"
layer_door      = "A_TUEREN"
layer_window    = "A_FENSTER"
layer_room      = "A_RAEUME"
layer_staircase = find_layer("TREPPEN")    # z.B. A_TREPPENHAUS
layer_elevator  = find_layer("FAHRSTUHL")  # z.B. A_FAHRSTUHL

print("Verwendete Layer:")
print(" Walls     :", layer_wall)
print(" Doors     :", layer_door)
print(" Windows   :", layer_window)
print(" Rooms     :", layer_room)
print(" Staircase :", layer_staircase)
print(" Elevator  :", layer_elevator)
print()

# -----------------------
# 4) DB‑Verbindung
# -----------------------
conn = psycopg2.connect(
    dbname="school",
    user="postgres",
    password="postgres",
    host="db",      # in Docker‑Compose heißt der Service 'db'
    port=5432
)
cur = conn.cursor()

def insert_wkt(table, floor_id, wkt):
    """Helferfunktion zum Einfügen von WKT-Geometrie."""
    cur.execute(
        sql.SQL("INSERT INTO {} (floor_id, geom) VALUES (%s, ST_GeomFromText(%s,0))")
        .format(sql.Identifier(table)),
        [floor_id, wkt]
    )

floor_id = 1  # Passe an, wenn du mehrere Etagen hast

# -----------------------
# 5) Wände (LINE → LINESTRING)
# -----------------------
for e in ms.query(f'LINE[layer=="{layer_wall}"]'):
    x1,y1 = e.dxf.start[:2]
    x2,y2 = e.dxf.end[:2]
    wkt = f"LINESTRING({x1} {y1},{x2} {y2})"
    insert_wkt("wall", floor_id, wkt)

# -----------------------
# 6) Türen (LWPOLYLINE → POLYGON)
# -----------------------
for pl in ms.query(f'LWPOLYLINE[layer=="{layer_door}"]'):
    pts_txt = ",".join(f"{x} {y}" for x,y in pl.get_points())
    wkt = f"POLYGON(({pts_txt}))"
    insert_wkt("door", floor_id, wkt)

# -----------------------
# 7) Fenster (POLYLINE → POLYGON)
# -----------------------
for pl in ms.query(f'POLYLINE[layer=="{layer_window}"]'):
    pts_txt = ",".join(f"{x} {y}" for x,y in pl.vertices())
    wkt = f"POLYGON(({pts_txt}))"
    insert_wkt("door", floor_id, wkt)  # oder in eine eigene 'window'-Tabelle

# -----------------------
# 8) Räume (LWPOLYLINE → POLYGON)
# -----------------------
for pl in ms.query(f'LWPOLYLINE[layer=="{layer_room}"]'):
    pts_txt = ",".join(f"{x} {y}" for x,y in pl.get_points())
    wkt = f"POLYGON(({pts_txt}))"
    insert_wkt("room", floor_id, wkt)

# -----------------------
# 9) Treppenhäuser (LWPOLYLINE → POLYGON)
# -----------------------
if layer_staircase:
    for pl in ms.query(f'LWPOLYLINE[layer=="{layer_staircase}"]'):
        pts_txt = ",".join(f"{x} {y}" for x,y in pl.get_points())
        wkt = f"POLYGON(({pts_txt}))"
        insert_wkt("staircase", floor_id, wkt)

# -----------------------
# 10) Fahrstühle (LWPOLYLINE → POLYGON)
# -----------------------
if layer_elevator:
    for pl in ms.query(f'LWPOLYLINE[layer=="{layer_elevator}"]'):
        pts_txt = ",".join(f"{x} {y}" for x,y in pl.get_points())
        wkt = f"POLYGON(({pts_txt}))"
        insert_wkt("elevator", floor_id, wkt)

# -----------------------
# 11) Abschließen
# -----------------------
conn.commit()
cur.close()
conn.close()
print("Import abgeschlossen für Etage", floor_id)
