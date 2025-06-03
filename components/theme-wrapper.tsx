"use client"

import type React from "react"

import { useTheme } from "@/contexts/theme-context"

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return <div className={`theme-wrapper ${theme}`}>{children}</div>
}
