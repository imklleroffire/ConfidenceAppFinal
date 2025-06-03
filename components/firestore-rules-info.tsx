"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`

export function FirestoreRulesInfo() {
  const { toast } = useToast()

  const copyRules = async () => {
    try {
      await navigator.clipboard.writeText(firestoreRules)
      toast({
        title: "Copied!",
        description: "Firestore rules copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the rules manually",
        variant: "destructive",
      })
    }
  }

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card className="mb-4 border-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
          Firestore Security Rules Required
        </CardTitle>
        <CardDescription>
          If you're getting permission errors, you need to set up Firestore security rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Go to Firebase Console → Firestore Database → Rules and replace the default rules with:
        </p>
        <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
          <pre>{firestoreRules}</pre>
        </div>
        <Button onClick={copyRules} variant="outline" size="sm" className="flex items-center">
          <Copy className="mr-2 h-4 w-4" />
          Copy Rules
        </Button>
        <p className="text-xs text-muted-foreground">
          These rules allow authenticated users to read and write only their own data.
        </p>
      </CardContent>
    </Card>
  )
}
