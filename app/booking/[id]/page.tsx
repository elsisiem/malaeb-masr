"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Plus,
  Share,
  Users,
  Minus,
  Shirt,
  Wallet,
  Banknote,
  Check,
  AlertCircle,
} from "lucide-react"
import { SportEmoji } from "@/components/sport-icon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageWithFallback } from "@/components/image-with-fallback"

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

interface ApiVenue {
  id: string
  name: string
  location: string
  price_per_hour: number
  sports: string[]
  images: string[]
  facilities: ApiFacility[]
}

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const facilityId = searchParams.get("facility")
  const [venue, setVenue] = useState<ApiVenue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState("Today")
  const [selectedTime, setSelectedTime] = useState("5:00 PM")
  const [duration, setDuration] = useState(1)
  const [playerCount, setPlayerCount] = useState(10)
  const [selectedFacility, setSelectedFacility] = useState<ApiFacility | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [equipment, setEquipment] = useState({ football: false, bibs: false })
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [savePayment, setSavePayment] = useState(false)
  const [invitedPlayers, setInvitedPlayers] = useState<string[]>([])

  const hasFacilities = (venue?.facilities?.length ?? 0) > 0

  const selectedFacilityData =
    selectedFacility ?? venue?.facilities?.find((facility) => facility.id === facilityId) ?? venue?.facilities?.[0] ?? null

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/venues/${params.id}`)
      .then((r) => r.json())
      .then(({ data }) => { if (data) setVenue(data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [params.id])

  useEffect(() => {
    if (venue && facilityId) {
      const facility = (venue.facilities ?? []).find((f) => f.id === facilityId)
      if (facility) {
        setSelectedFacility(facility)
        setPlayerCount(Math.min(facility.capacity, playerCount))
      }
    } else if (venue && (venue.facilities ?? []).length > 0) {
      setSelectedFacility(venue.facilities[0])
      setPlayerCount(Math.min(venue.facilities[0].capacity, playerCount))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue, facilityId])

  if (isLoading) {
    return (
      <div className="pb-20">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Book Facility</h1>
          <Button variant="ghost" size="icon">
            <Share className="h-5 w-5" />
          </Button>
        </header>

        <main className="container p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-1 w-8 ml-1" />
              <Skeleton className="h-8 w-8 rounded-full ml-1" />
              <Skeleton className="h-1 w-8 ml-1" />
              <Skeleton className="h-8 w-8 rounded-full ml-1" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>

          <Skeleton className="h-24 w-full rounded-lg" />

          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
        <p className="text-muted-foreground mb-6">The venue you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/search")}>Back to Search</Button>
      </div>
    )
  }

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
      window.scrollTo(0, 0)
    } else if (step === 2) {
      setStep(3)
      window.scrollTo(0, 0)
    } else if (step === 3) {
      if (!termsAccepted) {
        toast({
          title: "Terms and conditions required",
          description: "Please accept the terms and conditions to proceed.",
          variant: "destructive",
        })
        return
      }
      if (!selectedFacilityData) {
        toast({
          title: "Facility not available",
          description: "This venue currently has no bookable facilities.",
          variant: "destructive",
        })
        return
      }

      setIsConfirming(true)
      try {
        // Resolve a real calendar date from the selection label
        const today = new Date()
        const bookingDate =
          selectedDate === "Today"
            ? today
            : selectedDate === "Tomorrow"
              ? new Date(today.setDate(today.getDate() + 1))
              : new Date(selectedDate)
        const dateStr = bookingDate.toISOString().split("T")[0]

        // Calculate end time (start + duration)
        const [timePart, period] = selectedTime.split(" ")
        let [h, m] = timePart.split(":").map(Number)
        if (period === "PM" && h !== 12) h += 12
        if (period === "AM" && h === 12) h = 0
        const startTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`

        const total = calculateTotal()

        // 1. Create booking
        const bookingRes = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId: venue!.id,
            facilityId: selectedFacilityData.id,
            date: dateStr,
            startTime,
            duration,
            playerCount,
            equipmentSelected: equipment,
            notes: invitedPlayers.length > 0 ? `Invited players: ${invitedPlayers.join(", ")}` : undefined,
            paymentMethod,
          }),
        })
        const bookingJson = await bookingRes.json()
        if (!bookingRes.ok) {
          toast({ title: "Booking failed", description: bookingJson.error, variant: "destructive" })
          return
        }

        const bookingId = bookingJson.data?.id
        if (!bookingId) {
          toast({
            title: "Booking failed",
            description: "The booking could not be created. Please try again.",
            variant: "destructive",
          })
          return
        }

        // 2. Initiate payment
        const payRes = await fetch("/api/payments/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })
        const payJson = await payRes.json()

        toast({
          title: "Booking Confirmed!",
          description: `Your booking at ${venue!.name} has been confirmed for ${selectedDate}, ${selectedTime}.`,
        })

        // Redirect to bookings; if Stripe client_secret is returned, handle it here later
        if (payJson.data?.clientSecret) {
          // Payment initiated — in production, redirect to payment page or use Stripe Elements
          router.push("/bookings")
        } else {
          router.push("/bookings")
        }
      } catch (err) {
        console.error(err)
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
      } finally {
        setIsConfirming(false)
      }
    }
  }

  const calculateTotal = () => {
    if (!selectedFacilityData) return 0

    let total = selectedFacilityData.price * duration

    // Add equipment costs
    if (equipment.football) total += 50
    if (equipment.bibs) total += 30

    // Add service fee
    total += 25

    return total
  }

  const handleInvitePlayer = (player: string) => {
    if (!invitedPlayers.includes(player)) {
      setInvitedPlayers([...invitedPlayers, player])
      toast({
        title: "Player invited",
        description: `${player} has been invited to join this booking.`,
      })
    }
  }

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Book Facility</h1>
        <Button variant="ghost" size="icon">
          <Share className="h-5 w-5" />
        </Button>
      </header>

      <main className="container p-4 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : 1}
            </div>
            <div className={`h-1 w-8 ${step > 1 ? "bg-primary" : "bg-muted"}`}></div>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {step > 2 ? <Check className="h-4 w-4" /> : 2}
            </div>
            <div className={`h-1 w-8 ${step > 2 ? "bg-primary" : "bg-muted"}`}></div>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              3
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {step} of 3: {step === 1 ? "Date & Time" : step === 2 ? "Player Details" : "Payment"}
          </div>
        </div>

        {/* Venue Info */}
        {selectedFacilityData ? (
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={selectedFacilityData.image || "/placeholder.svg?height=200&width=200"}
                    alt={selectedFacilityData.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{venue.name}</h3>
                    <Badge variant="outline" className="text-green-600 bg-green-50">
                      Available
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedFacilityData.name}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{venue.location}</span>
                  </div>
                  <div className="font-semibold mt-1">
                    EGP {selectedFacilityData.price} <span className="text-xs text-muted-foreground">/ hour</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-4 text-sm text-muted-foreground">
              This venue has no bookable facilities yet. Please choose another venue or ask the owner to add facilities.
            </CardContent>
          </Card>
        )}

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Date & Time</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Date</h3>
                <div className="flex overflow-x-auto pb-2 gap-2">
                  {["Today", "Tomorrow", "Wed, 25 Apr", "Thu, 26 Apr", "Fri, 27 Apr"].map((day, index) => (
                    <Button
                      key={index}
                      variant={day === selectedDate ? "default" : "outline"}
                      className="whitespace-nowrap"
                      onClick={() => setSelectedDate(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["9:00 AM", "10:00 AM", "11:00 AM", "5:00 PM", "6:00 PM", "7:00 PM"].map((time) => (
                    <Button
                      key={time}
                      variant={time === selectedTime ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Duration</h3>
                <Tabs defaultValue={duration.toString()} onValueChange={(value) => setDuration(Number.parseInt(value))}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="1">1 hour</TabsTrigger>
                    <TabsTrigger value="2">2 hours</TabsTrigger>
                    <TabsTrigger value="3">3 hours</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="pt-4">
                <Button className="w-full" onClick={handleNext}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Player Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Player Details</h2>

            {selectedFacilityData ? (
              <div className="space-y-4">
                <div>
                  {hasFacilities && (venue?.facilities?.length ?? 0) > 1 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Facility</h3>
                      <div className="grid gap-2">
                        {(venue?.facilities ?? []).map((facility) => {
                          const isSelected = selectedFacilityData?.id === facility.id
                          return (
                            <button
                              key={facility.id}
                              type="button"
                              onClick={() => {
                                setSelectedFacility(facility)
                                setPlayerCount((prev) => Math.min(facility.capacity, prev))
                              }}
                              className={`text-left rounded-md border px-3 py-2 transition-colors ${
                                isSelected ? "border-primary bg-primary/10" : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="text-sm font-medium">{facility.name}</div>
                              <div className="text-xs text-muted-foreground">EGP {facility.price} / hour</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <h3 className="text-sm font-medium mb-2">Number of Players</h3>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                      disabled={playerCount <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold">{playerCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPlayerCount(Math.min(selectedFacilityData.capacity, playerCount + 1))}
                      disabled={playerCount >= selectedFacilityData.capacity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    Maximum capacity: {selectedFacilityData.capacity} players
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Invite Team Members</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Invite Players {invitedPlayers.length > 0 && `(${invitedPlayers.length})`}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Players</DialogTitle>
                        <DialogDescription>
                          Select team members or invite new players to join this booking.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="search-players">Search Players</Label>
                          <Input id="search-players" placeholder="Search by name or email" />
                        </div>

                        <div className="space-y-2">
                          <Label>Team Members</Label>
                          <div className="space-y-2">
                            {["Ahmed K.", "Mohamed S.", "Omar T.", "Khaled M."].map((player, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`player-${index}`}
                                  checked={invitedPlayers.includes(player)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleInvitePlayer(player)
                                    } else {
                                      setInvitedPlayers(invitedPlayers.filter((p) => p !== player))
                                    }
                                  }}
                                />
                                <Label htmlFor={`player-${index}`} className="font-normal">
                                  {player}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-player">Invite New Player</Label>
                          <div className="flex gap-2">
                            <Input id="new-player" placeholder="Email or phone number" />
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Invite Selected</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Equipment Rental</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        <SportEmoji sport="football" className="mr-2" />
                        <span>Football</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">EGP 50</span>
                        <Checkbox
                          id="football"
                          checked={equipment.football}
                          onCheckedChange={(checked) => setEquipment({ ...equipment, football: checked as boolean })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex items-center">
                        <Shirt className="h-4 w-4 mr-2" />
                        <span>Bibs (10 pcs)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">EGP 30</span>
                        <Checkbox
                          id="bibs"
                          checked={equipment.bibs}
                          onCheckedChange={(checked) => setEquipment({ ...equipment, bibs: checked as boolean })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full" onClick={handleNext}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  This venue has no bookable facilities yet. Please choose another venue.
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payment</h2>

            {selectedFacilityData ? (
              <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                <div className="space-y-2">
                  <div
                    className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${paymentMethod === "card" ? "border-primary" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <label htmlFor="card" className="flex items-center ml-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Credit/Debit Card</div>
                        <div className="text-xs text-muted-foreground">Visa ending in 4242</div>
                      </div>
                    </label>
                  </div>

                  <div
                    className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${paymentMethod === "wallet" ? "border-primary" : ""}`}
                    onClick={() => setPaymentMethod("wallet")}
                  >
                    <input
                      type="radio"
                      id="wallet"
                      name="payment"
                      className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary"
                      checked={paymentMethod === "wallet"}
                      onChange={() => setPaymentMethod("wallet")}
                    />
                    <label htmlFor="wallet" className="flex items-center ml-2 cursor-pointer flex-1">
                      <Wallet className="h-4 w-4 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Mobile Wallet</div>
                        <div className="text-xs text-muted-foreground">Pay with your mobile wallet</div>
                      </div>
                    </label>
                  </div>

                  <div
                    className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${paymentMethod === "cash" ? "border-primary" : ""}`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <input
                      type="radio"
                      id="cash"
                      name="payment"
                      className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <label htmlFor="cash" className="flex items-center ml-2 cursor-pointer flex-1">
                      <Banknote className="h-4 w-4 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Cash on Arrival</div>
                        <div className="text-xs text-muted-foreground">Pay at the venue</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Booking Summary</h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{selectedDate}, {selectedTime} - {duration} hour{duration > 1 ? "s" : ""}</span>
                      </div>
                      <span className="font-medium">EGP {selectedFacilityData.price * duration}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{playerCount} Players</span>
                      </div>
                      <span className="font-medium">EGP 0</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Equipment Rental</span>
                      <span className="font-medium">
                        EGP {(equipment.football ? 50 : 0) + (equipment.bibs ? 30 : 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Service Fee</span>
                      <span className="font-medium">EGP 25</span>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <span>EGP {calculateTotal()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                      Terms & Conditions
                    </Link>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-payment"
                    checked={savePayment}
                    onCheckedChange={(checked) => setSavePayment(checked as boolean)}
                  />
                  <Label htmlFor="save-payment" className="text-sm font-normal">
                    Save payment method for future bookings
                  </Label>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full" onClick={handleNext} disabled={!termsAccepted || isConfirming}>
                  {isConfirming ? "Processing..." : "Confirm & Pay"}
                </Button>
                {!termsAccepted && (
                  <div className="flex items-center justify-center mt-2 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Please accept the terms and conditions to proceed
                  </div>
                )}
              </div>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  This venue has no bookable facilities yet. Please choose another venue.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
