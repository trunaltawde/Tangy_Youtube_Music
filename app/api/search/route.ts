import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    if (!q) return NextResponse.json({ items: [] });

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Missing API key on server' }, { status: 500 });
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
      q
    )}&key=${encodeURIComponent(key)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
