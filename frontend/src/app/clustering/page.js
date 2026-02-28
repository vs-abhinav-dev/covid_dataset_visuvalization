'use client';

export default function ClusteringPage() {
  return (
    <div>
      <h1>Clustering Analysis</h1>
      <div className="card">
        <h3>K-Means Clustering (Draft)</h3>
        <p>This visualization will present countries grouped by their socio-economic and health response similarity.</p>
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#334155', borderRadius: '1rem', border: '2px dashed #94a3b8' }}>
           <p style={{ color: '#94a3b8' }}>Cluster Visualization Placeholder</p>
        </div>
      </div>
    </div>
  );
}
