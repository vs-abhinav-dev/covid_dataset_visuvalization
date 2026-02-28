import { query } from '@/lib/db';
import { standardize } from '@/lib/ml/scaling';
import { PCA } from '@/lib/ml/pca';
import { kMeans } from '@/lib/ml/kmeans';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'src/data/cache/clustering');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let k = parseInt(searchParams.get('k')) || 4;
    const forceRefresh = searchParams.get('force') === 'true';
    
    // Validate k
    if (k < 2) k = 2;
    if (k > 8) k = 8;

    const cachePath = path.join(CACHE_DIR, `cluster_k${k}.json`);

    // 1. Check Cache
    if (!forceRefresh && fs.existsSync(cachePath)) {
      console.log(`Returning cached clustering data for k=${k}`);
      const cachedData = fs.readFileSync(cachePath, 'utf8');
      return NextResponse.json(JSON.parse(cachedData));
    }

    // 2. Fetch data (if not cached or forced)
    const sql = `
      WITH TrueLatestDate AS (
        SELECT f.date_id
        FROM fact_covid_stats f
        JOIN dim_country c ON f.country_id = c.country_id
        WHERE f.total_cases IS NOT NULL AND f.stringency_index IS NOT NULL
        ORDER BY f.date_id DESC
        LIMIT 1
      )
      SELECT 
        c.location as country_name,
        c.continent,
        f.total_cases,
        f.stringency_index,
        f.new_vaccinations,
        c.gdp_per_capita,
        c.life_expectancy,
        c.population
      FROM fact_covid_stats f
      JOIN dim_country c ON f.country_id = c.country_id
      WHERE f.date_id = (SELECT date_id FROM TrueLatestDate)
        AND f.total_cases IS NOT NULL 
        AND f.stringency_index IS NOT NULL;
    `;
    
    const result = await query(sql);
    const rawData = result.rows;

    if (rawData.length === 0) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

    // 3. Feature Engineering: Log-Transform Skewed Features
    const smallConstant = 1e-9;
    const engineeredData = rawData.map(d => ({
      log_cases_per_capita: Math.log10(((d.total_cases || 0) / (d.population || 1)) + smallConstant),
      log_gdp: Math.log10((d.gdp_per_capita || 1000) + smallConstant),
      stringency: d.stringency_index || 0,
      life_expectancy: d.life_expectancy || 70
    }));

    // 4. Standardization (Z-score)
    const { scaledData } = standardize(engineeredData);

    // 5. Clustering (K-Means)
    const { clusters, inertia } = kMeans(scaledData, k);

    // 6. Dimensionality Reduction (PCA) for Visualization
    const pcaProjection = PCA(scaledData);

    // 7. Assembly
    const data = rawData.map((d, i) => ({
      country_name: d.country_name,
      continent: d.continent,
      cluster: clusters[i],
      pc1: pcaProjection[i].pc1,
      pc2: pcaProjection[i].pc2,
      gdp_per_capita: d.gdp_per_capita,
      total_cases: d.total_cases,
      population: d.population,
      life_expectancy: d.life_expectancy,
      stringency_index: d.stringency_index
    }));

    // 8. Diagnostics
    const clusterSizes = {};
    clusters.forEach(c => {
      clusterSizes[c] = (clusterSizes[c] || 0) + 1;
    });

    const output = {
      metadata: {
        k,
        clusterSizes,
        inertia,
        generatedAt: new Date().toISOString()
      },
      data
    };

    // 9. Save to Cache
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(cachePath, JSON.stringify(output, null, 2));
    console.log(`Clustering results saved to cache: ${cachePath}`);

    return NextResponse.json(output);
  } catch (error) {
    console.error('Clustering API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
