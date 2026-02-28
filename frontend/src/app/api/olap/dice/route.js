import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const continent = searchParams.get('continent');
  const startYear = searchParams.get('start_year');
  const endYear = searchParams.get('end_year');

  try {
    const sql = `
      SELECT 
        c.location as country_name,
        d.year,
        SUM(f.new_cases) as total_new_cases
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      JOIN dim_date d ON f.date_id = d.date_id
      WHERE c.continent = $1 AND d.year BETWEEN $2 AND $3
      GROUP BY c.location, d.year
      ORDER BY d.year, total_new_cases DESC;
    `;
    const result = await query(sql, [continent, parseInt(startYear), parseInt(endYear)]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
