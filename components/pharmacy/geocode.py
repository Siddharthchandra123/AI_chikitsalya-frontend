"""
Generate latitude/longitude for the Jan Aushadhi Kendra dataset.

Strategy:
1. Read jan_aushadhi_cleaned.csv.
2. Extract valid 6-digit PINs.
3. Query the India PIN/post-office location service in batches.
4. Match by PIN and choose the first available postal-office coordinate.
5. Write lat/lng back into CSV and TypeScript.

The coordinates are PIN/post-office-level coordinates, NOT guaranteed to be
the exact storefront coordinates of the Jan Aushadhi Kendra.
"""

import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request

import pandas as pd

INPUT = Path("pharmacy.csv")
OUTPUT_CSV = Path("jan_aushadhi_pharmacies_geocoded.csv")
OUTPUT_TS = Path("jan_aushadhi_pharmacies_geocoded.ts")

ARCGIS_QUERY = (
    "https://livingatlas.esri.in/server1/rest/services/India/"
    "All_India_Pincode_Directory/MapServer/0/query"
)

def fetch_pins(pins):
    # ArcGIS WHERE IN has practical URL-size limits, so use small batches.
    quoted = ",".join("'" + p + "'" for p in pins)
    params = {
        "where": f"pincode IN ({quoted})",
        "outFields": "pincode,lat,long",
        "returnGeometry": "false",
        "f": "json",
    }
    url = ARCGIS_QUERY + "?" + urlencode(params)
    req = Request(url, headers={"User-Agent": "JanAushadhiMap/1.0"})
    with urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))

def main():
    df = pd.read_csv(INPUT, dtype=str).fillna("")

    df["pincode"] = (
        df["pincode"]
        .astype(str)
        .str.extract(r"(\d{6})", expand=False)
        .fillna("")
    )

    df["lat"] = None
    df["lng"] = None

    pins = sorted(p for p in df["pincode"].unique() if re.fullmatch(r"\d{6}", p))
    coordinate_by_pin = {}

    print(f"Jan Aushadhi records: {len(df)}")
    print(f"Unique valid PINs: {len(pins)}")

    batch_size = 50
    for i in range(0, len(pins), batch_size):
        batch = pins[i:i + batch_size]
        try:
            payload = fetch_pins(batch)
            for feature in payload.get("features", []):
                a = feature.get("attributes", {})
                pin = str(a.get("pincode", "")).zfill(6)
                try:
                    lat = float(a.get("lat"))
                    lng = float(a.get("long"))
                except (TypeError, ValueError):
                    continue

                if pin and -90 <= lat <= 90 and -180 <= lng <= 180:
                    coordinate_by_pin.setdefault(pin, (lat, lng))
        except Exception as exc:
            print(f"Batch {i // batch_size + 1} failed: {exc}")
        time.sleep(0.1)

    for idx, row in df.iterrows():
        coord = coordinate_by_pin.get(row["pincode"])
        if coord:
            df.at[idx, "lat"] = coord[0]
            df.at[idx, "lng"] = coord[1]

    df.to_csv(OUTPUT_CSV, index=False)

    records = df.to_dict(orient="records")
    with OUTPUT_TS.open("w", encoding="utf-8") as f:
        f.write("export const pharmacies = ")
        json.dump(records, f, ensure_ascii=False, indent=2)
        f.write(" as const;\n")

    mapped = df["lat"].notna().sum()
    print(f"Records with lat/lng: {mapped}/{len(df)}")
    print(f"Unmapped records: {len(df) - mapped}")
    print(f"Created: {OUTPUT_CSV}")
    print(f"Created: {OUTPUT_TS}")

if __name__ == "__main__":
    main()