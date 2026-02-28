# COVID-19 Data Visualization App

A production-ready full-stack web application for interactive COVID-19 data analysis using Supabase, Express, Next.js, and Plotly.js.

## Architecture
- **Framework**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes (Internal)
- **Visualization**: Plotly.js

## Project Structure
```text
/frontend
  src/app/api/olap/     # API Routes
  src/lib/db.js         # Database Connection
  src/components/       # UI Components
  src/services/api.js   # Client API logic
```

## Installation & Setup

1. **Navigate to the project**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   - Create a `.env` file in the `frontend/` folder.
   - Add your `DATABASE_URL`.
4. **Start the App**:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## API Endpoints
- `GET /api/rollup/continent-year-cases`: Heatmap data
- `GET /api/drilldown/country/:country_name`: Timeseries for specific country
- `GET /api/slice/year/:year`: Yearly aggregate across countries
- `GET /api/dice`: Filtered cube results (continent + date range)
- `GET /api/correlation`: Average metrics by continent
- `GET /api/scatter-data`: Data for the main overview scatter plot
