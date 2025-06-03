"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy, CalendarIcon, Dumbbell, Brain } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          setUserData(userDoc.data())
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Get recent activity for the last 7 days
  const getRecentActivity = () => {
    if (!userData?.activities) return []

    const activities = userData.activities
    const recentDays = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayActivity = activities[dateStr] || { workout: false, confidence: false }

      recentDays.push({
        date: dateStr,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        workout: dayActivity.workout,
        confidence: dayActivity.confidence,
      })
    }

    return recentDays
  }

  const recentActivity = getRecentActivity()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-muted-foreground">Track your confidence journey and celebrate your progress</p>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 neon-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="mr-2 h-5 w-5 text-primary" />
              Your Streaks
            </CardTitle>
            <CardDescription>Keep your momentum going</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-primary">{userData?.workoutStreak || 0}</span>
                <span className="text-sm text-muted-foreground">Workout Days</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-secondary">{userData?.confidenceStreak || 0}</span>
                <span className="text-sm text-muted-foreground">Confidence Days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 neon-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-primary" />
              Focus Areas
            </CardTitle>
            <CardDescription>Based on your survey responses</CardDescription>
          </CardHeader>
          <CardContent>
            {userData?.focusAreas && userData.focusAreas.length > 0 ? (
              <ul className="space-y-2">
                {userData.focusAreas.map((area: string) => (
                  <li key={area} className="p-3 bg-muted rounded-lg">
                    {area === "social" && "Social Confidence"}
                    {area === "public_speaking" && "Public Speaking"}
                    {area === "body_image" && "Body Image"}
                    {area === "assertiveness" && "Assertiveness"}
                    {area === "self_worth" && "Self-Worth"}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Complete your survey to see personalized focus areas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-2 neon-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
            This Week's Activity
          </CardTitle>
          <CardDescription>Your progress over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {recentActivity.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                <div className="h-16 w-full border rounded-lg flex flex-col items-center justify-center space-y-1">
                  {day.workout && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                  {day.confidence && <div className="h-2 w-2 rounded-full bg-secondary"></div>}
                  {!day.workout && !day.confidence && <div className="h-2 w-2 rounded-full bg-muted"></div>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
              <span className="text-sm">Workout</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-secondary mr-2"></div>
              <span className="text-sm">Confidence</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/workout">
          <Card className="border-2 neon-border cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Start Today's Workout</h3>
              <p className="text-sm text-muted-foreground">Build physical confidence with your personalized routine</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/confidence">
          <Card className="border-2 neon-border cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">Practice Confidence</h3>
              <p className="text-sm text-muted-foreground">Take a social situation quiz to build mental confidence</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
