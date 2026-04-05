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
import {
  Calendar,
  Clock,
  Filter,
  MapPin,
  Star,
  Bell,
} from "lucide-react"
import { SportEmoji, SportBadge } from "@/components/sport-icon"
import { FadeIn } from "@/components/animated/fade-in"

interface Booking {
  id: string
  venue_id: string
  venues: { name: string; location: string; images: string[] } | null
  facilities: { name: string } | null
  date: string
  start_time: string
  price: number
  status: string
}

interface Venue {
  id: string
  name: string
  location: string
  district: string
  distance: number
  rating: number
  price: number
  sports: string[]
  images: string[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ full_name: string | null; email: string } | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, bookingsRes, venuesRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/bookings?status=upcoming&pageSize=1"),
          fetch("/api/venues?limit=4"),
        ])
        if (meRes.ok) {
          const { data } = await meRes.json()
          setUser(data)
        }
        if (bookingsRes.ok) {
          const { data } = await bookingsRes.json()
          setUpcomingBookings(data?.bookings || [])
        }
        if (venuesRes.ok) {
          const { data } = await venuesRes.json()
          setVenues(data?.venues || [])
        }
      } catch (err) {
        console.error("Dashboard fetch error", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const firstName = user?.full_name?.split(" ")[0] ?? "there"
  const nextBooking = upcomingBookings[0]

  return (
    <div className="pb-20">
      <FadeIn y={-6} duration={0.28}>
        <header className="sticky top-0 z-10 bg-background p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              {isLoading ? (
                <Skeleton className="h-6 w-32 mb-1" />
              ) : (
                <h1 className="text-xl font-bold">Hi, {firstName} </h1>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                Cairo, Egypt
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <Link href="/search"><Filter className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <Link href="/notifications"><Bell className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </header>
      </FadeIn>

      <main className="container p-4 space-y-6">
        {/* Upcoming Booking */}
        <FadeIn delay={0.05}>
          <section>
            <h2 className="text-lg font-semibold mb-3">Upcoming Booking</h2>
            {isLoading ? (
              <Card><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ) : nextBooking ? (
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={nextBooking.venues?.images?.[0] || "/placeholder.svg"}
                        alt={nextBooking.venues?.name ?? "Venue"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{nextBooking.venues?.name}</h3>
                        <Badge variant="outline" className="text-green-600 bg-green-50">Confirmed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{nextBooking.facilities?.name}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="mr-3">{new Date(nextBooking.date).toLocaleDateString("en-EG", { weekday: "short", month: "short", day: "numeric" })}</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{nextBooking.start_time?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{nextBooking.venues?.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/booking/${nextBooking.venue_id}?booking=${nextBooking.id}`}>View Details</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/venue/${nextBooking.venue_id}`}>Get Directions</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 text-center py-8">
                  <p className="text-muted-foreground mb-3">No upcoming bookings</p>
                  <Button asChild size="sm"><Link href="/search">Find a Venue</Link></Button>
                </CardContent>
              </Card>
            )}
          </section>
        </FadeIn>

        {/* Quick Filters */}
        <FadeIn delay={0.1}>
          <section className="overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {[
                { sport: "football", label: "Football" },
                { sport: "tennis", label: "Tennis" },
                { sport: "basketball", label: "Basketball" },
                { sport: "gym", label: "Gym" },
                { sport: "swimming", label: "Swimming" },
              ].map(({ sport, label }) => (
                <Button key={sport} variant="outline" className="rounded-full whitespace-nowrap gap-1.5" asChild>
                  <Link href={`/search?sport=${sport}`}>
                    <SportEmoji sport={sport} />
                    {label}
                  </Link>
                </Button>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Featured Promotion */}
        <FadeIn delay={0.15}>
          <section>
            <h2 className="text-lg font-semibold mb-3">Special Offers</h2>
            <div className="relative rounded-lg overflow-hidden h-40 hover:shadow-md transition-all">
              <Image src="/images/soccer3.jpg" alt="Promotion" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-end p-4">
                <Badge className="w-fit mb-2">Limited Time</Badge>
                <h3 className="text-white font-bold text-xl">30% Off First Booking</h3>
                <p className="text-white/80 text-sm">Use code: FIRST30</p>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Recommended Venues */}
        <FadeIn delay={0.2}>
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recommended For You</h2>
              <Link href="/search" className="text-sm text-primary">View All</Link>
            </div>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {isLoading ? (
                  [1, 2].map((i) => (
                    <Card key={i}><CardContent className="p-0">
                      <Skeleton className="h-40 w-full rounded-t-lg" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent></Card>
                  ))
                ) : venues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No venues available yet.</p>
                    <p className="text-sm mt-1">Check back soon!</p>
                  </div>
                ) : (
                  venues.slice(0, 2).map((venue) => (
                    <Card key={venue.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-0">
                        <div className="relative h-40 w-full">
                          <Image src={venue.images?.[0] || "/placeholder.svg"} alt={venue.name} fill className="object-cover rounded-t-lg" />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              {venue.rating?.toFixed(1) ?? "New"}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{venue.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {venue.location}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">EGP {venue.price}</div>
                              <div className="text-xs text-muted-foreground">per hour</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-wrap gap-1">
                              {venue.sports?.slice(0, 2).map((sport) => (
                                <SportBadge key={sport} sport={sport} />
                              ))}
                            </div>
                            <Button size="sm" asChild>
                              <Link href={`/venue/${venue.id}`}>Book Now</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              <TabsContent value="popular" className="space-y-4">
                {venues.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 2).map((venue) => (
                  <Card key={venue.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-0">
                      <div className="relative h-40 w-full">
                        <Image src={venue.images?.[0] || "/placeholder.svg"} alt={venue.name} fill className="object-cover rounded-t-lg" />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {venue.rating?.toFixed(1) ?? "New"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{venue.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {venue.location}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">EGP {venue.price}</div>
                            <div className="text-xs text-muted-foreground">per hour</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-wrap gap-1">
                            {venue.sports?.slice(0, 2).map((sport) => (
                              <SportBadge key={sport} sport={sport} />
                            ))}
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/venue/${venue.id}`}>Book Now</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </section>
        </FadeIn>
      </main>

      <BottomNavigation />
    </div>
  )
}
