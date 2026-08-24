import { NextResponse } from 'next/server';
import { searchWheels } from '@/lib/pexels/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') ?? 'car wheel';
  const perPage = Number(searchParams.get('per_page') ?? '12');
  try {
    const photos = await searchWheels(query, perPage);
    return NextResponse.json({ photos });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
