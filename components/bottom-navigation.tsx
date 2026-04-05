"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Search, CalendarDays, Users, UserCircle2, Building2, LayoutDashboard, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

const PLAYER_NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Explore" },
  { href: "/bookings", icon: CalendarDays, label: "Bookings" },
  { href: "/teams", icon: Users, label: "Teams" },
  { href: "/profile", icon: UserCircle2, label: "Profile" },
]

const OWNER_NAV_ITEMS = [
  { href: "/owner?tab=dashboard", icon: Home, label: "Home" },
  { href: "/owner", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/owner?tab=venues", icon: Building2, label: "Venues" },
  { href: "/owner?tab=analytics", icon: BarChart3, label: "Analytics" },
  { href: "/profile", icon: UserCircle2, label: "Profile" },
]

// NAV_ITEMS kept for backwards compat — resolved dynamically below
const NAV_ITEMS = PLAYER_NAV_ITEMS

export function BottomNavigation() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (pathname.startsWith("/auth") || pathname === "/welcome") {
    return null
  }

  const isOwnerArea = pathname.startsWith("/owner")
  const navItems = isOwnerArea ? OWNER_NAV_ITEMS : NAV_ITEMS

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/60 safe-area-inset">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const basePath = href.split("?")[0]
          const isActive =
            pathname === basePath ||
            (basePath === "/owner" && pathname.startsWith("/owner")) ||
            (basePath !== "/dashboard" && basePath !== "/owner" && pathname.startsWith(`${basePath}/`))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 transition-colors duration-150",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-colors duration-150",
                  isActive ? "bg-primary/10" : "",
                )}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn("text-[10px] font-medium tracking-tight", isActive ? "text-primary" : "")}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
