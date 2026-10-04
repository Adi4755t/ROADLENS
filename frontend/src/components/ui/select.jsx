import React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Select({ value, onValueChange, placeholder, children }) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger className="flex h-10 min-w-[150px] items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs font-medium text-slate-300 outline-none transition hover:bg-white/[0.06] focus:ring-2 focus:ring-cyan-400/30">
        <SelectPrimitive.Value placeholder={placeholder} />
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={6} className="z-50 overflow-hidden rounded-xl border border-white/10 bg-[#0b1422] p-1 text-slate-200 shadow-2xl">
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export function SelectItem({ value, children }) {
  return (
    <SelectPrimitive.Item value={value} className="relative cursor-pointer select-none rounded-lg px-3 py-2 text-xs outline-none data-[highlighted]:bg-white/[0.07]">
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
