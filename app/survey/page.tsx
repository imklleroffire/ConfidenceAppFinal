"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ThemeWrapper } from "@/components/theme-wrapper"
import { ConfidenceSurvey } from "@/components/survey/confidence-survey"
import { FirestoreRulesInfo } from "@/components/firestore-rules-info"

export default function SurveyPage() {
  const { user, loading, hasCompletedSurvey } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/")
      } else if (hasCompletedSurvey) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, hasCompletedSurvey, router])

  if (loading) {
    return (
      <ThemeWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </ThemeWrapper>
    )
  }

  return (
    <ThemeWrapper>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center animate-glow">
            Let&apos;s Personalize Your Experience
          </h1>
          <p className="text-center mb-8 text-muted-foreground">
            Answer a few questions to help us tailor the app to your confidence needs
          </p>
          <FirestoreRulesInfo />
          <ConfidenceSurvey />
        </div>
      </div>
    </ThemeWrapper>
  )
}
