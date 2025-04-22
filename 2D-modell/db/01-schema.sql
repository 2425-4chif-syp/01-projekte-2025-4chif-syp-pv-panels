-- 01-schema.sql

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS floor (
                                     id   SERIAL PRIMARY KEY,
                                     name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wall (
                                    id       SERIAL PRIMARY KEY,
                                    floor_id INT REFERENCES floor(id),
    geom     GEOMETRY(LineString,0)
    );

CREATE TABLE IF NOT EXISTS door (
                                    id       SERIAL PRIMARY KEY,
                                    floor_id INT REFERENCES floor(id),
    geom     GEOMETRY(Polygon,0)
    );

CREATE TABLE IF NOT EXISTS staircase (
                                         id       SERIAL PRIMARY KEY,
                                         floor_id INT REFERENCES floor(id),
    geom     GEOMETRY(Polygon,0)
    );

CREATE TABLE IF NOT EXISTS elevator (
                                        id       SERIAL PRIMARY KEY,
                                        floor_id INT REFERENCES floor(id),
    geom     GEOMETRY(Polygon,0)
    );

CREATE TABLE IF NOT EXISTS room (
                                    id       SERIAL PRIMARY KEY,
                                    floor_id INT REFERENCES floor(id),
    geom     GEOMETRY(Polygon,0)
    );

CREATE TABLE IF NOT EXISTS node (
                                    id       SERIAL PRIMARY KEY,
                                    floor_id INT,
                                    geom     GEOMETRY(Point,0),
    type     TEXT
    );

CREATE TABLE IF NOT EXISTS edge (
                                    id        SERIAL PRIMARY KEY,
                                    from_node INT REFERENCES node(id),
    to_node   INT REFERENCES node(id),
    weight    DOUBLE PRECISION
    );
