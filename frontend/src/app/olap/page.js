'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getRollupContinentYearCases, getSliceYear, getDice, getDrilldownCountry, getCountries } from '@/services/api';
import { Layers } from 'lucide-react';

const Plot = dynamic(() => import('@/components/Plot'), { ssr: false });

export default function OlapPage() {
  const [rollupData, setRollupData] = useState([]);

  const [sliceData, setSliceData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2021);

  const [diceData, setDiceData] = useState([]);
  const [diceContinent, setDiceContinent] = useState('Europe');
  const [diceStartYear, setDiceStartYear] = useState(2020);
  const [diceEndYear, setDiceEndYear] = useState(2021);

  const [drilldownData, setDrilldownData] = useState([]);
  const [drilldownCountry, setDrilldownCountry] = useState('United States');
  const [countriesList, setCountriesList] = useState([]);

  const [loading, setLoading] = useState(true);

  // Load countries
  useEffect(() => {
    getCountries().then(res => setCountriesList(res.data)).catch(() => setCountriesList([]));
  }, []);

  // Load static rollup
  useEffect(() => {
    getRollupContinentYearCases().then(res => {
      setRollupData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Load temporal slice
  useEffect(() => {
    getSliceYear(selectedYear).then(res => setSliceData(res.data)).catch(() => setSliceData([]));
  }, [selectedYear]);

  // Load dice combination
  useEffect(() => {
    getDice({ continent: diceContinent, start_year: diceStartYear, end_year: diceEndYear })
      .then(res => setDiceData(res.data)).catch(() => setDiceData([]));
  }, [diceContinent, diceStartYear, diceEndYear]);

  // Load drilldown details
  useEffect(() => {
    if (drilldownCountry) {
      getDrilldownCountry(drilldownCountry).then(res => setDrilldownData(res.data)).catch(() => setDrilldownData([]));
    }
  }, [drilldownCountry]);

  if (loading) return <div style={{ padding: '2rem' }}>Processing Data Cube...</div>;

  // Process data for Heatmap (Rollup)
  const continents = [...new Set(rollupData.map(d => d.continent))];
  const years = [...new Set(rollupData.map(d => d.year))].sort();
  const z = continents.map(c =>
    years.map(y => {
      const match = rollupData.find(d => d.continent === c && d.year === y);
      return match ? match.total_cases : 0;
    })
  );

  // Process data for Dice (Grouped by Year)
  const diceYears = [...new Set(diceData.map(d => d.year))].sort();
  const diceCountries = [...new Set(diceData.map(d => d.country_name))];
  const dicePlotData = diceYears.map(year => {
    return {
      name: `Year ${year}`,
      type: 'bar',
      x: diceCountries,
      y: diceCountries.map(c => {
        const match = diceData.find(d => d.year === year && d.country_name === c);
        return match ? match.total_new_cases : 0;
      })
    };
  });

  return (
    <div className="animate-fade-up">
      <h1 className="page-title">
        <Layers style={{ display: 'inline-block', marginRight: '1rem', verticalAlign: 'middle' }} size={40} color="var(--accent)" />
        Data Cube Operations
      </h1>

      {/* ROLLUP */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
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

      {/* SLICE */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <h3>Temporal Slice Operation</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Slicing the Data Cube by a specific Year dimension (All Countries).</p>
          </div>
          <div className="controls" style={{ margin: 0 }}>
            <select className="ui-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: '0.5rem', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
              {[2020, 2021, 2022, 2023, 2024].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <Plot
          data={[{
            x: sliceData.map(d => d.country_name),
            y: sliceData.map(d => d.total_new_cases),
            type: 'bar',
            marker: {
              color: '#00e5ff',
              opacity: 0.8,
            }
          }]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#e2e8f0', family: 'Outfit' },
            xaxis: {
              title: 'Country',
              gridcolor: 'rgba(255,255,255,0.05)',
              tickangle: -90,
              tickfont: { size: 9 },
              fixedrange: false
            },
            yaxis: { title: 'Total New Cases', gridcolor: 'rgba(255,255,255,0.05)', fixedrange: false },
            margin: { t: 20, b: 120, l: 80, r: 20 },
            dragmode: 'pan',
          }}
          config={{ scrollZoom: true }}
          useResizeHandler={true}
          style={{ width: '100%', height: '500px' }}
        />
      </div>

      {/* DICE */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <h3>Dice Operation</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sub-cube via Continent and Year Range boundaries.</p>
          </div>
          <div className="controls" style={{ margin: 0, display: 'flex', gap: '1rem' }}>
            <select value={diceContinent} onChange={(e) => setDiceContinent(e.target.value)} style={{ padding: '0.5rem', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
              {['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={diceStartYear} onChange={(e) => setDiceStartYear(e.target.value)} style={{ padding: '0.5rem', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
              {[2020, 2021, 2022, 2023, 2024].map(y => <option key={y} value={y}>Start {y}</option>)}
            </select>
            <select value={diceEndYear} onChange={(e) => setDiceEndYear(e.target.value)} style={{ padding: '0.5rem', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
              {[2020, 2021, 2022, 2023, 2024].map(y => <option key={y} value={y}>End {y}</option>)}
            </select>
          </div>
        </div>
        <Plot
          data={dicePlotData}
          layout={{
            barmode: 'group',
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#e2e8f0', family: 'Outfit' },
            xaxis: { title: 'Country', gridcolor: 'rgba(255,255,255,0.05)', tickangle: -90, tickfont: { size: 9 } },
            yaxis: { title: 'Total New Cases', gridcolor: 'rgba(255,255,255,0.05)', tickformat: '.2s' },
            margin: { t: 20, b: 120, l: 60, r: 20 },
            colorway: ['#00e5ff', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e']
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '500px' }}
        />
      </div>

      {/* DRILLDOWN */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <h3>Drill-Down Operation</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Navigating from Country level down to daily timeline granulary.</p>
          </div>
          <div className="controls" style={{ margin: 0 }}>
            <select value={drilldownCountry} onChange={(e) => setDrilldownCountry(e.target.value)} style={{ padding: '0.5rem', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px', maxWidth: '300px' }}>
              {countriesList.map(c => (
                <option key={c.country_name} value={c.country_name}>{c.country_name}</option>
              ))}
            </select>
          </div>
        </div>
        <Plot
          data={[
            {
              x: drilldownData.map(d => d.date),
              y: drilldownData.map(d => d.new_cases),
              name: 'New Cases',
              type: 'scatter',
              mode: 'lines',
              line: { color: '#00e5ff', width: 2 }
            },
            {
              x: drilldownData.map(d => d.date),
              y: drilldownData.map(d => d.new_deaths),
              name: 'New Deaths',
              type: 'scatter',
              mode: 'lines',
              line: { color: '#ef4444', width: 2 },
              yaxis: 'y2'
            }
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#e2e8f0', family: 'Outfit' },
            xaxis: { title: 'Date', gridcolor: 'rgba(255,255,255,0.05)' },
            yaxis: { title: 'New Cases', gridcolor: 'rgba(255,255,255,0.05)' },
            yaxis2: { title: 'New Deaths', overlaying: 'y', side: 'right', gridcolor: 'rgba(255,255,255,0.0)' },
            margin: { t: 20, b: 40, l: 60, r: 60 },
            legend: { orientation: 'h', y: 1.1 }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '400px' }}
        />
      </div>

    </div>
  );
}
