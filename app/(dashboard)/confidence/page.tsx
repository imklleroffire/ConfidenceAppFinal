"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Brain, CheckCircle, XCircle } from "lucide-react"

interface QuizQuestion {
  id: string
  scenario: string
  question: string
  options: {
    id: string
    text: string
    isCorrect: boolean
    explanation: string
  }[]
}

export default function ConfidencePage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadQuestions = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const focusAreas = userData.focusAreas || []

          // Generate questions based on focus areas
          const generatedQuestions = generateQuestions(focusAreas)
          setQuestions(generatedQuestions)
        }
      } catch (error) {
        console.error("Error loading questions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [user])

  const generateQuestions = (focusAreas: string[]): QuizQuestion[] => {
    const allQuestions: QuizQuestion[] = [
      {
        id: "social1",
        scenario: "You're at a networking event and don't know anyone.",
        question: "What's the best approach to start a conversation?",
        options: [
          {
            id: "a",
            text: "Wait for someone to approach you first",
            isCorrect: false,
            explanation: "Waiting passively might result in missed opportunities.",
          },
          {
            id: "b",
            text: "Introduce yourself to someone standing alone",
            isCorrect: true,
            explanation: "This is a confident and considerate approach that often leads to meaningful connections.",
          },
          {
            id: "c",
            text: "Stay on your phone to look busy",
            isCorrect: false,
            explanation: "This creates a barrier and signals unavailability.",
          },
          {
            id: "d",
            text: "Leave immediately",
            isCorrect: false,
            explanation: "This avoids the opportunity entirely and doesn't build confidence.",
          },
        ],
      },
      {
        id: "public1",
        scenario: "You're asked to give an impromptu presentation at work.",
        question: "How do you handle the nervousness?",
        options: [
          {
            id: "a",
            text: "Decline and suggest someone else",
            isCorrect: false,
            explanation: "Avoiding the opportunity doesn't help build confidence.",
          },
          {
            id: "b",
            text: "Accept and take a moment to organize your thoughts",
            isCorrect: true,
            explanation: "Taking a brief pause to collect yourself shows composure and preparation.",
          },
          {
            id: "c",
            text: "Rush through it as quickly as possible",
            isCorrect: false,
            explanation: "Rushing often leads to mistakes and doesn't demonstrate confidence.",
          },
          {
            id: "d",
            text: "Make excuses about being unprepared",
            isCorrect: false,
            explanation: "Making excuses undermines your credibility and confidence.",
          },
        ],
      },
      {
        id: "assertive1",
        scenario: "A colleague takes credit for your idea in a meeting.",
        question: "What's the most assertive response?",
        options: [
          {
            id: "a",
            text: "Say nothing to avoid conflict",
            isCorrect: false,
            explanation: "Staying silent allows the behavior to continue and doesn't protect your interests.",
          },
          {
            id: "b",
            text: "Politely clarify your contribution",
            isCorrect: true,
            explanation: "This is assertive without being aggressive and protects your professional reputation.",
          },
          {
            id: "c",
            text: "Confront them aggressively after the meeting",
            isCorrect: false,
            explanation: "Aggressive confrontation can damage relationships and your professional image.",
          },
          {
            id: "d",
            text: "Complain to other colleagues",
            isCorrect: false,
            explanation: "Gossiping is unprofessional and doesn't address the issue directly.",
          },
        ],
      },
      {
        id: "self_worth1",
        scenario: "You receive constructive criticism on a project.",
        question: "How do you respond internally?",
        options: [
          {
            id: "a",
            text: "Take it as a personal attack on your abilities",
            isCorrect: false,
            explanation: "This response is defensive and prevents growth.",
          },
          {
            id: "b",
            text: "View it as an opportunity to improve",
            isCorrect: true,
            explanation: "This growth mindset builds resilience and self-worth over time.",
          },
          {
            id: "c",
            text: "Dismiss it as the critic being wrong",
            isCorrect: false,
            explanation: "Dismissing feedback prevents learning and improvement.",
          },
          {
            id: "d",
            text: "Assume you're not good enough for the job",
            isCorrect: false,
            explanation: "This catastrophic thinking undermines self-confidence.",
          },
        ],
      },
      {
        id: "body_image1",
        scenario: "You're invited to a pool party but feel self-conscious about your appearance.",
        question: "What's the healthiest mindset?",
        options: [
          {
            id: "a",
            text: "Skip the event to avoid feeling uncomfortable",
            isCorrect: false,
            explanation: "Avoidance reinforces negative self-image and limits social experiences.",
          },
          {
            id: "b",
            text: "Focus on enjoying time with friends rather than appearance",
            isCorrect: true,
            explanation: "Shifting focus to relationships and experiences builds positive self-image.",
          },
          {
            id: "c",
            text: "Go but stay covered up the entire time",
            isCorrect: false,
            explanation: "This compromise still centers on appearance-based anxiety.",
          },
          {
            id: "d",
            text: "Compare yourself to others at the party",
            isCorrect: false,
            explanation: "Comparison typically worsens self-image and confidence.",
          },
        ],
      },
    ]

    // Filter questions based on focus areas, but always include at least 3 questions
    let filteredQuestions = allQuestions.filter((q) => focusAreas.some((area) => q.id.includes(area)))

    if (filteredQuestions.length < 3) {
      filteredQuestions = allQuestions.slice(0, 3)
    }

    return filteredQuestions.slice(0, 5) // Limit to 5 questions max
  }

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId)
  }

  const handleNextQuestion = () => {
    if (!selectedAnswer) return

    const currentQuestion = questions[currentQuestionIndex]
    const selectedOption = currentQuestion.options.find((opt) => opt.id === selectedAnswer)

    if (selectedOption?.isCorrect) {
      setScore(score + 1)
    }

    setQuestionsAnswered(questionsAnswered + 1)
    setShowResult(true)
  }

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      handleFinishQuiz()
    }
  }

  const handleFinishQuiz = async () => {
    if (!user) return

    setSubmitting(true)

    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const today = new Date().toISOString().split("T")[0]
        const activities = userData.activities || {}

        // Update activities for today
        activities[today] = {
          ...activities[today],
          confidence: true,
        }

        // Calculate streak
        let streak = userData.confidenceStreak || 0
        const lastConfidenceDate = userData.lastConfidenceQuizDate
          ? new Date(userData.lastConfidenceQuizDate.toDate())
          : null

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (!lastConfidenceDate) {
          streak = 1
        } else {
          const lastQuizDay = lastConfidenceDate.toISOString().split("T")[0]
          const yesterdayStr = yesterday.toISOString().split("T")[0]

          if (lastQuizDay === yesterdayStr) {
            streak += 1
          } else if (lastQuizDay !== today) {
            streak = 1
          }
        }

        await updateDoc(userDocRef, {
          activities,
          confidenceStreak: streak,
          lastConfidenceQuizDate: new Date(),
          lastQuizScore: Math.round((score / questions.length) * 100),
        })

        toast({
          title: "Quiz completed!",
          description: `You scored ${score}/${questions.length}. Great job building your confidence!`,
        })

        // Reset quiz
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore(0)
        setQuestionsAnswered(0)
      }
    } catch (error) {
      console.error("Error saving quiz progress:", error)
      toast({
        title: "Error",
        description: "Failed to save your quiz progress",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading confidence quiz...</div>
  }

  if (questions.length === 0) {
    return <div>No questions available. Please complete the survey first.</div>
  }

  const currentQuestion = questions[currentQuestionIndex]
  const selectedOption = currentQuestion.options.find((opt) => opt.id === selectedAnswer)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Confidence Practice</h1>

      <Card className="border-2 neon-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            Social Situation Practice
          </CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Scenario:</h3>
              <p>{currentQuestion.scenario}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">{currentQuestion.question}</h3>

              {!showResult ? (
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.id)}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        selectedAnswer === option.id ? "border-primary bg-primary/10" : "border-muted hover:bg-muted/50"
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 border rounded-lg flex items-start space-x-3 ${
                        option.isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : selectedAnswer === option.id
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-muted"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {option.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : selectedAnswer === option.id ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{option.text}</p>
                        {(option.isCorrect || selectedAnswer === option.id) && (
                          <p className="text-sm text-muted-foreground mt-1">{option.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!showResult ? (
            <Button onClick={handleNextQuestion} disabled={!selectedAnswer} className="w-full neon-button">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleContinue} disabled={submitting} className="w-full neon-button">
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : submitting
                  ? "Finishing..."
                  : "Finish Quiz"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="border-2 neon-border">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Current Progress</h3>
            <p className="text-2xl font-bold">
              {score}/{questionsAnswered} correct
            </p>
            <p className="text-sm text-muted-foreground">
              {questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0}% accuracy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
