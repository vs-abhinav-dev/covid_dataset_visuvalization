import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.continent, 
        d.year, 
        SUM(f.total_cases) as total_cases
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      JOIN dim_date d ON f.date_id = d.date_id
      GROUP BY c.continent, d.year
      ORDER BY d.year, c.continent;
    `;
    const result = await query(sql);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
