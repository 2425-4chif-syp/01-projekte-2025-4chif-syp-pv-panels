-- Aktiviert PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE floor (
                       id   SERIAL PRIMARY KEY,
                       name TEXT NOT NULL
);

CREATE TABLE wall (
                      id        SERIAL PRIMARY KEY,
                      floor_id  INT REFERENCES floor(id),
                      geom      GEOMETRY(LINESTRING, 0)
);

CREATE TABLE door (
                      id        SERIAL PRIMARY KEY,
                      floor_id  INT REFERENCES floor(id),
                      geom      GEOMETRY(POLYGON, 0)
);

CREATE TABLE room (
                      id        SERIAL PRIMARY KEY,
                      floor_id  INT REFERENCES floor(id),
                      geom      GEOMETRY(POLYGON, 0)
);

CREATE TABLE staircase (
                           id        SERIAL PRIMARY KEY,
                           floor_id  INT REFERENCES floor(id),
                           geom      GEOMETRY(POLYGON, 0)
);

CREATE TABLE elevator (
                          id        SERIAL PRIMARY KEY,
                          floor_id  INT REFERENCES floor(id),
                          geom      GEOMETRY(POLYGON, 0)
);

CREATE TABLE node (
                      id        SERIAL PRIMARY KEY,
                      floor_id  INT REFERENCES floor(id),
                      geom      GEOMETRY(POINT, 0),
                      type      TEXT            -- door | staircase | elevator
);

CREATE TABLE edge (
                      id         SERIAL PRIMARY KEY,
                      from_node  INT REFERENCES node(id),
                      to_node    INT REFERENCES node(id),
                      weight     DOUBLE PRECISION   -- Distanz oder 0 für vertikale Kanten
);
