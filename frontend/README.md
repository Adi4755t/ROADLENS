# RoadLens India — Frontend

A polished React dashboard for the **Indian Road Accident Pattern & Hotspot Analysis** project.

## What is included

- Dark, professional analytics UI
- Shadcn-style UI primitives (Card, Button, Badge, Select, Skeleton)
- Plotly interactive charts
- India accident hotspot map using latitude/longitude
- KPI cards
- Global filters: State, City, Year, Severity, Weather, Road Type
- Loading skeletons and connection error state
- Client-side filtering over the 20,000-record API dataset
- Responsive desktop/tablet/mobile layout

## Backend expected

The frontend expects your existing Node/Express backend at:

`http://localhost:5000/api`

The dashboard uses:

`GET /api/accidents`

No additional backend endpoint is required for this first frontend version.

## Run

From this `frontend` folder:

```bash
npm install
npm run dev
```

Open:

`http://localhost:5173`

If your backend uses a different URL, create `.env` from `.env.example` and change `VITE_API_URL`.

## Recommended project structure

```text
road-accident-analytics/
├── backend/
│   └── ... your existing Node backend
└── frontend/
    ├── src/
    ├── components.json
    ├── package.json
    └── ...
```

## Design direction

The dashboard intentionally avoids the generic "school dashboard" look. It uses a dark observability/analytics aesthetic, restrained cyan/violet accents, dense data panels, subtle grid texture, hover states, skeleton loading, and Plotly interactions so the visualizations remain the main focus.
