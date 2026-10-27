"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, ChevronRight, Plus, Send, Settings, DollarSign, Clock, MapPin } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getTeams, getBookings } from "@/lib/mock-data"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("chat")
  const [message, setMessage] = useState("")
  const teams = getTeams()
  const team = teams.find((t) => t.id === params.id)
  const bookings = getBookings().slice(0, 2)

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Ahmed M.",
      message: "Hey everyone! Are we still on for tomorrow's game?",
      time: "10:30 AM",
      isCurrentUser: false,
    },
    { id: 2, sender: "Mohamed S.", message: "Yes, I'll be there!", time: "10:35 AM", isCurrentUser: false },
    {
      id: 3,
      sender: "Omar T.",
      message: "Me too. Should we bring extra equipment?",
      time: "10:40 AM",
      isCurrentUser: false,
    },
    {
      id: 4,
      sender: "Ahmed M.",
      message: "That would be great. I'll bring some extra balls.",
      time: "10:45 AM",
      isCurrentUser: false,
    },
    { id: 5, sender: "You", message: "I'll bring the bibs!", time: "10:50 AM", isCurrentUser: true },
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          sender: "You",
          message: message.trim(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCurrentUser: true,
        },
      ])
      setMessage("")

      // Simulate response after a delay
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "Ahmed M.",
            message: "Sounds good! See you all tomorrow.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isCurrentUser: false,
          },
        ])
      }, 2000)
    }
  }

  const handleSplitPayment = () => {
    toast({
      title: "Payment Split Request Sent",
      description: "Your teammates have been notified about the payment split request.",
      action: <ToastAction altText="View">View</ToastAction>,
    })
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl font-bold mb-4">Team not found</h1>
        <p className="text-muted-foreground mb-6">The team you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push("/teams")}>Back to Teams</Button>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-10 bg-background p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 mr-3">
              <Image src={team.image || "/placeholder.svg"} alt={team.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{team.name}</h1>
              <p className="text-xs text-muted-foreground">{team.memberCount} members</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container p-4">
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <div className="border rounded-lg h-[calc(100vh-280px)] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.isCurrentUser
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      }`}
                    >
                      {!msg.isCurrentUser && <div className="font-medium text-xs mb-1">{msg.sender}</div>}
                      <p className="text-sm">{msg.message}</p>
                      <div
                        className={`text-xs mt-1 ${msg.isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t flex items-center">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="ml-2"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Games</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {team.nextGame ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Next Game</h3>
                      <Badge variant="outline" className="text-green-600 bg-green-50">
                        Confirmed
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{team.nextGame.date}</span>
                    </div>
                    <div className="flex items-center text-sm mb-1">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{team.nextGame.time}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Cairo Sports Club, Nasr City</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 4).map((member) => (
                          <div
                            key={member.id}
                            className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs"
                          >
                            {member.initial}
                          </div>
                        ))}
                        {team.members.length > 4 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSplitPayment}>
                          <DollarSign className="h-3 w-3 mr-1" />
                          Split Payment
                        </Button>
                        <Button size="sm">Details</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 border rounded-lg">
                    <p className="text-muted-foreground mb-4">No upcoming games scheduled</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Schedule Game
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Past Games</h3>
                  <Button variant="ghost" size="sm" className="text-primary flex items-center">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {bookings
                  .filter((b) => b.status === "past")
                  .map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={booking.image || "/placeholder.svg"}
                            alt={booking.facilityName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{booking.venueName}</h3>
                            <Badge variant="outline" className="text-gray-600 bg-gray-100">
                              Completed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.facilityName}</p>
                          <div className="flex items-center mt-1 text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="mr-3">{booking.date}</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Cairo Sports Club</h3>
                    <Badge variant="outline" className="text-green-600 bg-green-50">
                      Paid
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Football Pitch #1</p>
                  <div className="flex items-center text-sm mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>April 16, 2025</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm">
                      <span className="font-medium">Total:</span> EGP 250
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Your share:</span> EGP 31.25
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Elite Sports Center</h3>
                    <Badge variant="outline" className="text-amber-600 bg-amber-50">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Football Pitch #2</p>
                  <div className="flex items-center text-sm mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>April 10, 2025</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm">
                      <span className="font-medium">Total:</span> EGP 300
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Your share:</span> EGP 37.50
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Team Members</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{member.initial}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.role === "captain" ? "Team Captain" : "Team Member"}
                        </div>
                      </div>
                    </div>
                    <Badge variant={member.role === "captain" ? "default" : "outline"}>
                      {member.role === "captain" ? "Captain" : "Member"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Team Information</h3>
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <span>Team Name</span>
                    <div className="flex items-center text-muted-foreground">
                      <span>{team.name}</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <span>Sport</span>
                    <div className="flex items-center text-muted-foreground">
                      <span>{team.sport.charAt(0).toUpperCase() + team.sport.slice(1)}</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Permissions</h3>
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <span>Member Permissions</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <span>Payment Settings</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                <Separator />

                <Button variant="destructive" className="w-full">
                  {team.isOwner ? "Delete Team" : "Leave Team"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
