"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, QrCode } from "lucide-react"
import { FadeIn } from "@/components/animated/fade-in"

interface ApiBooking {
  id: string
  date: string
  start_time: string
  duration: number
  price: number
  status: string
  venues: { id: string; name: string; location: string; district: string; images: string[] }
  facilities: { id: string; name: string; type: string; image: string } | null
}

function formatDate(dateStr: string): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const date = new Date(dateStr)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BookingCard({
  booking,
  badge,
  badgeClass,
  action,
}: {
  booking: ApiBooking
  badge: string
  badgeClass: string
  action: React.ReactNode
}) {
  const image = booking.venues?.images?.[0] || "/placeholder.svg"
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
            <Image src={image} alt={booking.venues?.name ?? "Venue"} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{booking.venues?.name}</h3>
              <Badge variant="outline" className={badgeClass}>{badge}</Badge>
            </div>
            {booking.facilities && (
              <p className="text-sm text-muted-foreground">{booking.facilities.name}</p>
            )}
            <div className="flex items-center mt-2 text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="mr-3">{formatDate(booking.date)}</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTime(booking.start_time)} Â· {booking.duration}h</span>
            </div>
            <div className="flex items-center mt-1 text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{booking.venues?.location}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="font-semibold">EGP {booking.price}</div>
              {action}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function fetchBookings(status: string): Promise<ApiBooking[]> {
  try {
    const res = await fetch(`/api/bookings?status=${status}&pageSize=50`)
    if (!res.ok) return []
    const json = await res.json()
    return json.data?.bookings ?? []
  } catch {
    return []
  }
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [upcomingBookings, setUpcomingBookings] = useState<ApiBooking[]>([])
  const [pastBookings, setPastBookings] = useState<ApiBooking[]>([])
  const [canceledBookings, setCanceledBookings] = useState<ApiBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchBookings("upcoming"), fetchBookings("past"), fetchBookings("canceled")])
      .then(([upcoming, past, canceled]) => {
        setUpcomingBookings(upcoming)
        setPastBookings(past)
        setCanceledBookings(canceled)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="pb-20">
      <FadeIn y={-6} duration={0.28}>
      <header className="sticky top-0 z-10 bg-background p-4 border-b">
        <h1 className="text-xl font-bold">My Bookings</h1>
      </header>
      </FadeIn>

      <FadeIn delay={0.08}>
      <main className="container p-4">
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
          </TabsList>

          {/* â”€â”€ Upcoming â”€â”€ */}
          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <><SkeletonCard /><SkeletonCard /></>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => {
                const label = formatDate(booking.date)
                const badgeClass =
                  label === "Today" ? "text-green-600 bg-green-50"
                  : label === "Tomorrow" ? "text-blue-600 bg-blue-50"
                  : "text-purple-600 bg-purple-50"
                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    badge={label}
                    badgeClass={badgeClass}
                    action={
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <QrCode className="h-3 w-3 mr-1" />
                          Ticket
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/venue/${booking.venues?.id}`}>Directions</Link>
                        </Button>
                      </div>
                    }
                  />
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-40 border rounded-lg">
                <p className="text-muted-foreground mb-4">You don&apos;t have any upcoming bookings</p>
                <Button asChild><Link href="/search">Find a Venue</Link></Button>
              </div>
            )}
          </TabsContent>

          {/* â”€â”€ Past â”€â”€ */}
          <TabsContent value="past" className="space-y-4">
            {isLoading ? (
              <SkeletonCard />
            ) : pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  badge="Completed"
                  badgeClass="text-gray-600 bg-gray-100"
                  action={<Button variant="outline" size="sm">Leave Review</Button>}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-40 border rounded-lg">
                <p className="text-muted-foreground">You don&apos;t have any past bookings</p>
              </div>
            )}
          </TabsContent>

          {/* â”€â”€ Canceled â”€â”€ */}
          <TabsContent value="canceled" className="space-y-4">
            {isLoading ? (
              <SkeletonCard />
            ) : canceledBookings.length > 0 ? (
              canceledBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  badge="Canceled"
                  badgeClass="text-red-600 bg-red-50"
                  action={
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/venue/${booking.venues?.id}`}>Book Again</Link>
                    </Button>
                  }
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-40 border rounded-lg">
                <p className="text-muted-foreground">You don&apos;t have any canceled bookings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      </FadeIn>

      <BottomNavigation />
    </div>
  )
}
