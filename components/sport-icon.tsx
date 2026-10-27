import React from "react"
import { cn } from "@/lib/utils"
import {
  GiSoccerBall,
  GiTennisBall,
  GiBasketballBall,
  GiVolleyballBall,
  GiTennisRacket,
  GiPaddles,
  GiPoolDive,
  GiWeightLiftingUp,
} from "react-icons/gi"

export type SportKey =
  | "football"
  | "tennis"
  | "basketball"
  | "volleyball"
  | "squash"
  | "padel"
  | "swimming"
  | "gym"

// Cast each icon to a safe element type for JSX
type SportIconType = (props: any) => React.ReactElement | null

const SPORT_ICONS: Record<string, SportIconType> = {
  football: GiSoccerBall as SportIconType,
  tennis: GiTennisBall as SportIconType,
  basketball: GiBasketballBall as SportIconType,
  volleyball: GiVolleyballBall as SportIconType,
  squash: GiTennisRacket as SportIconType,
  padel: GiPaddles as SportIconType,
  swimming: GiPoolDive as SportIconType,
  gym: GiWeightLiftingUp as SportIconType,
}

interface SportMeta {
  label: string
  iconClass: string
  chipClass: string
}

const SPORT_META: Record<string, SportMeta> = {
  football: {
    label: "Football",
    iconClass: "text-emerald-700 dark:text-emerald-400",
    chipClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  tennis: {
    label: "Tennis",
    iconClass: "text-yellow-700 dark:text-yellow-400",
    chipClass: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800",
  },
  basketball: {
    label: "Basketball",
    iconClass: "text-orange-700 dark:text-orange-400",
    chipClass: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
  },
  volleyball: {
    label: "Volleyball",
    iconClass: "text-blue-700 dark:text-blue-400",
    chipClass: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  squash: {
    label: "Squash",
    iconClass: "text-amber-700 dark:text-amber-400",
    chipClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  padel: {
    label: "Padel",
    iconClass: "text-pink-700 dark:text-pink-400",
    chipClass: "bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800",
  },
  swimming: {
    label: "Swimming",
    iconClass: "text-cyan-700 dark:text-cyan-400",
    chipClass: "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800",
  },
  gym: {
    label: "Gym",
    iconClass: "text-purple-700 dark:text-purple-400",
    chipClass: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  },
}

const FALLBACK: SportMeta = {
  label: "Sport",
  iconClass: "text-gray-600 dark:text-gray-400",
  chipClass: "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700",
}

/** Bare sport icon */
export function SportEmoji({ sport, className }: { sport: string; className?: string }) {
  const meta = SPORT_META[sport] ?? FALLBACK
  const Icon = SPORT_ICONS[sport] ?? (GiSoccerBall as SportIconType)
  return <Icon aria-label={meta.label} className={cn("w-5 h-5 shrink-0", meta.iconClass, className)} />
}

/** Colored pill badge for venue cards */
export function SportBadge({ sport, className }: { sport: string; className?: string }) {
  const meta = SPORT_META[sport] ?? FALLBACK
  const Icon = SPORT_ICONS[sport] ?? (GiSoccerBall as SportIconType)
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", meta.chipClass, className)}>
      <Icon aria-label={meta.label} className="w-3.5 h-3.5 shrink-0" />
      <span>{meta.label}</span>
    </span>
  )
}

/** Returns a sport display label */
export function getSportLabel(sport: string): string {
  return (SPORT_META[sport] ?? FALLBACK).label
}
