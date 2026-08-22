import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json({ error: "Latitude and longitude required." }, { status: 400 });
    }

    let hospitals: any[] = [];

    // 1. Load Local Fallback Data
    try {
        const feedPath = path.join(process.cwd(), 'hospital_data.json');
        if (fs.existsSync(feedPath)) {
            const data = fs.readFileSync(feedPath, 'utf8');
            const rawHospitals = JSON.parse(data);
            hospitals = rawHospitals.map((h: any, index: number) => ({
                id: `local-${index}`,
                name: h.name,
                type: h.category || "General",
                address: h.address,
                distance: "Local Feed",
                rating: 4.8,
                reviews: Math.floor(Math.random() * 500) + 100,
                phone: h.phone || "",
                emergency: (h.category || "").toLowerCase().includes('hospital') || (h.name || "").toLowerCase().includes('hospital'),
                beds: { total: 100, available: Math.floor(Math.random() * 15) },
                departments: ["Emergency", "General Medicine"],
                timing: "24/7",
                lat: h.lat,
                lon: h.lon,
                source: 'feed'
            }));
        }

    } catch (e) {
        console.error("Error reading hospital_data.json:", e);
    }

    try {
        // 2. Fetch Live OSM Data (Optimized search)
        const overpassQuery = `
            [out:json][timeout:15];
            (
              node(around:15000,${lat},${lon})["amenity"~"hospital|clinic"];
              way(around:15000,${lat},${lon})["amenity"~"hospital|clinic"];
            );
            out center;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'AI-Chikitsalya-NextJS/1.1'
            },
            body: `data=${encodeURIComponent(overpassQuery)}`,
            signal: AbortSignal.timeout(15000)
        });


        if (response.ok) {
            const data = await response.json();
            if (data.elements) {
                const osmHospitals = data.elements.map((h: any) => {
                    const name = h.tags.name || h.tags['name:en'] || h.tags['name:hi'] || "Local Health Centre";

                    let addrArray = [];
                    if (h.tags['addr:street']) addrArray.push(h.tags['addr:street']);
                    if (h.tags['addr:city']) addrArray.push(h.tags['addr:city']);
                    const addr = addrArray.length > 0 ? addrArray.join(", ") : "Local Medical Facility";

                    const phone = h.tags.phone || h.tags['contact:phone'] || "";

                    let category = "General";
                    const type = (h.tags.amenity || h.tags.healthcare || "").toLowerCase();
                    if (type.includes('clinic')) category = "Clinic";
                    else if (type.includes('hospital')) category = "Multispeciality";

                    return {
                        id: h.id,
                        name: name,
                        type: category,
                        address: addr,
                        distance: "Calculating...", // Will be calculated on frontend
                        rating: 4.5,
                        reviews: Math.floor(Math.random() * 1000),
                        phone: phone,
                        emergency: type.includes('hospital'),
                        beds: { total: 100, available: Math.floor(Math.random() * 20) },
                        departments: ["General Medicine"],
                        timing: "24/7",
                        lat: h.lat || (h.center ? h.center.lat : null),
                        lon: h.lon || (h.center ? h.center.lon : null),
                        source: 'satellite'
                    };
                }).filter((h: any) => h.lat && h.lon);

                hospitals = [...osmHospitals, ...hospitals];
            }
        }
    } catch (err) {
        console.error("Overpass API Error:", err);
    }

    console.log(`API returning ${hospitals.length} hospitals. (Local: ${hospitals.filter(h => h.source === 'feed').length}, Satellite: ${hospitals.filter(h => h.source === 'satellite').length})`);

    return NextResponse.json(hospitals);
}


