import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.location as country_name,
        c.continent,
        f.stringency_index,
        f.total_cases,
        f.new_vaccinations
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      JOIN dim_date d ON f.date_id = d.date_id
      WHERE d.date = (SELECT MAX(date) FROM dim_date);
    `;
    const result = await query(sql);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('API Error (Scatter Data):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
