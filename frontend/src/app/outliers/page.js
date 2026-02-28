'use client';

export default function OutliersPage() {
  return (
    <div>
      <h1>Outliers Detection</h1>
      <div className="card">
        <h3>Extreme Death Rates</h3>
        <p>Identification of statistical anomalies in death per cases ratio across different regions.</p>
         <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#334155', borderRadius: '1rem', border: '2px dashed #94a3b8' }}>
           <p style={{ color: '#94a3b8' }}>Outlier Visualization Placeholder</p>
        </div>
      </div>
    </div>
  );
}
