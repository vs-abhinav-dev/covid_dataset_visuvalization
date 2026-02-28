'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getRollupContinentYearCases, getDrilldownCountry, getSliceYear } from '@/services/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function OlapPage() {
  const [rollupData, setRollupData] = useState([]);
  const [sliceData, setSliceData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2021);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRollupContinentYearCases(),
      getSliceYear(selectedYear)
    ]).then(([rollupRes, sliceRes]) => {
      setRollupData(rollupRes.data);
      setSliceData(sliceRes.data);
      setLoading(false);
    });
  }, [selectedYear]);

  if (loading) return <div>Loading OLAP analytics...</div>;

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
    <div>
      <h1>OLAP Analysis</h1>

      <div className="card">
        <h3>Continent × Year → Total Cases (Heatmap)</h3>
        <Plot
          data={[{
            z: z,
            x: years,
            y: continents,
            type: 'heatmap',
            colorscale: 'Viridis',
          }]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#f8fafc' },
            xaxis: { title: 'Year' },
            yaxis: { title: 'Continent' },
            margin: { t: 40, b: 40, l: 120, r: 20 },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '400px' }}
        />
      </div>

      <div className="card">
        <h3>Slice by Year</h3>
        <div className="controls">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {[2020, 2021, 2022, 2023].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <Plot
          data={[{
            x: sliceData.slice(0, 10).map(d => d.country_name),
            y: sliceData.slice(0, 10).map(d => d.total_new_cases),
            type: 'bar',
            marker: { color: '#38bdf8' }
          }]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#f8fafc' },
            xaxis: { title: 'Country (Top 10 New Cases)' },
            yaxis: { title: 'New Cases' },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '400px' }}
        />
      </div>
    </div>
  );
}
