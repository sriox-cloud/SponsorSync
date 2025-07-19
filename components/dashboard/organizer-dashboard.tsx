"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Users, TrendingUp, MessageSquare, Edit, Eye, CheckCircle, XCircle } from "lucide-react"
import { MatchScore } from "./match-score"
import { CreateEventDialog } from "./create-event-dialog"
import { EditEventDialog } from "./edit-event-dialog"
import { ViewEventDialog } from "./view-event-dialog"
import { UserMenu } from "./user-menu"
import { DashboardCharts } from "./dashboard-charts"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  category: string
  event_date: string
  location: string
  expected_audience: number
  status: string
  sponsorship_needs: string[]
  is_online: boolean
}

interface Match {
  id: string
  match_score: number
  sponsors: {
    company_name: string
    industry: string
  }
  events: {
    title: string
  }
}

interface Application {
  id: string
  status: string
  proposal_message: string
  response_message: string
  created_at: string
  sponsors: {
    company_name: string
    industry: string
  }
  events: {
    title: string
  }
}

export function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user's events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false })

      // Fetch matches for user's events
      const { data: matchesData } = await supabase
        .from("matches")
        .select(`
          *,
          sponsors:sponsors(company_name, industry),
          events:events(title)
        `)
        .in("event_id", eventsData?.map((e) => e.id) || [])
        .order("match_score", { ascending: false })

      // Fetch applications for user's events
      const { data: applicationsData } = await supabase
        .from("applications")
        .select(`
          *,
          sponsors:sponsors(company_name, industry),
          events:events(title)
        `)
        .in("event_id", eventsData?.map((e) => e.id) || [])
        .order("created_at", { ascending: false })

      setEvents(eventsData || [])
      setMatches(matchesData || [])
      setApplications(applicationsData || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventCreated = () => {
    setShowCreateEvent(false)
    fetchDashboardData()
  }

  const handleEventUpdated = () => {
    setEditingEvent(null)
    fetchDashboardData()
  }

  const handleApplicationResponse = async (
    applicationId: string,
    status: "accepted" | "declined",
    responseMessage?: string,
  ) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({
          status,
          response_message: responseMessage || null,
        })
        .eq("id", applicationId)

      if (error) throw error

      toast({
        title: `Application ${status}`,
        description: `The sponsorship application has been ${status}.`,
      })

      fetchDashboardData()
    } catch (error: any) {
      console.error("Error updating application:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and connect with sponsors</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateEvent(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <UserMenu />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter((e) => e.status === "published").length} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
            <p className="text-xs text-muted-foreground">
              {matches.filter((m) => m.match_score >= 70).length} high quality
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {applications.filter((a) => a.status === "pending").length} pending review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, event) => sum + (event.expected_audience || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Expected attendees</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts events={events} matches={matches} />

      {/* Main Content */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="matches">Sponsor Matches</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">Create your first event to start connecting with sponsors</p>
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="mt-1">{event.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          <span>{event.location}</span>
                          <span>{event.expected_audience} expected attendees</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {event.category}
                        </Badge>
                        <Badge variant={event.status === "published" ? "default" : "secondary"}>{event.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {event.sponsorship_needs?.map((need) => (
                          <Badge key={need} variant="outline" className="text-xs">
                            {need}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewingEvent(event)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingEvent(event)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                <p className="text-muted-foreground">Create and publish events to get sponsor matches</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{match.sponsors.company_name}</CardTitle>
                        <CardDescription>
                          {match.sponsors.industry} • Interested in "{match.events.title}"
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <MatchScore score={match.match_score} />
                      <div className="flex gap-2">
                        <Button size="sm">Send Message</Button>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground">Publish events to start receiving sponsorship applications!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{application.sponsors.company_name}</CardTitle>
                        <CardDescription>
                          {application.sponsors.industry} • Applied for "{application.events.title}"
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          application.status === "accepted"
                            ? "default"
                            : application.status === "declined"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Sponsorship Proposal:</p>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          {application.proposal_message}
                        </p>
                      </div>

                      {application.response_message && (
                        <div>
                          <p className="text-sm font-medium mb-2">Your Response:</p>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                            {application.response_message}
                          </p>
                        </div>
                      )}

                      {application.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApplicationResponse(
                                application.id,
                                "accepted",
                                "Thank you for your interest! We'd love to discuss this sponsorship opportunity further.",
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleApplicationResponse(
                                application.id,
                                "declined",
                                "Thank you for your interest. Unfortunately, this doesn't align with our current needs.",
                              )
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateEventDialog open={showCreateEvent} onOpenChange={setShowCreateEvent} onEventCreated={handleEventCreated} />
      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          onOpenChange={() => setEditingEvent(null)}
          onEventUpdated={handleEventUpdated}
        />
      )}
      {viewingEvent && <ViewEventDialog event={viewingEvent} onOpenChange={() => setViewingEvent(null)} />}
    </div>
  )
}
