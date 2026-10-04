import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Car,
  ChevronDown,
  CircleDot,
  CloudRain,
  Gauge,
  Globe2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
  Target,
  TrendingUp,
  TriangleAlert,
  X
} from 'lucide-react'

import { PlotChart } from './components/charts/Plot'

const API =
  import.meta.env.VITE_API_URL ||
  'https://roadlens-1.onrender.com/api'

const INITIAL_FILTERS = {
  state: 'all',
  city: 'all',
  year: 'all',
  severity: 'all',
  weather: 'all',
  roadType: 'all'
}

/* ------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------ */

function number(value) {
  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : 0
}

function titleCase(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    )
}

function uniqueSorted(rows, key) {
  return [
    ...new Set(
      rows
        .map(row => row[key])
        .filter(Boolean)
    )
  ].sort((a, b) =>
    String(a).localeCompare(String(b))
  )
}

function countBy(rows, key) {
  const counts = {}

  rows.forEach(row => {
    const value = row[key]

    if (!value) {
      return
    }

    counts[value] =
      (counts[value] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
}

/* Dataset uses DD-MM-YYYY */

function parseDate(value) {
  if (!value) {
    return null
  }

  const parts = String(value).split('-')

  if (parts.length !== 3) {
    return null
  }

  const [
    day,
    month,
    year
  ] = parts.map(Number)

  if (
    !day ||
    !month ||
    !year
  ) {
    return null
  }

  return new Date(
    year,
    month - 1,
    day
  )
}

function formatMonth(date) {
  return date.toLocaleDateString(
    'en-IN',
    {
      month: 'short',
      year: 'numeric'
    }
  )
}

function getRiskState(score) {
  const value = Number(score)

  if (value >= 0.7) {
    return 'danger'
  }

  if (value >= 0.45) {
    return 'warning'
  }

  return 'safe'
}

/* ------------------------------------------------ */
/* SMALL UI COMPONENTS */
/* ------------------------------------------------ */

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
  right
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Icon
            size={14}
            className="text-[#7cff6b]"
          />

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#697169]">
            {eyebrow}
          </span>
        </div>

        <h2 className="text-lg font-bold tracking-tight text-[#f3f4ee]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs text-[#697169]">
            {description}
          </p>
        )}
      </div>

      {right}
    </div>
  )
}

