import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Card } from './card'

export function StatCard({ icon: Icon, label, value, helper, accent = 'cyan', loading }) {
  const accentClasses = {
    cyan: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/15',
    red: 'bg-red-400/10 text-red-300 ring-red-400/15',
    amber: 'bg-amber-400/10 text-amber-300 ring-amber-400/15',
    violet: 'bg-violet-400/10 text-violet-300 ring-violet-400/15'
  }

  return (
    <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/[0.04] blur-3xl transition group-hover:bg-cyan-400/[0.08]" />
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${accentClasses[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-700 transition group-hover:text-slate-500" />
      </div>
      <div className="mt-5">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        {loading ? <div className="mt-2 h-9 w-28 animate-pulse rounded-lg bg-white/[0.07]" /> : <div className="mt-1 text-3xl font-extrabold tracking-tight text-white">{value}</div>}
        <div className="mt-2 text-[11px] text-slate-600">{helper}</div>
      </div>
    </Card>
  )
}
