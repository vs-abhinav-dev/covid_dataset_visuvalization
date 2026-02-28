'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';

export default function MLInsightsPage() {
    const documents = [
        {
            title: 'Advanced Insights',
            filename: 'ADVANCED_INSIGHTS.pdf',
            description: 'Comprehensive advanced analytical insights derived from the dataset.'
        },
        {
            title: 'Country-wise Clustering Analysis',
            filename: 'COUNTRY_WISE_CLUSTERING_ANALYSIS.pdf',
            description: 'Detailed analysis of clustering performed on various countries based on COVID-19 trajectories.'
        },
        {
            title: 'Country-wise Clustering Implementation',
            filename: 'COUNTRY_WISE_CLUSTERING_IMPLEMENTATION.pdf',
            description: 'Technical implementation details of the country-wise clustering models.'
        },
        {
            title: 'Detailed Low-Level Implementation & Insights',
            filename: 'DETAILED_LOW_LEVEL_IMPLEMENTATION_AND_INSIGHTS .pdf',
            description: 'An in-depth look into the low-level data processes, architectures, and resulting insights.'
        }
    ];

    return (
        <div className="animate-fade-up" style={{ padding: '2rem' }}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FileText size={40} color="var(--accent)" />
                ML Insights & Implementation
            </h1>

            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Explore our detailed machine learning analytical reports and implementation documentation directly below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {documents.map((doc, idx) => (
                    <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.25rem' }}>{doc.title}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', flexGrow: 1, lineHeight: '1.6' }}>
                            {doc.description}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <a
                                href={`/${doc.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1rem', background: '#0f172a',
                                    color: '#00e5ff', textDecoration: 'none',
                                    borderRadius: '4px', border: '1px solid #1e293b',
                                    fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s', flex: 1, justifyContent: 'center'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#0f172a'}
                            >
                                <ExternalLink size={16} /> Open PDF
                            </a>
                            <a
                                href={`/${doc.filename}`}
                                download
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1rem', background: 'transparent',
                                    color: '#e2e8f0', textDecoration: 'none',
                                    borderRadius: '4px', border: '1px solid #334155',
                                    fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <Download size={16} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
