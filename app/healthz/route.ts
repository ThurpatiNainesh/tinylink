import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const startTime = Date.now();

export async function GET() {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      ok: true,
      version: '1.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        version: '1.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        database: 'disconnected',
      },
      { status: 503 }
    );
  }
}