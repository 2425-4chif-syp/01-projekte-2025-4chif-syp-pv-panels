FROM python:3.10-slim

WORKDIR /work

# Postgres-Client und Python-Pakete
RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY scripts/import_dxf.py .
COPY scripts/Grundriss_erweitert.dxf .

RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    shapely==2.0.3 \
    scikit-learn==1.4.2 \
    ezdxf \
    psycopg2-binary