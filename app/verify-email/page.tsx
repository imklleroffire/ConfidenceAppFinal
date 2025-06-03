import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeWrapper } from "@/components/theme-wrapper"

export default function VerifyEmail() {
  return (
    <ThemeWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 neon-border">
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>We&apos;ve sent a verification email to your inbox</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center">
                Please check your email and click on the verification link to complete your registration.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                If you don&apos;t see the email, check your spam folder.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Link href="/" className="w-full">
                <Button className="w-full neon-button">Return to Sign In</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ThemeWrapper>
  )
}
