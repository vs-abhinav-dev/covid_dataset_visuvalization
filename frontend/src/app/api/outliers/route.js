import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { computeDerivedMetrics, detectIQR, detectZScore } from '@/utils/outlierDetection';

const VALID_METRICS = ['death_rate', 'cases_per_capita', 'excess_mortality', 'icu_per_capita'];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'death_rate';
    const continent = searchParams.get('continent') || null;

    if (!VALID_METRICS.includes(metric)) {
      return NextResponse.json({ error: `Invalid metric. Must be one of: ${VALID_METRICS.join(', ')}` }, { status: 400 });
    }

    // Step A — Fetch Latest Valid Row Per Country using DISTINCT ON
    const sql = `
      SELECT DISTINCT ON (f.country_id)
        c.location        AS country_name,
        c.continent,
        c.population,
        c.gdp_per_capita,
        c.life_expectancy,
        f.total_cases,
        f.total_deaths,
        f.icu_patients,
        f.excess_mortality,
        d.date
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      JOIN dim_date    d ON f.date_id    = d.date_id
      WHERE f.total_cases IS NOT NULL
        AND f.total_cases > 0
        AND f.total_deaths IS NOT NULL
        ${continent ? 'AND c.continent = $1' : ''}
      ORDER BY f.country_id, d.date DESC;
    `;

    const params = continent ? [continent] : [];
    const result = await query(sql, params);
    const raw = result.rows;

    if (raw.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // Step B — Compute Derived Metrics
    const derived = computeDerivedMetrics(raw);

    // Step C — Run both outlier detection methods on the selected metric
    const iqrResult = detectIQR(derived, metric);
    const zResult   = detectZScore(derived, metric);

    // Assemble response
    const data = derived.map((d, i) => ({
      country_name:      d.country_name,
      continent:         d.continent,
      gdp_per_capita:    d.gdp_per_capita,
      death_rate:        d.death_rate,
      cases_per_capita:  d.cases_per_capita,
      icu_per_capita:    d.icu_per_capita,
      excess_mortality:  d.excess_mortality,
      metric_value:      d[metric],
      isOutlier_IQR:     iqrResult.flagged[i],
      isOutlier_Z:       zResult.flagged[i],
    }));

    const outlierCount = data.filter(d => d.isOutlier_IQR).length;

    return NextResponse.json({
      metadata: {
        metric,
        totalCountries: data.length,
        outlierCount,
        method: 'IQR',
        thresholds: {
          iqr: { lower: iqrResult.lower, upper: iqrResult.upper, q1: iqrResult.q1, q3: iqrResult.q3 },
          zscore: { mean: zResult.mean, std: zResult.std, threshold: 3 }
        }
      },
      data
    });

  } catch (error) {
    console.error('Outliers API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
