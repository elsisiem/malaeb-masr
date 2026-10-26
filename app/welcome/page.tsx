"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, Loader2, Zap, MapPin, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import ThemeToggle from "@/components/theme-toggle"

export default function WelcomePage() {
  const router = useRouter()
  const [guestLoading, setGuestLoading] = useState(false)

  const handleGuest = async () => {
    setGuestLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInAnonymously()
      if (!error) {
        router.push("/dashboard")
        router.refresh()
      } else {
        console.error("Guest sign-in failed:", error.message)
        // Fallback: just navigate (middleware will redirect to login if needed)
        router.push("/search")
      }
    } catch {
      router.push("/search")
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Hero Image with animated overlay */}
      <div className="relative h-[62vh] w-full overflow-hidden">
        <Image
          src="/images/soccer4.jpg"
          alt="Sports facility"
          fill
          className="object-cover scale-105"
          priority
          sizes="100vw"
          style={{ transform: "scale(1.05)" }}
        />

        {/* Layered gradients for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-background" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />

        {/* Animated shimmer ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{ width: 500, height: 500, opacity: 0.15 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{ width: 700, height: 700, opacity: 0.1 }}
          transition={{ duration: 2.4, ease: "easeOut", delay: 0.2 }}
        />

        {/* App logo / name */}
        <motion.div
          className="absolute top-12 left-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-primary-foreground font-bold text-lg leading-none">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight drop-shadow-lg">Malaeb Masr</span>
          </div>
        </motion.div>

        {/* Theme toggle — top-right, glassy overlay style */}
        <motion.div
          className="absolute top-12 right-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <ThemeToggle variant="overlay" />
        </motion.div>

        {/* Bottom fade pill */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <Zap className="h-3 w-3 text-primary fill-primary" />
            <span className="text-white/90 text-xs font-medium tracking-wide">Book in seconds</span>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-7 pb-10 flex flex-col justify-between">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
        >
          <motion.div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Sports booking for Egypt
          </motion.div>

          <h1 className="text-[2.1rem] font-extrabold tracking-tight leading-tight">
            Find &amp; book{" "}
            <span className="text-primary">sports venues</span>{" "}
            instantly
          </h1>
        </motion.div>

        <motion.div
          className="space-y-3 mt-8"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.3 }}
        >
          {/* Feature pills */}
          <div className="flex gap-2 flex-wrap mb-1">
            {[
              { icon: <Zap className="h-3 w-3" />, label: "Instant Booking" },
              { icon: <MapPin className="h-3 w-3" />, label: "Near You" },
              { icon: <ShieldCheck className="h-3 w-3" />, label: "Secure Pay" },
            ].map((feat, i) => (
              <motion.span
                key={feat.label}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                {feat.icon}
                {feat.label}
              </motion.span>
            ))}
          </div>

          <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
            <Button asChild className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 text-base border-border/60 hover:bg-muted/60"
              size="lg"
            >
              <Link href="/auth/register">Create an account</Link>
            </Button>
          </motion.div>

          {/* Owner CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-1 text-sm"
          >
            <span className="text-muted-foreground">Own a venue?</span>
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline underline-offset-4 flex items-center gap-0.5"
            >
              List it free
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              size="lg"
              onClick={handleGuest}
              disabled={guestLoading}
            >
              {guestLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in as guest…</span>
                  <span />
                </>
              ) : (
                <>
                  <span>Continue as guest</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
