"use client"

import type React from "react"
import { useState, useEffect, useCallback, Suspense } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Calendar, Clock, DollarSign, MapPin, Star, Users, BarChart3,
  ArrowUp, ArrowDown, Plus, Loader2, Building2, CheckCircle2,
  AlertCircle, ImagePlus, Trash2,
} from "lucide-react"
import { SportBadge } from "@/components/sport-icon"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/animated/fade-in"

/* â”€â”€â”€ types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
interface Facility { id: string; name: string; type: string; price: number; available: boolean }
interface OwnerVenue {
  id: string; name: string; location: string; address?: string; sports: string[]
  price: number; rating: number; review_count: number; images: string[]
  facilities: Facility[]; totalBookings: number; confirmedBookings: number
  is_active: boolean
}
interface BookingItem {
  id: string; date: string; start_time: string; duration: number; price: number
  status: string; payment_status: string
  venues?: { id: string; name: string }
  facilities?: { id: string; name: string; type: string }
  profiles?: { id: string; full_name: string; phone?: string }
}
interface Analytics {
  totalRevenue: number; totalBookings: number; averageRating: number; occupancyRate: number
  monthlyRevenue: { month: string; revenue: number; bookings: number }[]
  recentBookings: BookingItem[]
}

/* â”€â”€â”€ sport options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SPORTS_OPTIONS = ["football", "basketball", "tennis", "padel", "squash", "volleyball", "swimming", "gym"]

const SPORT_LABELS: Record<string, string> = {
  football: "Football", basketball: "Basketball", tennis: "Tennis",
  padel: "Padel", squash: "Squash", volleyball: "Volleyball",
  swimming: "Swimming", gym: "Gym",
}

/* â”€â”€â”€ Add Venue form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AddVenueSheet({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([""])

  const toggleSport = (s: string) =>
    setSelectedSports((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (selectedSports.length === 0) { setError("Select at least one sport"); return }
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      location: fd.get("location") as string,
      address: fd.get("address") as string,
      price: Number(fd.get("price")),
      sports: selectedSports,
      images: imageUrls.filter(Boolean),
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/owner/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to create venue"); return }
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setSelectedSports([])
        setImageUrls([""])
        onCreated()
      }, 1200)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Venue
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[92dvh] overflow-y-auto rounded-t-2xl pb-10">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add New Venue
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-lg">Venue created!</p>
            <p className="text-sm text-muted-foreground">Your venue has been added successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Venue name *</Label>
              <Input id="name" name="name" placeholder="e.g. Al Nasr Sports Club" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Brief description of your venue" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="location">Area / City *</Label>
                <Input id="location" name="location" placeholder="e.g. Maadi, Cairo" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price / hour (EGP) *</Label>
                <Input id="price" name="price" type="number" min={1} placeholder="350" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Full address</Label>
              <Input id="address" name="address" placeholder="Street, building numberâ€¦" />
            </div>

            {/* Sports */}
            <div className="space-y-2">
              <Label>Sports offered *</Label>
              <div className="flex flex-wrap gap-2">
                {SPORTS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSport(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedSports.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {SPORT_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Image URLs</Label>
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const next = [...imageUrls]
                      next[i] = e.target.value
                      setImageUrls(next)
                    }}
                    placeholder="https://â€¦"
                    className="flex-1"
                  />
                  {imageUrls.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setImageUrls([...imageUrls, ""])}
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Add image
              </Button>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating venueâ€¦</> : "Create Venue"}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}

