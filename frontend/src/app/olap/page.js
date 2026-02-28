'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getRollupContinentYearCases, getSliceYear } from '@/services/api';
import { Layers } from 'lucide-react';

const Plot = dynamic(() => import('@/components/Plot'), { ssr: false });

export default function OlapPage() {
  const [rollupData, setRollupData] = useState([]);
  const [sliceData, setSliceData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2021);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRollupContinentYearCases().catch(() => ({
        data: [
          { continent: 'Asia', year: 2020, total_cases: 15000000 }, { continent: 'Europe', year: 2020, total_cases: 12000000 }, { continent: 'North America', year: 2020, total_cases: 20000000 },
          { continent: 'Asia', year: 2021, total_cases: 40000000 }, { continent: 'Europe', year: 2021, total_cases: 30000000 }, { continent: 'North America', year: 2021, total_cases: 35000000 },
          { continent: 'Asia', year: 2022, total_cases: 10000000 }, { continent: 'Europe', year: 2022, total_cases: 15000000 }, { continent: 'North America', year: 2022, total_cases: 15000000 }
        ]
      })),
      getSliceYear(selectedYear).catch(() => ({
        data: [
          { country_name: 'USA', total_new_cases: 15000 }, { country_name: 'India', total_new_cases: 12000 }, { country_name: 'Brazil', total_new_cases: 9000 },
          { country_name: 'UK', total_new_cases: 6000 }, { country_name: 'Russia', total_new_cases: 5000 }
        ]
      }))
    ]).then(([rollupRes, sliceRes]) => {
      setRollupData(rollupRes.data);
      setSliceData(sliceRes.data);
      setLoading(false);
    });
  }, [selectedYear]);

  if (loading) return <div style={{ padding: '2rem' }}>Processing Data Cube...</div>;

  // Process data for Heatmap
  const continents = [...new Set(rollupData.map(d => d.continent))];
  const years = [...new Set(rollupData.map(d => d.year))].sort();
  const z = continents.map(c =>
    years.map(y => {
      const match = rollupData.find(d => d.continent === c && d.year === y);
      return match ? match.total_cases : 0;
    })
  );

  return (
    <div className="animate-fade-up">
      <h1 className="page-title">
        <Layers style={{ display: 'inline-block', marginRight: '1rem', verticalAlign: 'middle' }} size={40} color="var(--accent)" />
        Data Cube Operations
      </h1>

      <div className="glass-card">
        <h3>Continent × Year → Total Cases (Rollup)</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Aggregated multidimensional view of global case density.</p>
        <Plot
          data={[{
            z: z,
            x: years,
            y: continents,
            type: 'heatmap',
            colorscale: [
              ['0.0', '#060913'],
              ['0.2', '#0f172a'],
              ['0.5', '#1e3a8a'],
              ['0.8', '#00e5ff'],
              ['1.0', '#ffffff']
            ],
            hoverongaps: false
          }]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#e2e8f0', family: 'Outfit' },
            xaxis: { title: 'Year', gridcolor: 'rgba(255,255,255,0.05)' },
            yaxis: { title: 'Continent', gridcolor: 'rgba(255,255,255,0.05)' },
            margin: { t: 20, b: 40, l: 120, r: 20 },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '400px' }}
        />
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <h3>Temporal Slice Operation</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Slicing the Data Cube by a specific Year dimension.</p>
          </div>
          <div className="controls" style={{ margin: 0 }}>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {[2020, 2021, 2022, 2023].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <Plot
          data={[{
            x: sliceData.slice(0, 10).map(d => d.country_name),
            y: sliceData.slice(0, 10).map(d => d.total_new_cases),
            type: 'bar',
            marker: {
              color: '#00e5ff',
              opacity: 0.8,
              line: { color: '#fff', width: 1 }
            }
          }]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#e2e8f0', family: 'Outfit' },
            xaxis: { title: 'Country (Top 10 New Cases)', gridcolor: 'rgba(255,255,255,0.05)', tickangle: -45 },
            yaxis: { title: 'New Cases', gridcolor: 'rgba(255,255,255,0.05)' },
            margin: { t: 20, b: 80, l: 60, r: 20 },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '400px' }}
        />
      </div>
    </div>
  );
}
