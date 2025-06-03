"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, Brain, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Workout",
    href: "/workout",
    icon: Dumbbell,
  },
  {
    name: "Confidence",
    href: "/confidence",
    icon: Brain,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:relative md:border-t-0 md:border-r md:h-screen md:w-64 md:flex-shrink-0">
      <div className="flex justify-around md:flex-col md:h-full md:p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-3 md:flex-row md:justify-start md:p-3 md:mb-2 rounded-md transition-colors",
                isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <item.icon className="h-5 w-5 md:mr-2" />
              <span className="text-xs md:text-sm">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