function AddFacilitySheet({ venueId, defaultSport, onCreated }: { venueId: string; defaultSport?: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState(defaultSport && SPORTS_OPTIONS.includes(defaultSport) ? defaultSport : "football")
  const [price, setPrice] = useState("")
  const [capacity, setCapacity] = useState("10")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim()) {
      setError("Facility name is required")
      return
    }
    if (!price || Number(price) <= 0) {
      setError("Enter a valid facility price")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/venues/${venueId}/facilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          price: Number(price),
          capacity: Number(capacity || 10),
          equipmentIncluded: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to add facility")
        return
      }

      setOpen(false)
      setName("")
      setPrice("")
      setCapacity("10")
      onCreated()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">Add Facility</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[72dvh] overflow-y-auto rounded-t-2xl pb-10">
        <SheetHeader className="pb-4">
          <SheetTitle>Add Facility</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="facility-name">Facility Name</Label>
            <Input id="facility-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Football Pitch A" required />
          </div>

          <div className="space-y-1.5">
            <Label>Sport Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS_OPTIONS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setType(sport)}
                  className={`rounded-md border px-3 py-2 text-sm ${type === sport ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"}`}
                >
                  {SPORT_LABELS[sport]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="facility-price">Price / hour (EGP)</Label>
              <Input id="facility-price" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="facility-capacity">Capacity</Label>
              <Input id="facility-capacity" type="number" min={1} max={200} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Facility"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* â”€â”€â”€ Status badge helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "text-green-700 bg-green-50 border-green-200",
    upcoming: "text-green-700 bg-green-50 border-green-200",
    pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
    canceled: "text-red-700 bg-red-50 border-red-200",
    completed: "text-gray-600 bg-gray-100 border-gray-200",
  }
  return (
    <Badge variant="outline" className={colors[status] ?? "text-gray-600 bg-gray-100"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

/* â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function OwnerPortalInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "dashboard")
  const [venues, setVenues] = useState<OwnerVenue[]>([])
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  // Sync tab when URL query param changes (from bottom nav)
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [venRes, bkRes, anRes] = await Promise.all([
        fetch("/api/owner/venues"),
        fetch("/api/owner/bookings"),
        fetch("/api/owner/analytics"),
      ])
      if (venRes.status === 401 || venRes.status === 403) { router.replace("/auth/login"); return }
      const [venData, bkData, anData] = await Promise.all([venRes.json(), bkRes.json(), anRes.json()])
      setVenues(venData.data ?? [])
      setBookings(bkData.data?.bookings ?? bkData.data ?? [])
      setAnalytics(anData.data ?? null)
    } catch {
      // keep existing state
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const stats = analytics ?? {
    totalRevenue: venues.reduce((s, v) => s + v.price * v.totalBookings, 0),
    totalBookings: venues.reduce((s, v) => s + v.totalBookings, 0),
    averageRating: venues.length ? venues.reduce((s, v) => s + v.rating, 0) / venues.length : 0,
    occupancyRate: 0,
    monthlyRevenue: [],
    recentBookings: [],
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm p-4 border-b">
        <FadeIn y={-6}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Owner Portal</h1>
              <p className="text-xs text-muted-foreground">{venues.length} venue{venues.length !== 1 ? "s" : ""} listed</p>
            </div>
            <AddVenueSheet onCreated={fetchData} />
          </div>
        </FadeIn>
      </header>

      <main className="container p-4">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* â”€â”€ Dashboard â”€â”€ */}
          <TabsContent value="dashboard" className="space-y-4">
            <FadeIn>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: DollarSign, label: "Total Revenue", value: `EGP ${stats.totalRevenue.toLocaleString()}` },
                  { icon: Calendar, label: "Total Bookings", value: stats.totalBookings },
                  { icon: Star, label: "Avg Rating", value: stats.averageRating.toFixed(1) },
                  { icon: Users, label: "Occupancy", value: `${stats.occupancyRate ?? 0}%` },
                ].map(({ icon: Icon, label, value }) => (
                  <Card key={label}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Icon className="h-7 w-7 text-primary mb-2" />
                      <div className="text-xl font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.07}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {(analytics?.recentBookings ?? bookings).slice(0, 4).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No bookings yet</p>
                  ) : (analytics?.recentBookings ?? bookings).slice(0, 4).map((b) => (
                    <div key={b.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-sm">{b.facilities?.name ?? b.venues?.name ?? "â€”"}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />{b.date}
                          {b.start_time && <><Clock className="h-3 w-3 ml-1" />{b.start_time}</>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">EGP {b.price}</div>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                  {bookings.length > 4 && (
                    <Button variant="outline" className="w-full" size="sm" onClick={() => setActiveTab("bookings")}>
                      View all {bookings.length} bookings
                    </Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Monthly revenue bars */}
            {analytics && analytics.monthlyRevenue.length > 0 && (
              <FadeIn delay={0.12}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      {analytics.monthlyRevenue.map((m) => {
                        const max = Math.max(...analytics.monthlyRevenue.map((x) => x.revenue), 1)
                        const pct = Math.round((m.revenue / max) * 100)
                        return (
                          <div key={m.month} className="flex items-center gap-3 text-sm">
                            <span className="w-12 text-muted-foreground text-xs">{m.month}</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <motion.div
                                className="bg-primary h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                              />
                            </div>
                            <span className="w-20 text-right font-medium text-xs">EGP {m.revenue.toLocaleString()}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </TabsContent>

          {/* â”€â”€ Bookings â”€â”€ */}
          <TabsContent value="bookings" className="space-y-3">
            <FadeIn>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">{bookings.length} Booking{bookings.length !== 1 ? "s" : ""}</h2>
              </div>
            </FadeIn>
            {bookings.length === 0 ? (
              <FadeIn delay={0.05}>
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No bookings yet</p>
                  <p className="text-sm mt-1">Bookings from players will appear here</p>
                </div>
              </FadeIn>
            ) : bookings.map((b, i) => (
              <FadeIn key={b.id} delay={i * 0.04}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{b.venues?.name ?? "â€”"}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">{b.facilities?.name}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{b.date}</span>
                          {b.start_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.start_time}</span>}
                          {b.profiles?.full_name && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.profiles.full_name}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold">EGP {b.price}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{b.duration}h</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </TabsContent>

          {/* â”€â”€ Venues â”€â”€ */}
          <TabsContent value="venues" className="space-y-3">
            <FadeIn>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">My Venues</h2>
                <AddVenueSheet onCreated={fetchData} />
              </div>
            </FadeIn>

            {venues.length === 0 ? (
              <FadeIn delay={0.05}>
                <div className="text-center py-16 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No venues yet</p>
                  <p className="text-sm mt-1">Add your first venue to start receiving bookings</p>
                </div>
              </FadeIn>
            ) : venues.map((venue, i) => (
              <FadeIn key={venue.id} delay={i * 0.04}>
                <Card className="overflow-hidden">
                  <div className="relative h-36 w-full">
                    <Image
                      src={venue.images?.[0] || "/placeholder.svg"}
                      alt={venue.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-foreground text-xs gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {venue.rating.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="outline"
                        className={venue.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
                      >
                        {venue.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{venue.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 mr-1" />{venue.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">EGP {venue.price}</div>
                        <div className="text-xs text-muted-foreground">/hour</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-wrap gap-1">
                        {(venue.sports ?? []).slice(0, 2).map((sport) => (
                          <SportBadge key={sport} sport={sport} />
                        ))}
                        {(venue.sports ?? []).length > 2 && (
                          <span className="text-xs text-muted-foreground">+{venue.sports.length - 2}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {venue.facilities?.length ?? 0} facilit{(venue.facilities?.length ?? 0) === 1 ? "y" : "ies"}
                        </div>
                        <AddFacilitySheet venueId={venue.id} defaultSport={venue.sports?.[0]} onCreated={fetchData} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </TabsContent>

          {/* â”€â”€ Analytics â”€â”€ */}
          <TabsContent value="analytics" className="space-y-4">
            <FadeIn>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Total Revenue</div>
                    <div className="text-2xl font-bold mt-1">EGP {stats.totalRevenue.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-primary mt-1">
                      <ArrowUp className="h-3 w-3" />All time
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Avg Booking Value</div>
                    <div className="text-2xl font-bold mt-1">
                      EGP {stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString() : 0}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <BarChart3 className="h-3 w-3" />per booking
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Total Bookings</div>
                    <div className="text-2xl font-bold mt-1">{stats.totalBookings}</div>
                    <div className="flex items-center gap-1 text-xs text-primary mt-1">
                      <Calendar className="h-3 w-3" />all venues
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Avg Rating</div>
                    <div className="text-2xl font-bold mt-1">{stats.averageRating.toFixed(1)}</div>
                    <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />across venues
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>

            {analytics && analytics.monthlyRevenue.length > 0 && (
              <FadeIn delay={0.07}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue â€” Last 6 Months</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    {analytics.monthlyRevenue.map((m) => {
                      const max = Math.max(...analytics.monthlyRevenue.map((x) => x.revenue), 1)
                      const pct = Math.round((m.revenue / max) * 100)
                      return (
                        <div key={m.month} className="flex items-center gap-3 text-sm">
                          <span className="w-12 text-muted-foreground text-xs">{m.month}</span>
                          <div className="flex-1 bg-muted rounded-full h-2.5">
                            <motion.div
                              className="bg-primary h-2.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, delay: 0.1 }}
                            />
                          </div>
                          <span className="w-24 text-right font-medium text-xs">EGP {m.revenue.toLocaleString()}</span>
                          <span className="w-8 text-right text-muted-foreground text-xs">{m.bookings}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Per-venue stats */}
            {venues.length > 0 && (
              <FadeIn delay={0.12}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Venue Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {venues.map((v) => (
                      <div key={v.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium text-sm">{v.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />{v.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{v.totalBookings} bookings</div>
                          <div className="flex items-center gap-1 text-xs text-yellow-600 justify-end">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {v.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default function OwnerPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <OwnerPortalInner />
    </Suspense>
  )
}
