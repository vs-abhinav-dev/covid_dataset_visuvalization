import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const sql = `
      SELECT DISTINCT location as country_name
      FROM dim_country
      WHERE location IS NOT NULL AND location != ''
      ORDER BY location ASC;
    `;
        const result = await query(sql);
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
