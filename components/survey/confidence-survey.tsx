"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

const surveyQuestions = [
  {
    id: "social",
    question: "How comfortable are you in social situations?",
    options: [
      { value: "1", label: "Very uncomfortable" },
      { value: "2", label: "Somewhat uncomfortable" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Somewhat comfortable" },
      { value: "5", label: "Very comfortable" },
    ],
  },
  {
    id: "public_speaking",
    question: "How confident are you with public speaking?",
    options: [
      { value: "1", label: "Not confident at all" },
      { value: "2", label: "Slightly confident" },
      { value: "3", label: "Moderately confident" },
      { value: "4", label: "Quite confident" },
      { value: "5", label: "Extremely confident" },
    ],
  },
  {
    id: "body_image",
    question: "How satisfied are you with your body image?",
    options: [
      { value: "1", label: "Very dissatisfied" },
      { value: "2", label: "Somewhat dissatisfied" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Somewhat satisfied" },
      { value: "5", label: "Very satisfied" },
    ],
  },
  {
    id: "assertiveness",
    question: "How comfortable are you with being assertive?",
    options: [
      { value: "1", label: "Very uncomfortable" },
      { value: "2", label: "Somewhat uncomfortable" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Somewhat comfortable" },
      { value: "5", label: "Very comfortable" },
    ],
  },
  {
    id: "self_worth",
    question: "How would you rate your sense of self-worth?",
    options: [
      { value: "1", label: "Very low" },
      { value: "2", label: "Somewhat low" },
      { value: "3", label: "Average" },
      { value: "4", label: "Somewhat high" },
      { value: "5", label: "Very high" },
    ],
  },
]

export function ConfidenceSurvey() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, refreshUserData } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [surveyQuestions[currentQuestion].id]: value,
    })
  }

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save your survey",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const userDocRef = doc(db, "users", user.uid)

      // Calculate focus areas based on lowest scores
      const scores = Object.entries(answers).map(([key, value]) => ({ area: key, score: Number.parseInt(value) }))
      scores.sort((a, b) => a.score - b.score)
      const focusAreas = scores.slice(0, 2).map((item) => item.area)

      // Prepare the data to save
      const surveyData = {
        surveyAnswers: answers,
        focusAreas,
        hasCompletedSurvey: true,
        updatedAt: new Date(),
      }

      console.log("Saving survey data:", surveyData)

      // First, try to check if the document exists
      try {
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          // Document exists, update it
          await updateDoc(userDocRef, surveyData)
          console.log("Survey data updated successfully")
        } else {
          // Document doesn't exist, create it with all necessary fields
          await setDoc(userDocRef, {
            email: user.email,
            createdAt: new Date(),
            workoutStreak: 0,
            confidenceStreak: 0,
            lastWorkoutDate: null,
            lastConfidenceQuizDate: null,
            theme: "neon",
            activities: {},
            ...surveyData,
          })
          console.log("Survey data created successfully")
        }

        // Refresh the user data in the auth context
        await refreshUserData()

        toast({
          title: "Survey completed!",
          description: "Your profile has been updated successfully!",
        })

        // Force navigation to dashboard
        console.log("Navigating to dashboard...")
        router.push("/dashboard")

        // Also try window.location as a fallback
        setTimeout(() => {
          if (window.location.pathname !== "/dashboard") {
            window.location.href = "/dashboard"
          }
        }, 1000)
      } catch (firestoreError: any) {
        console.error("Firestore operation failed:", firestoreError)

        // If updateDoc fails, try setDoc as a fallback
        if (firestoreError.code === "not-found") {
          try {
            await setDoc(userDocRef, {
              email: user.email,
              createdAt: new Date(),
              workoutStreak: 0,
              confidenceStreak: 0,
              lastWorkoutDate: null,
              lastConfidenceQuizDate: null,
              theme: "neon",
              activities: {},
              ...surveyData,
            })

            // Refresh the user data in the auth context
            await refreshUserData()

            toast({
              title: "Survey completed!",
              description: "Your profile has been created successfully!",
            })

            router.push("/dashboard")
            return
          } catch (setDocError) {
            console.error("SetDoc also failed:", setDocError)
          }
        }

        // If we get here, both operations failed
        throw firestoreError
      }
    } catch (error: any) {
      console.error("Error saving survey:", error)

      let errorMessage = "Failed to save your survey responses"

      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please check your account permissions or try signing in again."
      } else if (error.code === "unavailable") {
        errorMessage = "Service temporarily unavailable. Please try again in a moment."
      } else if (error.code === "unauthenticated") {
        errorMessage = "Authentication expired. Please sign in again."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      // If it's an auth error, redirect to login
      if (error.code === "unauthenticated") {
        router.push("/")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQuestionData = surveyQuestions[currentQuestion]
  const isLastQuestion = currentQuestion === surveyQuestions.length - 1
  const isCurrentQuestionAnswered = answers[currentQuestionData.id] !== undefined

  return (
    <Card className="border-2 neon-border">
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {currentQuestion + 1} of {surveyQuestions.length}
            </span>
            <span>{Math.round(((currentQuestion + 1) / surveyQuestions.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / surveyQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">{currentQuestionData.question}</h2>

        <RadioGroup value={answers[currentQuestionData.id]} onValueChange={handleAnswer} className="space-y-3">
          {currentQuestionData.options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors"
            >
              <RadioGroupItem value={option.value} id={`option-${option.value}`} />
              <Label htmlFor={`option-${option.value}`} className="flex-grow cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!isCurrentQuestionAnswered || isSubmitting}
              className="neon-button"
            >
              {isSubmitting ? "Completing Survey..." : "Complete Survey"}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!isCurrentQuestionAnswered} className="neon-button">
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
