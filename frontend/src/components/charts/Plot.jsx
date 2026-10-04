import React, { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'

const baseLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',

  font: {
    family: 'Manrope, sans-serif',
    color: '#929a91',
    size: 11
  },

  margin: {
    l: 55,
    r: 20,
    t: 15,
    b: 45
  },

  hoverlabel: {
    bgcolor: '#0b100d',
    bordercolor: '#273028',

    font: {
      family: 'Manrope, sans-serif',
      color: '#f3f4ee',
      size: 12
    }
  },

  xaxis: {
    gridcolor: 'rgba(255,255,255,.055)',
    zerolinecolor: 'rgba(255,255,255,.05)',
    linecolor: 'rgba(255,255,255,.07)',

    tickfont: {
      family: 'Manrope, sans-serif',
      color: '#7f887f',
      size: 10
    }
  },

  yaxis: {
    gridcolor: 'rgba(255,255,255,.055)',
    zerolinecolor: 'rgba(255,255,255,.05)',
    linecolor: 'rgba(255,255,255,.07)',

    tickfont: {
      family: 'Manrope, sans-serif',
      color: '#7f887f',
      size: 10
    }
  }
}

function mergeLayout(base, custom) {
  return {
    ...base,
    ...custom,

    margin: {
      ...base.margin,
      ...(custom.margin || {})
    },

    xaxis: {
      ...base.xaxis,
      ...(custom.xaxis || {})
    },

    yaxis: {
      ...base.yaxis,
      ...(custom.yaxis || {})
    }
  }
}

export function PlotChart({
  data = [],
  layout = {},
  className = ''
}) {
  const plotRef = useRef(null)

  useEffect(() => {
    if (!plotRef.current) {
      return
    }

    if (!Array.isArray(data) || data.length === 0) {
      return
    }

    const finalLayout = mergeLayout(
      baseLayout,
      {
        ...layout,
        autosize: true
      }
    )

    const config = {
      responsive: true,
      displaylogo: false,

      displayModeBar: true,

      modeBarButtonsToRemove: [
        'lasso2d',
        'select2d'
      ],

      modeBarButtonsToAdd: [],

      toImageButtonOptions: {
        format: 'png',
        filename: 'roadlens-chart',
        height: 700,
        width: 1200,
        scale: 2
      }
    }

    Plotly.react(
      plotRef.current,
      data,
      finalLayout,
      config
    )
  }, [data, layout])

  useEffect(() => {
    const element = plotRef.current

    return () => {
      if (element) {
        try {
          Plotly.purge(element)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  return (
    <div
      className={`chart-shell h-[300px] w-full ${className}`}
    >
      <div
        ref={plotRef}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}