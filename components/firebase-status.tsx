"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function FirebaseStatus() {
  const [status, setStatus] = useState({
    auth: false,
    firestore: false,
    config: false,
  })

  useEffect(() => {
    const checkFirebaseStatus = () => {
      // Check if Firebase config is present
      const configKeys = [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]

      const configComplete = configKeys.every((key) => process.env[key] && process.env[key] !== "undefined")

      setStatus({
        auth: !!auth,
        firestore: !!db,
        config: configComplete,
      })
    }

    checkFirebaseStatus()
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null // Don't show in production
  }

  return (
    <Card className="mb-4 border-yellow-500">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
          Firebase Configuration Status
        </CardTitle>
        <CardDescription>Development mode - checking Firebase setup</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2">
          {status.config ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>Environment Variables</span>
        </div>
        <div className="flex items-center space-x-2">
          {status.auth ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>Firebase Auth</span>
        </div>
        <div className="flex items-center space-x-2">
          {status.firestore ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>Firestore Database</span>
        </div>
        {!status.config && (
          <p className="text-sm text-red-500 mt-2">
            Missing Firebase environment variables. Please check your .env.local file.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
