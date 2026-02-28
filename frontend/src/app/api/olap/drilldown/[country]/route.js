import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { country } = params;
  try {
    const sql = `
      SELECT 
        d.date, 
        f.new_cases, 
        f.new_deaths
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      JOIN dim_date d ON f.date_id = d.date_id
      WHERE c.country_name = $1
      ORDER BY d.date;
    `;
    const result = await query(sql, [country]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
