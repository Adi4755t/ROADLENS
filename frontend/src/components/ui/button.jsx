import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10 hover:bg-cyan-300',
      outline: 'border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]',
      ghost: 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
    },
    size: {
      default: 'h-10 px-4',
      sm: 'h-9 px-3 text-xs'
    }
  },
  defaultVariants: { variant: 'default', size: 'default' }
})

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
