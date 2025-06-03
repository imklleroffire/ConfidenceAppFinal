"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth-context"

type ThemeType = "neon" | "dark" | "light" | "ocean" | "forest"

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("neon")
  const { user } = useAuth()

  useEffect(() => {
    // Load theme from user settings if available
    const loadTheme = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists() && userDoc.data().theme) {
          setThemeState(userDoc.data().theme as ThemeType)
        }
      }
    }

    loadTheme()
  }, [user])

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme)

    // Save theme to user settings if logged in
    if (user) {
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, { theme: newTheme })
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
