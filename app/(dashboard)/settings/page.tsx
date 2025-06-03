"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Palette, User, LogOut } from "lucide-react"

const themes = [
  {
    id: "neon",
    name: "Neon Purple-Pink",
    description: "Vibrant purple and pink neon theme",
    preview: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Classic dark theme",
    preview: "bg-gradient-to-r from-gray-800 to-gray-900",
  },
  {
    id: "light",
    name: "Light Mode",
    description: "Clean light theme",
    preview: "bg-gradient-to-r from-gray-100 to-gray-200",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Calming blue ocean theme",
    preview: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  {
    id: "forest",
    name: "Forest Green",
    description: "Natural green forest theme",
    preview: "bg-gradient-to-r from-green-600 to-emerald-500",
  },
]

export default function SettingsPage() {
  const { user, logOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme)
  const { toast } = useToast()

  const handleThemeChange = async () => {
    try {
      await setTheme(selectedTheme as any)
      toast({
        title: "Theme updated",
        description: "Your theme preference has been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      })
    }
  }

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="border-2 neon-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 neon-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5 text-primary" />
            Theme Selection
          </CardTitle>
          <CardDescription>Choose your preferred app theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
            {themes.map((themeOption) => (
              <div key={themeOption.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value={themeOption.id} id={themeOption.id} />
                <div className="flex-1">
                  <Label htmlFor={themeOption.id} className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${themeOption.preview}`}></div>
                      <div>
                        <p className="font-medium">{themeOption.name}</p>
                        <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>

          {selectedTheme !== theme && (
            <Button onClick={handleThemeChange} className="w-full neon-button">
              Apply Theme
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 neon-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LogOut className="mr-2 h-5 w-5 text-primary" />
            Account Actions
          </CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
