'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getRollupContinentYearCases, getDrilldownCountry, getSliceYear } from '@/services/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function OlapPage() {
  const [rollupData, setRollupData] = useState([]);
  const [sliceData, setSliceData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2021);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [drilldownData, setDrilldownData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

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

  useEffect(() => {
    if (selectedCountry) {
      setDrilldownLoading(true);
      getDrilldownCountry(selectedCountry)
        .then(res => {
          setDrilldownData(res.data);
          setDrilldownLoading(false);
        })
        .catch(err => {
          console.error(err);
          setDrilldownLoading(false);
        });
    }
  }, [selectedCountry]);

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
        <h3>Continent × Year → Total Cases (3D Surface)</h3>
        <Plot
          data={[{
            z: z,
            x: years,
            y: continents,
            type: 'surface',
            colorscale: 'Viridis',
            colorbar: { title: 'Total Cases', thickness: 20 },
          }]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#f8fafc' },
            scene: {
              xaxis: { title: 'Year', gridcolor: '#334155' },
              yaxis: { title: 'Continent', gridcolor: '#334155' },
              zaxis: { title: 'Total Cases', gridcolor: '#334155' },
              camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
            },
            margin: { t: 40, b: 0, l: 0, r: 0 },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '500px' }}
        />
      </div>

      <div className="card">
        <h3>Slice by Year & Drilldown</h3>
        <div className="controls">
          <label>Filter Year: </label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {[2020, 2021, 2022, 2023].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <label style={{ marginLeft: '1rem' }}>Drilldown Country: </label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
            <option value="">Select a country</option>
            {sliceData.map(d => (
              <option key={d.country_name} value={d.country_name}>{d.country_name}</option>
            ))}
          </select>
        </div>

        <Plot
          data={[{
            x: sliceData.slice(0, 15).map(d => d.country_name),
            y: sliceData.slice(0, 15).map(d => d.total_new_cases),
            type: 'bar',
            marker: { color: '#38bdf8' }
          }]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#f8fafc' },
            xaxis: { title: 'Country (Top 15 New Cases)' },
            yaxis: { title: 'New Cases' },
            margin: { t: 40, b: 80, l: 60, r: 20 },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '400px' }}
        />
      </div>

      {selectedCountry && (
        <div className="card">
          <h3>Drilldown: {selectedCountry} (Timeline)</h3>
          {drilldownLoading ? (
            <p>Loading timeline...</p>
          ) : (
            <Plot
              data={[
                {
                  x: drilldownData.map(d => d.date),
                  y: drilldownData.map(d => d.new_cases),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'New Cases',
                  line: { color: '#38bdf8' }
                },
                {
                  x: drilldownData.map(d => d.date),
                  y: drilldownData.map(d => d.new_deaths),
                  type: 'scatter',
                  mode: 'lines',
                  name: 'New Deaths',
                  line: { color: '#f87171' }
                }
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#f8fafc' },
                xaxis: { title: 'Date' },
                yaxis: { title: 'Daily Count' },
                margin: { t: 40, b: 40, l: 60, r: 20 },
                legend: { orientation: 'h', y: 1.1 }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '400px' }}
            />
          )}
        </div>
      )}
    </div>
  );
}
