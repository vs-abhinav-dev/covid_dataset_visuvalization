'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getClustering } from '@/services/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ClusteringPage() {
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [k, setK] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getClustering(k)
      .then(res => {
        setData(res.data.data);
        setMetadata(res.data.metadata);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch clustering data.');
        setLoading(false);
      });
  }, [k]);

  if (loading && data.length === 0) return <div>Initializing ML Pipeline...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const clusterColors = ['#38bdf8', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#60a5fa', '#fcd34d'];

  return (
    <div>
      <h1>K-Means Clustering (PCA Projection)</h1>
      <p>
        Advanced clustering using <b>Log-Transform</b> and <b>Z-score Standardization</b>.
        The 4D feature space (GDP, Cases, Stringency, Life Expectancy) is reduced to 2D using <b>Principal Component Analysis (PCA)</b>.
      </p>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="controls" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <label style={{ color: '#0f172a' }}>Number of Clusters (k): </label>
            <select value={k} onChange={(e) => setK(parseInt(e.target.value))} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
              {[2, 3, 4, 5, 6, 7, 8].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
          {metadata && (
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Inertia (WCSS): <b>{metadata.inertia.toFixed(2)}</b>
            </div>
          )}
        </div>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3>PCA Projection (PC1 vs PC2)</h3>
          <Plot
            data={[{
              x: data.map(d => d.pc1),
              y: data.map(d => d.pc2),
              mode: 'markers',
              type: 'scatter',
              text: data.map(d => `${d.country_name}<br>Cluster: ${d.cluster}`),
              marker: {
                size: 12,
                color: data.map(d => clusterColors[d.cluster % clusterColors.length]),
                opacity: 0.8,
                line: { width: 1, color: 'rgba(0,0,0,0.2)' }
              }
            }]}
            layout={{
              autosize: true,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#0f172a', family: 'Outfit' },
              xaxis: { title: 'Principal Component 1', gridcolor: 'rgba(0,0,0,0.05)' },
              yaxis: { title: 'Principal Component 2', gridcolor: 'rgba(0,0,0,0.05)' },
              hovermode: 'closest',
              margin: { t: 20, b: 40, l: 40, r: 20 },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '500px' }}
          />
        </div>

        <div className="card">
          <h3>Socio-Economic Interpretation</h3>
          <Plot
            data={[{
              x: data.map(d => d.gdp_per_capita),
              y: data.map(d => (d.total_cases / d.population) * 100000),
              mode: 'markers',
              type: 'scatter',
              text: data.map(d => `${d.country_name}<br>GDP: $${d.gdp_per_capita?.toLocaleString()}`),
              marker: {
                size: 10,
                color: data.map(d => clusterColors[d.cluster % clusterColors.length]),
                opacity: 0.6,
              }
            }]}
            layout={{
              autosize: true,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#0f172a', family: 'Outfit' },
              xaxis: { title: 'GDP per Capita (Raw)', type: 'log', gridcolor: 'rgba(0,0,0,0.05)' },
              yaxis: { title: 'Cases per 100k', type: 'log', gridcolor: 'rgba(0,0,0,0.05)' },
              margin: { t: 20, b: 40, l: 60, r: 20 },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '500px' }}
          />
        </div>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {Object.keys(metadata?.clusterSizes || {}).map(clusterId => (
          <div key={clusterId} className="card" style={{ marginBottom: 0, borderTop: `4px solid ${clusterColors[clusterId % clusterColors.length]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, color: clusterColors[clusterId % clusterColors.length] }}>Cluster {clusterId}</h4>
              <span className="badge" style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                {metadata.clusterSizes[clusterId]} countries
              </span>
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem', color: '#475569' }}>
              {data.filter(d => d.cluster === parseInt(clusterId)).map(d => (
                <div key={d.country_name} style={{ padding: '2px 0' }}>{d.country_name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
