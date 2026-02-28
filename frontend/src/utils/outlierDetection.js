/**
 * Outlier Detection Utilities
 * Implements IQR and Z-Score methods with clean functional design.
 */

/**
 * Compute derived epidemiological metrics for each country.
 * Handles division-by-zero safely.
 */
export function computeDerivedMetrics(rows) {
  return rows.map(row => {
    const total_cases = parseFloat(row.total_cases) || 0;
    const total_deaths = parseFloat(row.total_deaths) || 0;
    const population = parseFloat(row.population) || 1;
    const icu_patients = parseFloat(row.icu_patients) || null;

    return {
      country_name: row.country_name,
      continent: row.continent,
      gdp_per_capita: parseFloat(row.gdp_per_capita) || null,
      life_expectancy: parseFloat(row.life_expectancy) || null,
      total_cases,
      total_deaths,
      population,
      death_rate: total_cases > 0 ? total_deaths / total_cases : null,
      cases_per_capita: population > 0 ? total_cases / population : null,
      icu_per_capita: (icu_patients !== null && population > 0) ? icu_patients / population : null,
      excess_mortality: row.excess_mortality !== null ? parseFloat(row.excess_mortality) : null,
    };
  });
}

/**
 * Compute Q1, Q3, IQR and detect outliers using the Tukey Fence method.
 */
export function detectIQR(data, metricKey) {
  const values = data
    .map(d => d[metricKey])
    .filter(v => v !== null && isFinite(v))
    .sort((a, b) => a - b);

  if (values.length < 4) {
    return { lower: null, upper: null, flagged: data.map(() => false) };
  }

  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const flagged = data.map(d => {
    const v = d[metricKey];
    if (v === null || !isFinite(v)) return false;
    return v < lower || v > upper;
  });

  return { lower, upper, q1, q3, iqr, flagged };
}

/**
 * Detect outliers using Z-Score (|z| > 3).
 */
export function detectZScore(data, metricKey) {
  const values = data
    .map(d => d[metricKey])
    .filter(v => v !== null && isFinite(v));

  if (values.length < 2) {
    return { mean: null, std: null, flagged: data.map(() => false) };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance) || 1;

  const flagged = data.map(d => {
    const v = d[metricKey];
    if (v === null || !isFinite(v)) return false;
    return Math.abs((v - mean) / std) > 3;
  });

  return { mean, std, flagged };
}

/**
 * Compute the p-th percentile of a sorted array.
 */
function percentile(sortedArr, p) {
  const idx = (p / 100) * (sortedArr.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  return sortedArr[lo] + frac * (sortedArr[hi] - sortedArr[lo]);
}