function Panel({
  children,
  className = ''
}) {
  return (
    <div
      className={`
        traffic-surface
        rounded-2xl
        ${className}
      `}
    >
      {children}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent = 'green'
}) {
  const accents = {
    green: {
      icon: '#7cff6b',
      bg: 'rgba(124,255,107,.08)',
      border: 'rgba(124,255,107,.13)'
    },

    amber: {
      icon: '#ffc857',
      bg: 'rgba(255,200,87,.08)',
      border: 'rgba(255,200,87,.13)'
    },

    red: {
      icon: '#ff4d4d',
      bg: 'rgba(255,77,77,.08)',
      border: 'rgba(255,77,77,.13)'
    },

    neutral: {
      icon: '#d5d8d2',
      bg: 'rgba(255,255,255,.045)',
      border: 'rgba(255,255,255,.08)'
    }
  }

  const theme =
    accents[accent] ||
    accents.green

  return (
    <Panel className="group relative overflow-hidden p-5">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            `linear-gradient(90deg, transparent, ${theme.icon}, transparent)`,
          opacity: 0.45
        }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#687068]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#f3f4ee]">
            {value}
          </p>

          {subtext && (
            <p className="mt-1 text-[11px] text-[#697169]">
              {subtext}
            </p>
          )}
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            color: theme.icon,
            background: theme.bg,
            border:
              `1px solid ${theme.border}`
          }}
        >
          <Icon size={17} />
        </div>
      </div>
    </Panel>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-[#626a62]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={event =>
            onChange(event.target.value)
          }
          className="
            h-9
            w-full
            appearance-none
            rounded-lg
            border
            border-white/[0.07]
            bg-[#0a0d0b]
            px-3
            pr-8
            text-[11px]
            font-medium
            text-[#d9ddd6]
            outline-none
            transition
            hover:border-white/[0.12]
            focus:border-[#7cff6b]/30
            focus:ring-1
            focus:ring-[#7cff6b]/10
          "
        >
          <option value="all">
            All
          </option>

          {options.map(option => (
            <option
              key={option}
              value={option}
            >
              {titleCase(option)}
            </option>
          ))}
        </select>

        <ChevronDown
          size={13}
          className="
            pointer-events-none
            absolute
            right-2.5
            top-1/2
            -translate-y-1/2
            text-[#596159]
          "
        />
      </div>
    </div>
  )
}

function Skeleton({
  className = ''
}) {
  return (
    <div
      className={`
        animate-pulse
        rounded-xl
        bg-white/[0.035]
        ${className}
      `}
    />
  )
}

/* ------------------------------------------------ */
/* APP */
/* ------------------------------------------------ */

export default function App() {
  const [
    rows,
    setRows
  ] = useState([])

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState('')

  const [
    refreshing,
    setRefreshing
  ] = useState(false)

  const [
    filters,
    setFilters
  ] = useState(
    INITIAL_FILTERS
  )

  /* ---------------------------------------------- */
  /* FETCH DATA */
  /* ---------------------------------------------- */

  async function loadData(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response =
        await fetch(
          `${API}/accidents`
        )

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}`
        )
      }

      const data =
        await response.json()

      if (!Array.isArray(data)) {
        throw new Error(
          'Invalid API response'
        )
      }

      setRows(data)
    } catch (err) {
      console.error(err)

      setError(
        err?.message ||
        'Unable to connect to backend'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  /* ---------------------------------------------- */
  /* FILTER OPTIONS */
  /* ---------------------------------------------- */

  const filterBaseRows =
    useMemo(() => {
      return rows.filter(row => {
        if (
          filters.state !== 'all' &&
          row.state !== filters.state
        ) {
          return false
        }

        if (
          filters.city !== 'all' &&
          row.city !== filters.city
        ) {
          return false
        }

        if (
          filters.year !== 'all'
        ) {
          const date =
            parseDate(row.date)

          if (
            !date ||
            String(
              date.getFullYear()
            ) !==
              String(filters.year)
          ) {
            return false
          }
        }

        if (
          filters.severity !== 'all' &&
          row.accident_severity !==
            filters.severity
        ) {
          return false
        }

        if (
          filters.weather !== 'all' &&
          row.weather !== filters.weather
        ) {
          return false
        }

        if (
          filters.roadType !== 'all' &&
          row.road_type !==
            filters.roadType
        ) {
          return false
        }

        return true
      })
    }, [
      rows,
      filters
    ])

  const stateOptions =
    useMemo(
      () =>
        uniqueSorted(
          rows,
          'state'
        ),
      [rows]
    )

  const cityOptions =
    useMemo(
      () =>
        uniqueSorted(
          rows,
          'city'
        ),
      [rows]
    )

  const yearOptions =
    useMemo(() => {
      const years =
        rows
          .map(row => {
            const date =
              parseDate(row.date)

            return date
              ? date.getFullYear()
              : null
          })
          .filter(Boolean)

      return [
        ...new Set(years)
      ]
        .sort((a, b) => b - a)
        .map(String)
    }, [rows])

  const severityOptions =
    useMemo(
      () =>
        uniqueSorted(
          rows,
          'accident_severity'
        ),
      [rows]
    )

  const weatherOptions =
    useMemo(
      () =>
        uniqueSorted(
          rows,
          'weather'
        ),
      [rows]
    )

  const roadTypeOptions =
    useMemo(
      () =>
        uniqueSorted(
          rows,
          'road_type'
        ),
      [rows]
    )

  /* ---------------------------------------------- */
  /* FILTERED DATA */
  /* ---------------------------------------------- */

  const filteredRows =
    filterBaseRows

  /* ---------------------------------------------- */
  /* KPI DATA */
  /* ---------------------------------------------- */

  const stats =
    useMemo(() => {
      const totalAccidents =
        filteredRows.length

      const totalCasualties =
        filteredRows.reduce(
          (sum, row) =>
            sum +
            number(row.casualties),
          0
        )

      const fatalAccidents =
        filteredRows.filter(
          row =>
            String(
              row.accident_severity
            ).toLowerCase() ===
            'fatal'
        ).length

      const peakHourAccidents =
        filteredRows.filter(
          row =>
            String(
              row.is_peak_hour
            ) === '1'
        ).length

      const avgRisk =
        filteredRows.length
          ? filteredRows.reduce(
              (sum, row) =>
                sum +
                number(
                  row.risk_score
                ),
              0
            ) /
            filteredRows.length
          : 0

      return {
        totalAccidents,
        totalCasualties,
        fatalAccidents,
        peakHourAccidents,
        avgRisk
      }
    }, [filteredRows])

  /* ---------------------------------------------- */
  /* MONTHLY */
  /* ---------------------------------------------- */

  const monthlyData =
    useMemo(() => {
      const counts = {}

      filteredRows.forEach(row => {
        const date =
          parseDate(row.date)

        if (!date) {
          return
        }

        const key =
          `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, '0')}`

        counts[key] =
          (counts[key] || 0) + 1
      })

      return Object.entries(counts)
        .sort(([a], [b]) =>
          a.localeCompare(b)
        )
        .map(
          ([key, count]) => {
            const [
              year,
              month
            ] =
              key.split('-')

            const date =
              new Date(
                Number(year),
                Number(month) - 1,
                1
              )

            return {
              name:
                formatMonth(date),
              count
            }
          }
        )
    }, [filteredRows])

  /* ---------------------------------------------- */
  /* HOURLY */
  /* ---------------------------------------------- */

  const hourlyData =
    useMemo(() => {
      const counts =
        Array.from(
          { length: 24 },
          () => 0
        )

      filteredRows.forEach(row => {
        const hour =
          number(row.hour)

        if (
          hour >= 0 &&
          hour < 24
        ) {
          counts[hour]++
        }
      })

      return counts.map(
        (count, hour) => ({
          hour,
          count
        })
      )
    }, [filteredRows])

  /* ---------------------------------------------- */
  /* SEVERITY */
  /* ---------------------------------------------- */

  const severityData =
    useMemo(
      () =>
        countBy(
          filteredRows,
          'accident_severity'
        ),
      [filteredRows]
    )

  /* ---------------------------------------------- */
  /* RISK */
  /* ---------------------------------------------- */

  const riskData =
    useMemo(() => {
      const counts = {}

      filteredRows.forEach(row => {
        const score =
          Number(
            row.risk_score
          )

        if (
          !Number.isFinite(score)
        ) {
          return
        }

        const key =
          score.toFixed(2)

        counts[key] =
          (counts[key] || 0) + 1
      })

      return Object.entries(counts)
        .sort(
          ([a], [b]) =>
            Number(a) -
            Number(b)
        )
        .map(
          ([score, count]) => ({
            name: score,
            count
          })
        )
    }, [filteredRows])

  /* ---------------------------------------------- */
  /* CITY */
  /* ---------------------------------------------- */

  const cityData =
    useMemo(() => {
      return countBy(
        filteredRows,
        'city'
      )
        .slice(0, 10)
    }, [filteredRows])

  /* ---------------------------------------------- */
  /* MAP */
  /* ---------------------------------------------- */

  const mapRows =
    useMemo(() => {
      return filteredRows
        .map(row => ({
          city: row.city,
          state: row.state,
          latitude:
            Number(row.latitude),
          longitude:
            Number(row.longitude),
          severity:
            row.accident_severity,
          cause: row.cause,
          riskScore:
            Number(row.risk_score)
        }))
        .filter(
          row =>
            Number.isFinite(
              row.latitude
            ) &&
            Number.isFinite(
              row.longitude
            )
        )
    }, [filteredRows])

  /* ---------------------------------------------- */
  /* CHARTS */
  /* ---------------------------------------------- */

  const monthlyPlot =
    [
      {
        x: monthlyData.map(
          item => item.name
        ),

        y: monthlyData.map(
          item => item.count
        ),

        type: 'scatter',

        mode: 'lines+markers',

        line: {
          color: '#9BAF78',
          width: 3,
          shape: 'spline'
        },

        marker: {
          color: '#7cff6b',
          size: 6
        },

        fill: 'tozeroy',

        fillcolor:
          'rgba(124,255,107,0.055)',

        hovertemplate:
          '<b>%{x}</b><br>' +
          '%{y:,} accidents' +
          '<extra></extra>'
      }
    ]

  const hourlyPlot =
    [
      {
        x: hourlyData.map(
          item =>
            `${String(
              item.hour
            ).padStart(2, '0')}:00`
        ),

        y: hourlyData.map(
          item => item.count
        ),

        type: 'bar',

        marker: {
          color:
            hourlyData.map(
              item => {
                if (
                  item.hour >= 17 &&
                  item.hour <= 21
                ) {
                  return '#ff4d4d'
                }

                if (
                  item.hour >= 7 &&
                  item.hour <= 10
                ) {
                  return '#ffc857'
                }

                return '#9BAF78'
              }
            ),

          line: {
            color:
              'rgba(255,255,255,.06)',
            width: 1
          }
        },

        hovertemplate:
          '<b>%{x}</b><br>' +
          '%{y:,} accidents' +
          '<extra></extra>'
      }
    ]

  const severityColors =
    severityData.map(
      ([name]) => {
        const value =
          String(name)
            .toLowerCase()

        if (
          value === 'fatal'
        ) {
          return '#ff4d4d'
        }

        if (
          value === 'major'
        ) {
          return '#ffc857'
        }

        return '#7cff6b'
      }
    )

  const severityPlot =
    [
      {
        labels:
          severityData.map(
            ([name]) =>
              titleCase(name)
          ),

        values:
          severityData.map(
            ([, count]) =>
              count
          ),

        type: 'pie',

        hole: 0.62,

        marker: {
          colors:
            severityColors,

          line: {
            color: '#0a0d0b',
            width: 3
          }
        },

        textinfo: 'label+percent',

        textfont: {
          color: '#dce1d9',
          size: 11
        },

        hovertemplate:
          '<b>%{label}</b><br>' +
          '%{value:,} accidents' +
          '<br>%{percent}' +
          '<extra></extra>'
      }
    ]

  const riskPlot =
    [
      {
        x: riskData.map(
          item => item.name
        ),

        y: riskData.map(
          item => item.count
        ),

        type: 'bar',

        marker: {
          color:
            riskData.map(
              item => {
                const score =
                  Number(
                    item.name
                  )

                if (
                  score >= 0.7
                ) {
                  return '#ff4d4d'
                }

                if (
                  score >= 0.45
                ) {
                  return '#ffc857'
                }

                return '#7cff6b'
              }
            ),

          line: {
            color:
              'rgba(255,255,255,.05)',
            width: 1
          }
        },

        hovertemplate:
          '<b>Risk %{x}</b><br>' +
          '%{y:,} accidents' +
          '<extra></extra>'
      }
    ]

  const cityPlot =
    [
      {
        x: cityData.map(
          ([city]) =>
            titleCase(
              String(city)
            )
        ),

        y: cityData.map(
          ([, count]) =>
            Number(count)
        ),

        type: 'bar',

        marker: {
          color:
            cityData.map(
              (_, index) =>
                index === 0
                  ? '#ffc857'
                  : '#9BAF78'
            ),

          line: {
            color:
              'rgba(255,255,255,.08)',
            width: 1
          }
        },

        text:
          cityData.map(
            ([, count]) =>
              Number(
                count
              ).toLocaleString()
          ),

        textposition:
          'outside',

        cliponaxis: false,

        hovertemplate:
          '<b>%{x}</b><br>' +
          '%{y:,} accidents' +
          '<extra></extra>'
      }
    ]

  const mapPlot =
    [
      {
        type: 'scattergeo',

        mode: 'markers',

        lat: mapRows.map(
          row =>
            row.latitude
        ),

        lon: mapRows.map(
          row =>
            row.longitude
        ),

        text: mapRows.map(
          row =>
            `${titleCase(
              row.city
            )} — ${titleCase(
              row.severity
            )}`
        ),

        customdata:
          mapRows.map(
            row => [
              row.city,
              row.state,
              row.severity,
              row.cause,
              row.riskScore
            ]
          ),

        marker: {
          size:
            mapRows.map(
              row => {
                if (
                  row.riskScore >=
                  0.7
                ) {
                  return 9
                }

                if (
                  row.riskScore >=
                  0.45
                ) {
                  return 7
                }

                return 5
              }
            ),

          color:
            mapRows.map(
              row => {
                if (
                  row.riskScore >=
                  0.7
                ) {
                  return '#ff4d4d'
                }

                if (
                  row.riskScore >=
                  0.45
                ) {
                  return '#ffc857'
                }

                return '#7cff6b'
              }
            ),

          opacity: 0.72,

          line: {
            color:
              '#111511',
            width: 0.7
          }
        },

        hovertemplate:
          '<b>%{customdata[0]}</b>' +
          '<br>%{customdata[1]}' +
          '<br>Severity: %{customdata[2]}' +
          '<br>Cause: %{customdata[3]}' +
          '<br>Risk: %{customdata[4]:.2f}' +
          '<extra></extra>'
      }
    ]

  /* ---------------------------------------------- */
  /* FILTER HELPERS */
  /* ---------------------------------------------- */

  function updateFilter(
    key,
    value
  ) {
    setFilters(
      current => ({
        ...current,
        [key]: value
      })
    )
  }

  function resetFilters() {
    setFilters(
      INITIAL_FILTERS
    )
  }

  const activeFilters =
    Object.entries(filters)
      .filter(
        ([, value]) =>
          value !== 'all'
      )

  /* ---------------------------------------------- */
  /* LOADING STATE */
  /* ---------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050606] text-[#f3f4ee]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="traffic-signal">
              <div className="traffic-light red active" />
              <div className="traffic-light amber" />
              <div className="traffic-light green" />
            </div>

            <div>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-3 w-64" />
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from(
              { length: 4 }
            ).map((_, index) => (
              <Skeleton
                key={index}
                className="h-32"
              />
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-[360px]" />
            <Skeleton className="h-[360px]" />
          </div>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------- */
  /* ERROR STATE */
  /* ---------------------------------------------- */

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050606] text-[#f3f4ee]">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
          <Panel className="w-full p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/[0.06] text-[#ff4d4d]">
              <TriangleAlert size={24} />
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#687068]">
              Connection failure
            </p>

            <h1 className="mt-2 text-xl font-bold">
              RoadLens cannot reach the API
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7f887f]">
              Make sure the Node.js backend is running
              on port 5000 and then try again.
            </p>

            <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 font-mono text-xs text-[#8e968d]">
              {API}
            </div>

            <button
              onClick={() =>
                loadData(true)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#7cff6b]/20 bg-[#7cff6b]/[0.08] px-4 py-2.5 text-xs font-bold text-[#7cff6b] transition hover:bg-[#7cff6b]/[0.13]"
            >
              <RefreshCw
                size={14}
              />

              Try again
            </button>
          </Panel>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------- */
  /* MAIN UI */
  /* ---------------------------------------------- */

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050606] text-[#f3f4ee]">
      <div className="relative z-10">
        <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8 lg:py-8">

          {/* HEADER */}

          <header className="mb-7">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div className="flex items-center gap-4">

                <div className="traffic-signal">
                  <div className="traffic-light red" />
                  <div className="traffic-light amber active" />
                  <div className="traffic-light green" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold tracking-tight text-[#f3f4ee]">
                      ROADLENS
                    </h1>

                    <span className="rounded-md border border-[#7cff6b]/15 bg-[#7cff6b]/[0.05] px-1.5 py-0.5 text-[8px] font-bold tracking-[0.16em] text-[#7cff6b]">
                      INDIA
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.19em] text-[#687068]">
                    Road Accident Intelligence Platform
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">

                <div className="flex items-center gap-2 rounded-full border border-[#7cff6b]/10 bg-[#7cff6b]/[0.035] px-3 py-1.5">
                  <span className="live-dot" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8d968d]">
                    Live dataset
                  </span>
                </div>

                <button
                  onClick={() =>
                    loadData(true)
                  }
                  disabled={refreshing}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#929a91] transition hover:border-white/[0.13] hover:text-[#f3f4ee] disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={
                      refreshing
                        ? 'animate-spin'
                        : ''
                    }
                  />

                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-6 h-px bg-gradient-to-r from-[#7cff6b]/20 via-white/[0.06] to-transparent" />
          </header>

          {/* FILTER BAR */}

          <Panel className="mb-7 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target
                  size={14}
                  className="text-[#ffc857]"
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8c948b]">
                  Analysis Controls
                </span>
              </div>

              {activeFilters.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-[#697169] transition hover:text-[#ff4d4d]"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <FilterSelect
                label="State"
                value={
                  filters.state
                }
                options={
                  stateOptions
                }
                onChange={value =>
                  updateFilter(
                    'state',
                    value
                  )
                }
              />

              <FilterSelect
                label="City"
                value={
                  filters.city
                }
                options={
                  cityOptions
                }
                onChange={value =>
                  updateFilter(
                    'city',
                    value
                  )
                }
              />

              <FilterSelect
                label="Year"
                value={
                  filters.year
                }
                options={
                  yearOptions
                }
                onChange={value =>
                  updateFilter(
                    'year',
                    value
                  )
                }
              />

              <FilterSelect
                label="Severity"
                value={
                  filters.severity
                }
                options={
                  severityOptions
                }
                onChange={value =>
                  updateFilter(
                    'severity',
                    value
                  )
                }
              />

              <FilterSelect
                label="Weather"
                value={
                  filters.weather
                }
                options={
                  weatherOptions
                }
                onChange={value =>
                  updateFilter(
                    'weather',
                    value
                  )
                }
              />

              <FilterSelect
                label="Road Type"
                value={
                  filters.roadType
                }
                options={
                  roadTypeOptions
                }
                onChange={value =>
                  updateFilter(
                    'roadType',
                    value
                  )
                }
              />
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map(
                  ([key, value]) => (
                    <button
                      key={key}
                      onClick={() =>
                        updateFilter(
                          key,
                          'all'
                        )
                      }
                      className="flex items-center gap-1.5 rounded-full border border-[#7cff6b]/10 bg-[#7cff6b]/[0.035] px-2.5 py-1 text-[9px] font-semibold text-[#a9b1a7]"
                    >
                      {titleCase(key)}:
                      <span className="text-[#7cff6b]">
                        {titleCase(
                          value
                        )}
                      </span>

                      <X
                        size={10}
                        className="text-[#596159]"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </Panel>

          {/* KPI GRID */}

          <section className="mb-8">
            <SectionTitle
              icon={Activity}
              eyebrow="Network overview"
              title="Road safety pulse"
              description={`${filteredRows.length.toLocaleString()} records currently in view`}
              right={
                <div className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#596159] md:flex">
                  <CircleDot
                    size={11}
                    className="text-[#7cff6b]"
                  />
                  Monitoring active
                </div>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Car}
                label="Total accidents"
                value={stats.totalAccidents.toLocaleString()}
                subtext="Filtered accident records"
                accent="green"
              />

              <StatCard
                icon={Siren}
                label="Fatal accidents"
                value={stats.fatalAccidents.toLocaleString()}
                subtext="Highest severity events"
                accent="red"
              />

              <StatCard
                icon={AlertTriangle}
                label="Casualties"
                value={stats.totalCasualties.toLocaleString()}
                subtext="Reported casualties"
                accent="amber"
              />

              <StatCard
                icon={Gauge}
                label="Peak-hour events"
                value={stats.peakHourAccidents.toLocaleString()}
                subtext={`Avg. risk ${stats.avgRisk.toFixed(2)}`}
                accent="amber"
              />
            </div>
          </section>

          {/* TEMPORAL ANALYSIS */}

          <section className="mb-8">
            <SectionTitle
              icon={TrendingUp}
              eyebrow="Temporal intelligence"
              title="When accidents happen"
              description="Identify recurring periods of elevated road risk"
            />

            <div className="grid gap-5 lg:grid-cols-2">

              <Panel className="overflow-hidden p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#e7eae5]">
                      Accidents over time
                    </h3>

                    <p className="mt-1 text-[10px] text-[#626a62]">
                      Monthly accident volume
                    </p>
                  </div>

                  <CalendarDays
                    size={15}
                    className="text-[#7cff6b]"
                  />
                </div>

                <PlotChart
                  data={
                    monthlyPlot
                  }
                  layout={{
                    margin: {
                      l: 45,
                      r: 20,
                      t: 15,
                      b: 55
                    },

                    xaxis: {
                      type: 'category',
                      tickangle: -30
                    },

                    yaxis: {
                      title:
                        'Accidents',
                      rangemode:
                        'tozero'
                    },

                    showlegend:
                      false
                  }}
                  className="h-[320px]"
                />
              </Panel>

              <Panel className="overflow-hidden p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#e7eae5]">
                      Accidents by hour
                    </h3>

                    <p className="mt-1 text-[10px] text-[#626a62]">
                      Daily accident concentration
                    </p>
                  </div>

                  <Activity
                    size={15}
                    className="text-[#ffc857]"
                  />
                </div>

                <PlotChart
                  data={
                    hourlyPlot
                  }
                  layout={{
                    margin: {
                      l: 45,
                      r: 20,
                      t: 15,
                      b: 55
                    },

                    xaxis: {
                      type: 'category',
                      tickangle: -45
                    },

                    yaxis: {
                      title:
                        'Accidents',
                      rangemode:
                        'tozero'
                    },

                    showlegend:
                      false,

                    bargap: 0.18
                  }}
                  className="h-[320px]"
                />
              </Panel>
            </div>
          </section>

          {/* SEVERITY + RISK */}

          <section className="mb-8">
            <SectionTitle
              icon={ShieldAlert}
              eyebrow="Risk intelligence"
              title="Severity and risk distribution"
              description="Understand how dangerous the observed incidents are"
            />

            <div className="grid gap-5 lg:grid-cols-2">

              <Panel className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#e7eae5]">
                      Severity distribution
                    </h3>

                    <p className="mt-1 text-[10px] text-[#626a62]">
                      Minor, major and fatal events
                    </p>
                  </div>

                  <ShieldAlert
                    size={15}
                    className="text-[#ff4d4d]"
                  />
                </div>

                <PlotChart
                  data={
                    severityPlot
                  }
                  layout={{
                    margin: {
                      l: 10,
                      r: 10,
                      t: 10,
                      b: 10
                    },

                    showlegend:
                      false
                  }}
                  className="h-[320px]"
                />
              </Panel>

              <Panel className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#e7eae5]">
                      Risk-score distribution
                    </h3>

                    <p className="mt-1 text-[10px] text-[#626a62]">
                      Frequency of calculated risk scores
                    </p>
                  </div>

                  <Gauge
                    size={15}
                    className="text-[#ffc857]"
                  />
                </div>

                <PlotChart
                  data={
                    riskPlot
                  }
                  layout={{
                    margin: {
                      l: 45,
                      r: 20,
                      t: 15,
                      b: 50
                    },

                    xaxis: {
                      type: 'category',
                      title:
                        'Risk score'
                    },

                    yaxis: {
                      title:
                        'Accidents',
                      rangemode:
                        'tozero'
                    },

                    showlegend:
                      false,

                    bargap: 0.22
                  }}
                  className="h-[320px]"
                />
              </Panel>
            </div>
          </section>

          {/* MAP */}

          <section className="mb-8">
            <SectionTitle
              icon={Globe2}
              eyebrow="Geospatial intelligence"
              title="Indian accident hotspot map"
              description="Geographical concentration of recorded accidents"
              right={
                <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.12em]">
                  <span className="flex items-center gap-1.5 text-[#7cff6b]">
                    <span className="h-2 w-2 rounded-full bg-[#7cff6b]" />
                    Low
                  </span>

                  <span className="flex items-center gap-1.5 text-[#ffc857]">
                    <span className="h-2 w-2 rounded-full bg-[#ffc857]" />
                    Medium
                  </span>

                  <span className="flex items-center gap-1.5 text-[#ff4d4d]">
                    <span className="h-2 w-2 rounded-full bg-[#ff4d4d]" />
                    High
                  </span>
                </div>
              }
            />

            <Panel className="overflow-hidden p-2">
              <div className="relative">
                <PlotChart
                  data={
                    mapPlot
                  }
                  layout={{
                    margin: {
                      l: 5,
                      r: 5,
                      t: 5,
                      b: 5
                    },

                    geo: {
                      scope: 'asia',

                      center: {
                        lat: 22.5,
                        lon: 79
                      },

                      projection: {
                        type: 'mercator',
                        scale: 4
                      },

                      showland: true,
                      landcolor:
                        '#111611',

                      showocean: true,
                      oceancolor:
                        '#070908',

                      showcountries:
                        true,

                      countrycolor:
                        'rgba(255,255,255,.12)',

                      showlakes: true,
                      lakecolor:
                        '#080b09',

                      coastlinecolor:
                        'rgba(255,255,255,.08)',

                      bgcolor:
                        'rgba(0,0,0,0)'
                    },

                    showlegend:
                      false
                  }}
                  className="h-[520px]"
                />

                <div className="pointer-events-none absolute left-5 top-5 rounded-xl border border-white/[0.06] bg-[#080b09]/85 px-3 py-2 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={13}
                      className="text-[#ff4d4d]"
                    />

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9da59c]">
                        Geographic coverage
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#596159]">
                        {mapRows.length.toLocaleString()} mapped events
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </section>

          {/* TOP CITIES */}

          <section className="mb-8">
            <SectionTitle
              icon={MapPin}
              eyebrow="Location analysis"
              title="Top accident-prone cities"
              description="Cities with the highest number of recorded incidents"
            />

            <Panel className="p-5">
              <PlotChart
                data={
                  cityPlot
                }
                layout={{
                  margin: {
                    l: 45,
                    r: 35,
                    t: 20,
                    b: 70
                  },

                  xaxis: {
                    type: 'category',

                    tickangle: -35,

                    tickfont: {
                      size: 10
                    }
                  },

                  yaxis: {
                    title:
                      'Accidents',

                    rangemode:
                      'tozero'
                  },

                  showlegend:
                    false,

                  bargap: 0.35
                }}
                className="h-[330px]"
              />
            </Panel>
          </section>

          {/* ANALYTICAL SNAPSHOT */}

          <section className="mb-8">
            <SectionTitle
              icon={BarChart3}
              eyebrow="Decision support"
              title="Analytical snapshot"
              description="Quick interpretation of the current filtered view"
            />

            <div className="grid gap-4 md:grid-cols-3">

              <Panel className="panel-green p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#7cff6b]/10 bg-[#7cff6b]/[0.05] text-[#7cff6b]">
                    <Activity size={16} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#687068]">
                      Dataset scope
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#e7eae5]">
                      {filteredRows.length.toLocaleString()} incidents
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#626a62]">
                      Current visualization scope after all active filters.
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel className="panel-amber p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#ffc857]/10 bg-[#ffc857]/[0.05] text-[#ffc857]">
                    <Gauge size={16} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#687068]">
                      Average risk
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#e7eae5]">
                      {stats.avgRisk.toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#626a62]">
                      Mean risk score across the filtered accident records.
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel className="panel-red p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#ff4d4d]/10 bg-[#ff4d4d]/[0.05] text-[#ff4d4d]">
                    <Siren size={16} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#687068]">
                      Critical events
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#e7eae5]">
                      {stats.fatalAccidents.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#626a62]">
                      Fatal incidents requiring the highest level of attention.
                    </p>
                  </div>
                </div>
              </Panel>

            </div>
          </section>

          {/* FOOTER */}

          <footer className="border-t border-white/[0.05] pt-5">
            <div className="flex flex-col justify-between gap-3 text-[9px] font-medium uppercase tracking-[0.14em] text-[#4f574f] sm:flex-row">
              <span>
                ROADLENS INDIA · ROAD ACCIDENT INTELLIGENCE
              </span>

              <span className="flex items-center gap-2">
                <span className="live-dot" />
                Visualization engine online
              </span>
            </div>
          </footer>

        </div>
      </div>
    </div>
  )
}
