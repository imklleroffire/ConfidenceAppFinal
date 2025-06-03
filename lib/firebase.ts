import { initializeApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate that all required config values are present
const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    console.error(`Missing Firebase config: NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)
  }
}

// Initialize Firebase
let app
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
} catch (error) {
  console.error("Firebase initialization error:", error)
  throw new Error("Failed to initialize Firebase. Please check your configuration.")
}

const auth = getAuth(app)
const db = getFirestore(app)

// Only connect to emulators in development and if not already connected
if (process.env.NODE_ENV === "development") {
  try {
    // Check if emulators are already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    }
    // @ts-ignore - Firestore emulator connection check
    if (!db._delegate._databaseId.projectId.includes("demo-")) {
      connectFirestoreEmulator(db, "localhost", 8080)
    }
  } catch (error) {
    // Emulators not running or already connected, continue with production
    console.log("Using production Firebase")
  }
}

export { app, auth, db }
