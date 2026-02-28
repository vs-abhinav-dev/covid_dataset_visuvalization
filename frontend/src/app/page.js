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
    Promise.all([
      getScatterData(),
      fetch('/country-coords.json').then(res => res.json())
    ]).then(([res, coordsMap]) => {
      const processedData = res.data.map(d => {
        const coords = coordsMap[d.country_name];
        // Fallback coordinate generation if country mapping misses
        let lat = 0, lng = 0;
        if (coords && coords.lat) {
          lat = coords.lat;
          lng = coords.lng;
        } else {
          const charCodeSum = d.country_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          lat = (charCodeSum % 180) - 90;
          lng = ((charCodeSum * 7) % 360) - 180;
        }
        return {
          ...d,
          lat,
          lng,
          size: Math.min(0.2, Math.max(0.02, (d.total_cases || 0) / 100000000))
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
    text: data.map(d => `${d.country_name} (${d.continent})<br>Cases: ${d.total_cases}<br>Vax: ${d.new_vaccinations}`),
    marker: {
      size: data.map(d => Math.min(35, Math.log10(d.new_vaccinations || 1) * 3 + 5)),
      color: data.map(d => {
        const continents = { 'Asia': '#00e5ff', 'Europe': '#fbbf24', 'Africa': '#f87171', 'North America': '#34d399', 'South America': '#818cf8', 'Oceania': '#a78bfa' };
        return continents[d.continent] || '#94a3b8';
      }),
      opacity: 0.7,
      line: { width: 1, color: 'rgba(0,0,0,0.2)' }
    }
  }];

  return (
    <div className="animate-fade-up">
      <h1 className="page-title">Global Overview</h1>

      <div
        className="globe-background"
        style={{
          position: 'fixed',
          top: 0,
          right: '-20%',
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          opacity: 0.15,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ width: '120vh', height: '120vh' }}>
          <Globe markers={data} />
        </div>
      </div>

      <div className="dashboard-grid-dual animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 1fr)', gap: '2.5rem', marginTop: '2rem', zIndex: 1 }}>
        <div className="glass-card animate-pulse-border" style={{ flex: 1, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <h3>Stringency vs Total Cases</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Global overview of COVID-19 Stringency Index mapped against total cases registered and vaccination rollout sizes.</p>
          <div style={{ width: '100%', flex: 1, minHeight: '500px' }}>
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#0f172a', family: 'Outfit' },
                xaxis: { title: 'Stringency Index', gridcolor: 'rgba(0,0,0,0.05)', zerolinecolor: 'rgba(0,0,0,0.1)' },
                yaxis: { title: 'Total Cases', gridcolor: 'rgba(0,0,0,0.05)', zerolinecolor: 'rgba(0,0,0,0.1)', type: 'log' },
                hovermode: 'closest',
                margin: { t: 10, b: 40, l: 60, r: 20 },
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
