"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ThemeWrapper } from "@/components/theme-wrapper"
import { MainNav } from "@/components/layout/main-nav"
import { Header } from "@/components/layout/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, hasCompletedSurvey } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("Dashboard layout - user:", !!user, "loading:", loading, "hasCompletedSurvey:", hasCompletedSurvey)

    if (!loading) {
      if (!user) {
        console.log("No user, redirecting to login")
        router.push("/")
      } else if (!hasCompletedSurvey) {
        console.log("User hasn't completed survey, redirecting to survey")
        router.push("/survey")
      } else {
        console.log("User is authenticated and has completed survey - showing dashboard")
      }
    }
  }, [user, loading, hasCompletedSurvey, router])

  if (loading) {
    return (
      <ThemeWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </ThemeWrapper>
    )
  }

  if (!user) {
    return (
      <ThemeWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p>Redirecting to login...</p>
        </div>
      </ThemeWrapper>
    )
  }

  if (!hasCompletedSurvey) {
    return (
      <ThemeWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p>Redirecting to survey...</p>
        </div>
      </ThemeWrapper>
    )
  }

  return (
    <ThemeWrapper>
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="hidden md:block">
          <MainNav />
        </div>
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">{children}</main>
          <div className="md:hidden">
            <MainNav />
          </div>
        </div>
      </div>
    </ThemeWrapper>
  )
}
