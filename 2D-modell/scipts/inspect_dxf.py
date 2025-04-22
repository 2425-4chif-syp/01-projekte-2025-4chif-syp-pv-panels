import ezdxf
import sys
from collections import Counter

if len(sys.argv) != 2:
    print("Usage: python inspect_dxf.py <path/to/file.dxf>")
    sys.exit(1)

path = sys.argv[1]
doc  = ezdxf.readfile(path)
ms   = doc.modelspace()

# 1) Liste aller Layer
print("Layer in der Datei:")
for layer in doc.layers:
    print("  -", layer.dxf.name)
print()

# 2) Entity‑Verteilung pro (Layer, DXF‑Typ)
counts = Counter((e.dxf.layer, e.dxftype()) for e in ms)
print("Entity‑Anzahl pro (Layer, Typ):")
for (layer, etype), cnt in sorted(counts.items()):
    print(f"  {layer:20} | {etype:12} : {cnt}")
