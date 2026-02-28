'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getOutliers } from '@/services/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const METRICS = [
  { key: 'death_rate',       label: 'Death Rate (deaths / cases)' },
  { key: 'cases_per_capita', label: 'Cases per Capita' },
  { key: 'excess_mortality', label: 'Excess Mortality' },
  { key: 'icu_per_capita',   label: 'ICU Patients per Capita' },
];

const CONTINENTS = ['', 'Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];

export default function OutliersPage() {
  const [metric, setMetric]         = useState('death_rate');
  const [continent, setContinent]   = useState('');
  const [method, setMethod]         = useState('IQR');   // IQR | Z-Score
  const [logScale, setLogScale]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [responseData, setResponseData] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    getOutliers(metric, continent || undefined)
      .then(res => {
        setResponseData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.error || 'Failed to fetch outlier data.');
        setLoading(false);
      });
  }, [metric, continent]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const metricLabel = METRICS.find(m => m.key === metric)?.label || metric;

  const isOutlierKey = method === 'IQR' ? 'isOutlier_IQR' : 'isOutlier_Z';

  const data        = responseData?.data        || [];
  const meta        = responseData?.metadata    || {};
  const thresholds  = meta.thresholds           || {};

  const outliers  = data.filter(d => d[isOutlierKey]);
  const normals   = data.filter(d => !d[isOutlierKey]);

  const validValues = data.map(d => d.metric_value).filter(v => v !== null && isFinite(v));

  const cardStyle = { background: '#1e293b', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' };
  const selectStyle = { padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: '#334155', color: '#f1f5f9', border: '1px solid #475569', cursor: 'pointer' };
  const labelStyle    = { color: '#94a3b8', fontSize: '0.85rem', marginRight: '0.5rem' };

  return (
    <div style={{ padding: '2rem', color: '#f1f5f9' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Outlier Detection Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Statistical anomaly detection using <b>IQR</b> (Tukey Fence) and <b>Z-Score</b> methods across COVID-19 epidemiological metrics.
      </p>

      {/* ── Controls ── */}
      <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
        <div>
          <span style={labelStyle}>Metric:</span>
          <select style={selectStyle} value={metric} onChange={e => setMetric(e.target.value)}>
            {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Continent:</span>
          <select style={selectStyle} value={continent} onChange={e => setContinent(e.target.value)}>
            {CONTINENTS.map(c => <option key={c} value={c}>{c || 'All Continents'}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Detection Method:</span>
          <select style={selectStyle} value={method} onChange={e => setMethod(e.target.value)}>
            <option value="IQR">IQR (Tukey Fence)</option>
            <option value="Z-Score">Z-Score (|z| &gt; 3)</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input type="checkbox" id="logscale" checked={logScale} onChange={e => setLogScale(e.target.checked)} />
          <label htmlFor="logscale" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Log Scale</label>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {!loading && meta.totalCountries && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Countries', value: meta.totalCountries },
            { label: 'Outliers Flagged', value: outliers.length, color: '#f87171' },
            { label: 'Normal Countries', value: normals.length, color: '#34d399' },
            ...(method === 'IQR' && thresholds.iqr?.lower !== null ? [
              { label: 'IQR Lower Bound', value: thresholds.iqr.lower?.toExponential(3) },
              { label: 'IQR Upper Bound', value: thresholds.iqr.upper?.toExponential(3) },
            ] : []),
            ...(method === 'Z-Score' ? [
              { label: 'μ (Mean)', value: thresholds.zscore?.mean?.toExponential(3) },
              { label: 'σ (Std Dev)', value: thresholds.zscore?.std?.toExponential(3) },
            ] : []),
          ].map(stat => (
            <div key={stat.label} style={{ ...cardStyle, marginBottom: 0, flex: '1 0 120px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: stat.color || '#38bdf8' }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Running outlier detection…</div>}
      {error   && <div style={{ color: '#f87171', padding: '1rem' }}>{error}</div>}

      {!loading && !error && data.length > 0 && (
        <>
          {/* ── Viz 1: Box Plot ── */}
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Distribution & Outliers — {metricLabel}</h3>
            <Plot
              data={[
                {
                  y: validValues,
                  type: 'box',
                  name: 'All Countries',
                  marker: { color: '#38bdf8', outliercolor: '#f87171' },
                  boxpoints: 'all',
                  jitter: 0.4,
                  pointpos: -1.8,
                  text: data.map(d => `${d.country_name} (${d[isOutlierKey] ? '⚠ Outlier' : 'Normal'})`),
                  hovertemplate: '%{text}<br>Value: %{y:.6f}<extra></extra>',
                },
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#f8fafc' },
                yaxis: { title: metricLabel, type: logScale ? 'log' : 'linear', gridcolor: '#334155' },
                margin: { t: 20, b: 40, l: 80, r: 20 },
                showlegend: false,
              }}
              useResizeHandler
              style={{ width: '100%', height: '420px' }}
            />
          </div>

          {/* ── Viz 2: Scatter GDP vs Death Rate ── */}
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>GDP per Capita vs Death Rate — Outlier Map</h3>
            <Plot
              data={[
                {
                  name: 'Normal',
                  x: normals.map(d => d.gdp_per_capita),
                  y: normals.map(d => d.death_rate),
                  mode: 'markers',
                  type: 'scatter',
                  text: normals.map(d => `${d.country_name}<br>GDP: $${d.gdp_per_capita?.toLocaleString()}<br>Death Rate: ${(d.death_rate * 100)?.toFixed(2)}%`),
                  hovertemplate: '%{text}<extra></extra>',
                  marker: { size: 9, color: '#34d399', opacity: 0.7, line: { width: 0.5, color: '#1e293b' } },
                },
                {
                  name: '⚠ Outlier',
                  x: outliers.map(d => d.gdp_per_capita),
                  y: outliers.map(d => d.death_rate),
                  mode: 'markers',
                  type: 'scatter',
                  text: outliers.map(d => `⚠ ${d.country_name}<br>GDP: $${d.gdp_per_capita?.toLocaleString()}<br>Death Rate: ${(d.death_rate * 100)?.toFixed(2)}%`),
                  hovertemplate: '%{text}<extra></extra>',
                  marker: { size: 13, color: '#f87171', opacity: 0.9, symbol: 'diamond', line: { width: 1, color: '#fff' } },
                },
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#f8fafc' },
                xaxis: { title: 'GDP per Capita (log)', type: 'log', gridcolor: '#334155' },
                yaxis: { title: 'Death Rate', type: logScale ? 'log' : 'linear', gridcolor: '#334155' },
                legend: { orientation: 'h', y: 1.1 },
                hovermode: 'closest',
                margin: { t: 20, b: 60, l: 80, r: 20 },
              }}
              useResizeHandler
              style={{ width: '100%', height: '480px' }}
            />
          </div>

          {/* ── Viz 3: Flagged Countries Table ── */}
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>⚠ Flagged Outlier Countries ({outliers.length})</h3>
            {outliers.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No outliers detected for the current selection.</p>
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#1e293b' }}>
                    <tr>
                      {['Country', 'Continent', 'Death Rate', 'Cases/Capita', 'ICU/Capita', 'Excess Mortality', 'IQR Flag', 'Z Flag'].map(h => (
                        <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {outliers
                      .sort((a, b) => (b.metric_value || 0) - (a.metric_value || 0))
                      .map((d, i) => (
                        <tr key={d.country_name} style={{ background: i % 2 === 0 ? '#0f172a' : 'transparent' }}>
                          <td style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>{d.country_name}</td>
                          <td style={{ padding: '0.5rem 1rem', color: '#94a3b8' }}>{d.continent}</td>
                          <td style={{ padding: '0.5rem 1rem' }}>{d.death_rate !== null ? `${(d.death_rate * 100).toFixed(3)}%` : '—'}</td>
                          <td style={{ padding: '0.5rem 1rem' }}>{d.cases_per_capita !== null ? d.cases_per_capita.toExponential(3) : '—'}</td>
                          <td style={{ padding: '0.5rem 1rem' }}>{d.icu_per_capita !== null ? d.icu_per_capita.toExponential(3) : '—'}</td>
                          <td style={{ padding: '0.5rem 1rem' }}>{d.excess_mortality !== null ? d.excess_mortality.toFixed(2) : '—'}</td>
                          <td style={{ padding: '0.5rem 1rem' }}>
                            <span style={{ background: d.isOutlier_IQR ? '#7f1d1d' : '#14532d', color: d.isOutlier_IQR ? '#f87171' : '#86efac', padding: '0.15rem 0.5rem', borderRadius: '0.5rem' }}>
                              {d.isOutlier_IQR ? '⚠ Yes' : 'No'}
                            </span>
                          </td>
                          <td style={{ padding: '0.5rem 1rem' }}>
                            <span style={{ background: d.isOutlier_Z ? '#7f1d1d' : '#14532d', color: d.isOutlier_Z ? '#f87171' : '#86efac', padding: '0.15rem 0.5rem', borderRadius: '0.5rem' }}>
                              {d.isOutlier_Z ? '⚠ Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
