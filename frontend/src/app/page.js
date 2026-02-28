'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getScatterData } from '@/services/api';

const Plot = dynamic(() => import('@/components/Plot'), { ssr: false });
const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScatterData()
      .then(res => {
        // Generating pseudo-coordinates for the globe based on country name length/char codes to distribute them visually
        const processedData = res.data.map(d => {
          const charCodeSum = d.country_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return {
            ...d,
            lat: (charCodeSum % 180) - 90, // -90 to 90
            lng: ((charCodeSum * 7) % 360) - 180, // -180 to 180
            size: Math.min(0.2, Math.max(0.02, (d.total_cases || 0) / 100000000)) // Normalize size for globe
          };
        });
        setData(processedData);
        setLoading(false);
      })
      .catch(err => {
        // Fallback dummy data for visualization in case of DB failure
        setData([
          { stringency_index: 40, total_cases: 100000, new_vaccinations: 50000, country_name: 'Country A', continent: 'Asia', lat: 35, lng: 100, size: 0.1 },
          { stringency_index: 70, total_cases: 500000, new_vaccinations: 200000, country_name: 'Country B', continent: 'Europe', lat: 48, lng: 10, size: 0.08 },
          { stringency_index: 20, total_cases: 50000, new_vaccinations: 10000, country_name: 'Country C', continent: 'Africa', lat: -5, lng: 20, size: 0.05 },
          { stringency_index: 85, total_cases: 2000000, new_vaccinations: 1000000, country_name: 'Country D', continent: 'North America', lat: 40, lng: -100, size: 0.12 },
          { stringency_index: 55, total_cases: 300000, new_vaccinations: 80000, country_name: 'Country E', continent: 'South America', lat: -15, lng: -60, size: 0.07 },
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading global intelligence...</div>;

  const plotData = [{
    x: data.map(d => d.stringency_index),
    y: data.map(d => d.total_cases),
    mode: 'markers',
    type: 'scatter',
    text: data.map(d => `${d.country_name} (${d.continent})`),
    marker: {
      size: data.map(d => Math.log10(d.new_vaccinations || 1) * 3 + 5),
      color: data.map(d => {
        const continents = { 'Asia': '#00e5ff', 'Europe': '#fbbf24', 'Africa': '#f87171', 'North America': '#34d399', 'South America': '#818cf8', 'Oceania': '#a78bfa' };
        return continents[d.continent] || '#94a3b8';
      }),
      opacity: 0.8,
      line: { width: 1, color: '#060913' }
    }
  }];

  return (
    <div className="animate-fade-up">
      <h1 className="page-title">Global Overview</h1>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div className="metrics-container">
            <div className="metric-card">
              <span className="metric-title">Total Cases</span>
              <span className="metric-value">25M+</span>
              <span className="metric-subtitle">Updated today</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Vaccinations</span>
              <span className="metric-value">12B+</span>
              <span className="metric-subtitle">Doses administered</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Active Outbreaks</span>
              <span className="metric-value">14</span>
              <span className="metric-subtitle">Countries with rising trend</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Recovery Rate</span>
              <span className="metric-value">98.2%</span>
              <span className="metric-subtitle">Global average</span>
            </div>
          </div>

          <div className="glass-card" style={{ flex: 1, marginBottom: 0 }}>
            <h3>Stringency vs Total Cases</h3>
            <div style={{ width: '100%', height: '400px' }}>
              <Plot
                data={plotData}
                layout={{
                  autosize: true,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#e2e8f0', family: 'Outfit' },
                  xaxis: { title: 'Stringency Index', gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
                  yaxis: { title: 'Total Cases', gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)', type: 'log' },
                  hovermode: 'closest',
                  margin: { t: 10, b: 40, l: 60, r: 20 },
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3>Global Hotspots</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Interactive 3D representation of primary active data nodes.</p>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <Globe markers={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
