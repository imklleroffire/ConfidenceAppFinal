"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle } from "lucide-react"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  completed: boolean
}

interface WorkoutDay {
  id: string
  name: string
  exercises: Exercise[]
}

export default function WorkoutPage() {
  const { user } = useAuth()
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([])
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()

          // If user doesn't have a workout plan yet, create one based on their focus areas
          if (!userData.workoutPlan) {
            const focusAreas = userData.focusAreas || []
            const newWorkoutPlan = generateWorkoutPlan(focusAreas)

            await updateDoc(userDocRef, {
              workoutPlan: newWorkoutPlan,
            })

            setWorkoutPlan(newWorkoutPlan)
          } else {
            setWorkoutPlan(userData.workoutPlan)
          }

          // Set active day to today's workout or the first day if not found
          const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
          const todayWorkout = userData.workoutPlan?.find((day: WorkoutDay) => day.name.includes(today))
          setActiveDay(todayWorkout?.id || userData.workoutPlan?.[0]?.id || null)
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkoutPlan()
  }, [user])

  const generateWorkoutPlan = (focusAreas: string[]) => {
    // Default workout plan with some exercises
    const defaultPlan: WorkoutDay[] = [
      {
        id: "day1",
        name: "Monday - Upper Body",
        exercises: [
          { id: "ex1", name: "Push-ups", sets: 3, reps: 10, completed: false },
          { id: "ex2", name: "Dumbbell Rows", sets: 3, reps: 12, completed: false },
          { id: "ex3", name: "Shoulder Press", sets: 3, reps: 10, completed: false },
        ],
      },
      {
        id: "day2",
        name: "Tuesday - Rest Day",
        exercises: [],
      },
      {
        id: "day3",
        name: "Wednesday - Lower Body",
        exercises: [
          { id: "ex4", name: "Squats", sets: 3, reps: 15, completed: false },
          { id: "ex5", name: "Lunges", sets: 3, reps: 10, completed: false },
          { id: "ex6", name: "Calf Raises", sets: 3, reps: 20, completed: false },
        ],
      },
      {
        id: "day4",
        name: "Thursday - Rest Day",
        exercises: [],
      },
      {
        id: "day5",
        name: "Friday - Full Body",
        exercises: [
          { id: "ex7", name: "Burpees", sets: 3, reps: 10, completed: false },
          { id: "ex8", name: "Mountain Climbers", sets: 3, reps: 20, completed: false },
          { id: "ex9", name: "Plank", sets: 3, reps: 30, completed: false },
        ],
      },
      {
        id: "day6",
        name: "Saturday - Cardio",
        exercises: [
          { id: "ex10", name: "Jumping Jacks", sets: 3, reps: 30, completed: false },
          { id: "ex11", name: "High Knees", sets: 3, reps: 20, completed: false },
          { id: "ex12", name: "Jump Rope", sets: 1, reps: 100, completed: false },
        ],
      },
      {
        id: "day7",
        name: "Sunday - Rest Day",
        exercises: [],
      },
    ]

    // If user has body image concerns, add more exercises
    if (focusAreas.includes("body_image")) {
      defaultPlan[0].exercises.push({ id: "ex13", name: "Bicep Curls", sets: 3, reps: 12, completed: false })
      defaultPlan[2].exercises.push({ id: "ex14", name: "Glute Bridges", sets: 3, reps: 15, completed: false })
    }

    return defaultPlan
  }

  const handleToggleExercise = (dayId: string, exerciseId: string) => {
    setWorkoutPlan((prevPlan) =>
      prevPlan.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.map((exercise) => {
              if (exercise.id === exerciseId) {
                return { ...exercise, completed: !exercise.completed }
              }
              return exercise
            }),
          }
        }
        return day
      }),
    )
  }

  const handleSaveProgress = async () => {
    if (!user) return

    setSubmitting(true)

    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const today = new Date().toISOString().split("T")[0]
        const activities = userData.activities || {}

        // Check if all exercises for the active day are completed
        const activeWorkout = workoutPlan.find((day) => day.id === activeDay)
        const allCompleted = activeWorkout?.exercises.length
          ? activeWorkout.exercises.every((ex) => ex.completed)
          : false

        // Update activities for today
        activities[today] = {
          ...activities[today],
          workout: allCompleted,
        }

        // Calculate streak
        let streak = userData.workoutStreak || 0
        const lastWorkoutDate = userData.lastWorkoutDate ? new Date(userData.lastWorkoutDate.toDate()) : null

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (allCompleted) {
          if (!lastWorkoutDate) {
            streak = 1
          } else {
            const lastWorkoutDay = lastWorkoutDate.toISOString().split("T")[0]
            const yesterdayStr = yesterday.toISOString().split("T")[0]

            if (lastWorkoutDay === yesterdayStr) {
              streak += 1
            } else if (lastWorkoutDay !== today) {
              streak = 1
            }
          }
        }

        await updateDoc(userDocRef, {
          workoutPlan,
          activities,
          workoutStreak: allCompleted ? streak : userData.workoutStreak || 0,
          lastWorkoutDate: allCompleted ? new Date() : userData.lastWorkoutDate,
        })

        toast({
          title: "Progress saved",
          description: allCompleted ? "Great job completing your workout!" : "Your progress has been saved.",
        })
      }
    } catch (error) {
      console.error("Error saving workout progress:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {loading ? (
        <p>Loading workout plan...</p>
      ) : !workoutPlan.length ? (
        <p>No workout plan found.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Workout Plan</CardTitle>
            <CardDescription>Select a day to view your exercises.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {workoutPlan.map((day) => (
                <Button
                  key={day.id}
                  variant={activeDay === day.id ? "secondary" : "outline"}
                  onClick={() => setActiveDay(day.id)}
                >
                  {day.name}
                </Button>
              ))}
            </div>
          </CardContent>
          {activeDay && (
            <CardContent>
              {workoutPlan
                .find((day) => day.id === activeDay)
                ?.exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={exercise.id}
                      checked={exercise.completed}
                      onCheckedChange={() => handleToggleExercise(activeDay, exercise.id)}
                    />
                    <label
                      htmlFor={exercise.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {exercise.name} ({exercise.sets} sets x {exercise.reps} reps)
                    </label>
                    {exercise.completed && <CheckCircle className="text-green-500" />}
                  </div>
                ))}
            </CardContent>
          )}
          {activeDay && workoutPlan.find((day) => day.id === activeDay)?.exercises.length > 0 && (
            <CardFooter>
              <Button className="w-full neon-button" onClick={handleSaveProgress} disabled={submitting}>
                {submitting ? "Saving..." : "Save Progress"}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  )
}
