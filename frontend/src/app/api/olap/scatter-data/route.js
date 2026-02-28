import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = `
      WITH LatestDataDate AS (
        SELECT f.date_id
        FROM fact_covid_stats f
        JOIN dim_date d ON f.date_id = d.date_id
        WHERE f.stringency_index IS NOT NULL AND f.total_cases IS NOT NULL
        ORDER BY d.date DESC
        LIMIT 1
      )
      SELECT 
        c.location as country_name,
        c.continent,
        f.stringency_index,
        f.total_cases,
        f.new_vaccinations
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      JOIN dim_date d ON f.date_id = d.date_id
      WHERE f.date_id = (SELECT date_id FROM LatestDataDate);
    `;
    const result = await query(sql);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
