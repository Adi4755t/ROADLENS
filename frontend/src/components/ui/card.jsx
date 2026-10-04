import React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return <div className={cn('rounded-2xl border border-white/[0.07] bg-white/[0.035] shadow-panel backdrop-blur-xl', className)} {...props}>{children}</div>
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-5 pt-5', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-sm font-semibold tracking-tight text-slate-100', className)}>{children}</h3>
}

export function CardDescription({ className, children }) {
  return <p className={cn('mt-1 text-xs leading-5 text-slate-500', className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>
}
