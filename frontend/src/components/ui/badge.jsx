import React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, children }) {
  return <span className={cn('inline-flex items-center rounded-full border border-cyan-400/15 bg-cyan-400/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300', className)}>{children}</span>
}
