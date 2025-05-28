FROM python:3.10-slim

WORKDIR /work

# Systempakete installieren
RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten installieren
RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    shapely==2.0.3 \
    scikit-learn==1.4.2 \
    ezdxf \
    psycopg2-binary

# Dateien reinkopieren
COPY scripts/import_dxf.py .
COPY scripts/Grundriss_erweitert.dxf .

# Import beim Build ausführen
FROM python:3.10-slim

WORKDIR /work

RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    shapely==2.0.3 \
    scikit-learn==1.4.2 \
    ezdxf \
    psycopg2-binary

COPY scripts/import_dxf.py .
COPY scripts/Grundriss_erweitert.dxf .

ENTRYPOINT ["bash", "-c", "until pg_isready -h db -U postgres; do sleep 1; done; python import_dxf.py Grundriss_erweitert.dxf"]

