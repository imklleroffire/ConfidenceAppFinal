import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { SignInForm } from "@/components/auth/sign-in-form"
import { ThemeWrapper } from "@/components/theme-wrapper"

export default function Home() {
  // Check if user is already authenticated via cookies
  const authCookie = cookies().get("auth")
  if (authCookie) {
    redirect("/dashboard")
  }

  return (
    <ThemeWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-2 animate-glow">Confidence Boost</h1>
          <p className="text-center mb-8 text-muted-foreground">Build your confidence one step at a time</p>
          <SignInForm />
        </div>
      </div>
    </ThemeWrapper>
  )
}
