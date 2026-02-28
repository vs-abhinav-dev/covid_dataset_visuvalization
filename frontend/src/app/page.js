'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getScatterData } from '@/services/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getScatterData()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch data. Please check if the backend is running and connected.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const plotData = [{
    x: data.map(d => d.stringency_index),
    y: data.map(d => d.total_cases),
    mode: 'markers',
    type: 'scatter',
    text: data.map(d => `${d.country_name} (${d.continent})`),
    marker: {
      size: data.map(d => Math.log10(d.new_vaccinations || 1) * 3 + 5),
      color: data.map(d => {
        const continents = { 'Asia': '#38bdf8', 'Europe': '#fbbf24', 'Africa': '#f87171', 'North America': '#34d399', 'South America': '#818cf8', 'Oceania': '#a78bfa' };
        return continents[d.continent] || '#94a3b8';
      }),
      opacity: 0.7,
      line: { width: 1, color: '#1e293b' }
    }
  }];

  return (
    <div>
      <h1>COVID-19 Overview</h1>
      <div className="card">
        <h3>Stringency vs Total Cases (Size: Vaccinations)</h3>
        <Plot
          data={plotData}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#f8fafc' },
            xaxis: { title: 'Stringency Index', gridcolor: '#334155' },
            yaxis: { title: 'Total Cases', gridcolor: '#334155', type: 'log' },
            hovermode: 'closest',
            margin: { t: 40, b: 40, l: 60, r: 20 },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '500px' }}
        />
      </div>
    </div>
  );
}
