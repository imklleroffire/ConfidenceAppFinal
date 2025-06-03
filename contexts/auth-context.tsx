"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  hasCompletedSurvey: boolean
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false)
  const router = useRouter()

  const refreshUserData = async () => {
    if (!user) return

    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setHasCompletedSurvey(userData.hasCompletedSurvey || false)
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          // Check if user has completed the survey
          const userDocRef = doc(db, "users", currentUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            setHasCompletedSurvey(userData.hasCompletedSurvey || false)
          } else {
            // If user document doesn't exist, create it
            await setDoc(userDocRef, {
              email: currentUser.email,
              createdAt: new Date(),
              hasCompletedSurvey: false,
              workoutStreak: 0,
              confidenceStreak: 0,
              lastWorkoutDate: null,
              lastConfidenceQuizDate: null,
              theme: "neon",
              activities: {},
            })
            setHasCompletedSurvey(false)
          }
        } catch (error) {
          console.error("Error fetching/creating user data:", error)
          setHasCompletedSurvey(false)
        }
      } else {
        setHasCompletedSurvey(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      console.log("Attempting to create user with email:", email)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("User created successfully:", userCredential.user.uid)

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user)
        console.log("Verification email sent")
      } catch (verificationError) {
        console.warn("Failed to send verification email:", verificationError)
        // Don't throw here, as the account was created successfully
      }

      // Create user document in Firestore with proper error handling
      try {
        const userDocRef = doc(db, "users", userCredential.user.uid)
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          createdAt: new Date(),
          hasCompletedSurvey: false,
          workoutStreak: 0,
          confidenceStreak: 0,
          lastWorkoutDate: null,
          lastConfidenceQuizDate: null,
          theme: "neon",
          activities: {},
        })
        console.log("User document created in Firestore")
      } catch (firestoreError: any) {
        console.error("Failed to create user document:", firestoreError)

        // If it's a permission error, we'll handle it later when the user tries to save data
        if (firestoreError.code !== "permission-denied") {
          throw new Error("Failed to initialize user profile")
        }
      }

      router.push("/verify-email")
    } catch (error: any) {
      console.error("Error in signUp:", error)

      // Provide user-friendly error messages
      let errorMessage = "Failed to create account"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password"
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage = "Firebase configuration error. Please check your setup"
      } else if (error.message) {
        errorMessage = error.message
      }

      throw new Error(errorMessage)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error signing in:", error)

      let errorMessage = "Failed to sign in"

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later"
      } else if (error.message) {
        errorMessage = error.message
      }

      throw new Error(errorMessage)
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error: any) {
      console.error("Error signing out:", error)
      throw new Error("Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logOut, hasCompletedSurvey, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
