import { NextResponse } from "next/server";

const MODEL_API_URL = process.env.MODEL_API_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${MODEL_API_URL}/health`, { cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${MODEL_API_URL}/predict`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: "AI model service is unavailable. Start the model API and try again." },
      { status: 503 }
    );
  }
}

