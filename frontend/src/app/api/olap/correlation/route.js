import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.continent, 
        AVG(f.stringency_index) as avg_stringency, 
        AVG(f.total_cases) as avg_total_cases, 
        AVG(f.new_vaccinations) as avg_new_vaccinations
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      GROUP BY c.continent;
    `;
    const result = await query(sql);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
