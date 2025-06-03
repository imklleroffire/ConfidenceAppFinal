"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function Header() {
  const { logOut } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await logOut()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="border-b p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold neon-glow">Confidence Boost</h1>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </header>
  )
}
