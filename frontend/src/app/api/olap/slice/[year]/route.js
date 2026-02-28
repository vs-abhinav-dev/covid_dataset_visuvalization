import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { year } = await params;
  try {
    const sql = `
      SELECT 
        c.location as country_name, 
        SUM(f.new_cases) as total_new_cases,
        SUM(f.new_deaths) as total_new_deaths
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      JOIN dim_date d ON f.date_id = d.date_id
      WHERE d.year = $1
      GROUP BY c.location
      ORDER BY total_new_cases DESC;
    `;
    const result = await query(sql, [parseInt(year)]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
