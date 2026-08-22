import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "opd_bookings.json");

function readBookings() {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeBookings(bookings: any[]) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(bookings, null, 2));
}

export async function GET() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json([]);
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const booking = await request.json();
        
        const bookings = readBookings();

        // Add a unique booking ID and timestamp
        const newBooking = {
            ...booking,
            id: `OPD-${Math.floor(10000 + Math.random() * 90000)}`,
            timestamp: new Date().toISOString(),
            status: 'confirmed'
        };

        bookings.push(newBooking);
        writeBookings(bookings);

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();
        if (!fs.existsSync(DB_PATH)) return NextResponse.json({ error: "No bookings found" }, { status: 404 });

        let bookings = readBookings();
        
        const index = bookings.findIndex((b: any) => b.id === id);
        if (index === -1) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

        bookings[index].status = status;
        writeBookings(bookings);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}


