"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  Info,
  MapPin,
  Share,
  Star,
  Users,
  ParkingMeterIcon as Parking,
  ShowerHeadIcon as Shower,
  Coffee,
  Wifi,
  Navigation,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { MapView } from "@/components/map-view"
import { venueToMapMarkers } from "@/lib/map-service"

interface ApiFacility {
  id: string
  name: string
  type: string
  price: number
  capacity: number
  image: string
  description: string
  is_available: boolean
}

interface ApiReview {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: { id: string; full_name: string; avatar_url: string | null }
}

interface ApiVenue {
  id: string
  name: string
  description: string
  location: string
  district: string
  rating: number
  review_count: number
  price_per_hour: number
  sports: string[]
  amenities: string[]
  images: string[]
  facilities: ApiFacility[]
  reviews: ApiReview[]
  isFavorited?: boolean
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ImageWithFallback } from "@/components/image-with-fallback"
import { SportEmoji } from "@/components/sport-icon"

export default function VenuePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedDate, setSelectedDate] = useState("Today")
  const [isLoading, setIsLoading] = useState(true)
  const [venue, setVenue] = useState<ApiVenue | null>(null)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/venues/${params.id}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setVenue(data)
          setLiked(data.isFavorited ?? false)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [params.id])

  const handleLike = async () => {
    const next = !liked
    setLiked(next)
    try {
      await fetch(`/api/venues/${params.id}/favorite`, { method: next ? "POST" : "DELETE" })
      toast({
        title: next ? "Added to favorites" : "Removed from favorites",
        description: next
          ? "This venue has been added to your favorites"
          : "This venue has been removed from your favorites",
      })
    } catch {
      setLiked(!next) // revert on error
    }
  }

  if (isLoading) {
    return (
      <div className="pb-20">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main>
          <Skeleton className="h-64 w-full" />
          <div className="container p-4 space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div>
              <Skeleton className="h-6 w-1/3 mb-3" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </main>

        <BottomNavigation />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl font-bold mb-4">Venue not found</h1>
        <p className="text-muted-foreground mb-6">The venue you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push("/search")}>Back to Search</Button>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLike}>
            <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main>
        {/* Venue Gallery */}
        <div className="relative h-64 w-full">
          <ImageWithFallback
            src={(venue.images ?? [])[activeTab] || (venue.images ?? [])[0] || "/placeholder.svg?height=400&width=400"}
            alt={venue.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-4 right-4">
            <div className="flex gap-1">
              {(venue.images ?? []).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${activeTab === index ? "bg-white" : "bg-white/50"}`}
                  onClick={() => setActiveTab(index)}
                />
              ))}
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-black">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {venue.rating} ({venue.review_count} reviews)
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
            onClick={() => setActiveTab((prev) => (prev === 0 ? (venue.images ?? []).length - 1 : prev - 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
            onClick={() => setActiveTab((prev) => (prev === (venue.images ?? []).length - 1 ? 0 : prev + 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Venue Info */}
        <div className="container p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{venue.name}</h1>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {venue.location}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Amenities</h2>
            <div className="grid grid-cols-2 gap-2">
              {(venue.amenities ?? []).map((amenity, index) => {
                let Icon = Parking
                if (amenity === "Showers") Icon = Shower
                if (amenity === "Café") Icon = Coffee
                if (amenity === "WiFi") Icon = Wifi

                return (
                  <div
                    key={index}
                    className="flex items-center p-2 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description" className="border-b-0">
              <AccordionTrigger className="text-lg font-semibold py-0 hover:no-underline">About</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{venue.description}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Available Facilities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Available Facilities</h2>
              <Button variant="ghost" size="sm" className="text-primary flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Tabs defaultValue={(venue.sports ?? [])[0]}>
              <TabsList className="mb-4 overflow-x-auto">
                {(venue.sports ?? []).map((sport) => (
                  <TabsTrigger key={sport} value={sport} className="gap-1.5">
                    <SportEmoji sport={sport} />
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {(venue.sports ?? []).map((sport) => (
                <TabsContent key={sport} value={sport} className="space-y-4">
                  {(venue.facilities ?? [])
                    .filter((facility) => facility.type === sport)
                    .map((facility) => (
                      <Card
                        key={facility.id}
                        className={`transition-all hover:shadow-md ${selectedFacility === facility.id ? "border-primary" : ""}`}
                        onClick={() => setSelectedFacility(facility.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={facility.image || "/placeholder.svg"}
                                alt={facility.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{facility.name}</h3>
                                <Badge
                                  variant="outline"
                                  className={
                                    facility.is_available ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                                  }
                                >
                                  {facility.is_available ? "Available" : "Booked"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{facility.description}</p>
                              <div className="flex items-center mt-2 text-sm">
                                <Users className="h-3 w-3 mr-1" />
                                <span className="mr-3">{facility.capacity} players max</span>

                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="font-semibold">
                                  EGP {facility.price} <span className="text-xs text-muted-foreground">/ hour</span>
                                </div>
                                <Button size="sm" disabled={!facility.is_available} asChild>
                                  <Link href={`/booking/${venue.id}?facility=${facility.id}`}>Book Now</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Available Time Slots */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Available Time Slots</h2>
            <div className="space-y-4">
              <div className="flex overflow-x-auto pb-2 gap-2">
                {["Today", "Tomorrow", "Wed, 25 Apr", "Thu, 26 Apr", "Fri, 27 Apr"].map((day, index) => (
                  <Button
                    key={index}
                    variant={selectedDate === day ? "default" : "outline"}
                    className="whitespace-nowrap"
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"].map((time, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={index === 4 ? "bg-primary/10 border-primary text-primary" : ""}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary flex items-center"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? "Show Less" : `View All (${venue.review_count})`}
                {showAllReviews ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </div>

            <div className="space-y-4">
              {((showAllReviews ? venue.reviews : venue.reviews?.slice(0, 2)) ?? []).map((review) => (
                <div key={review.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        {review.profiles?.avatar_url ? (
                          <AvatarImage src={review.profiles.avatar_url} alt={review.profiles.full_name} />
                        ) : (
                          <AvatarFallback>{review.profiles?.full_name?.charAt(0) ?? "U"}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.profiles?.full_name ?? "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Location</h2>
            <MapView markers={venueToMapMarkers([venue])} height="200px" className="mb-2" />
            <p className="text-sm text-muted-foreground">123 Sports Street, {venue.location}</p>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>

          {/* Book Now Button */}
          <div className="pt-4">
            <Button className="w-full" size="lg" asChild>
              <Link href={`/booking/${venue.id}${selectedFacility ? `?facility=${selectedFacility}` : ""}`}>
                Book Now
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
