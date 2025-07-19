"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookmarkIcon, TrendingUp, Users, Calendar, MapPin, Heart, MessageSquare } from "lucide-react"
import { MatchScore } from "./match-score"
import { UserMenu } from "./user-menu"
import { DashboardCharts } from "./dashboard-charts"
import { ViewEventDialog } from "./view-event-dialog"
import { ExpressInterestDialog } from "./express-interest-dialog"
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
  sponsorship_needs: string[]
  organizers: {
    university: string
  }
}

interface Match {
  id: string
  match_score: number
  events: Event & {
    organizers: {
      university: string
    }
  }
}

interface Application {
  id: string
  status: string
  proposal_message: string
  response_message: string
  created_at: string
  events: {
    title: string
    event_date: string
    organizers: {
      university: string
    }
  }
}

interface SponsorBookmark {
  id: string
  event_id: string
  events: Event
}

export function SponsorDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [bookmarks, setBookmarks] = useState<SponsorBookmark[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [expressInterestEvent, setExpressInterestEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all events with organizer info
      const { data: eventsData } = await supabase
        .from("events")
        .select(`
          *,
          organizers:organizers(university)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false })

      // Fetch matches for this sponsor
      const { data: matchesData } = await supabase
        .from("matches")
        .select(`
          *,
          events:events(
            *,
            organizers:organizers(university)
          )
        `)
        .eq("sponsor_id", user.id)
        .order("match_score", { ascending: false })

      // Fetch applications
      const { data: applicationsData } = await supabase
        .from("applications")
        .select(`
          *,
          events:events(
            title,
            event_date,
            organizers:organizers(university)
          )
        `)
        .eq("sponsor_id", user.id)
        .order("created_at", { ascending: false })

      // Fetch bookmarks
      const { data: bookmarksData } = await supabase
        .from("bookmarks")
        .select(`
          *,
          events:events(
            *,
            organizers:organizers(university)
          )
        `)
        .eq("sponsor_id", user.id)
        .order("created_at", { ascending: false })

      setEvents(eventsData || [])
      setMatches(matchesData || [])
      setApplications(applicationsData || [])
      setBookmarks(bookmarksData || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizers?.university?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleBookmark = async (eventId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Check if already bookmarked
      const existingBookmark = bookmarks.find((b) => b.event_id === eventId)

      if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase.from("bookmarks").delete().eq("id", existingBookmark.id)

        if (error) throw error

        setBookmarks(bookmarks.filter((b) => b.id !== existingBookmark.id))
        toast({
          title: "Bookmark Removed",
          description: "Event removed from your bookmarks.",
        })
      } else {
        // Add bookmark
        const { data, error } = await supabase
          .from("bookmarks")
          .insert({
            sponsor_id: user.id,
            event_id: eventId,
          })
          .select(`
            *,
            events:events(
              *,
              organizers:organizers(university)
            )
          `)
          .single()

        if (error) throw error

        setBookmarks([...bookmarks, data])
        toast({
          title: "Event Bookmarked",
          description: "Event added to your bookmarks.",
        })
      }
    } catch (error: any) {
      console.error("Error handling bookmark:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark",
        variant: "destructive",
      })
    }
  }

  const handleExpressInterest = (event: Event) => {
    setExpressInterestEvent(event)
  }

  const handleInterestSubmitted = () => {
    setExpressInterestEvent(null)
    fetchDashboardData() // Refresh to show new application
  }

  const isBookmarked = (eventId: string) => {
    return bookmarks.some((b) => b.event_id === eventId)
  }

  const hasApplied = (eventId: string) => {
    return applications.some(
      (a) => a.events && applications.some((app) => app.events?.title === events.find((e) => e.id === eventId)?.title),
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
          <p className="text-muted-foreground">Discover and connect with student events</p>
        </div>
        <UserMenu />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter((e) => e.category === "tech").length} tech events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
            <p className="text-xs text-muted-foreground">
              {matches.filter((m) => m.match_score >= 80).length} excellent matches
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
              {applications.filter((a) => a.status === "pending").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookmarks.length}</div>
            <p className="text-xs text-muted-foreground">Saved events</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts events={events} matches={matches} />

      {/* Main Content */}
      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discover">Discover Events</TabsTrigger>
          <TabsTrigger value="matches">Smart Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="applications">My Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks ({bookmarks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {event.category}
                          </Badge>
                          {hasApplied(event.id) && <Badge variant="secondary">Applied</Badge>}
                        </div>
                        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.event_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.expected_audience?.toLocaleString()} attendees
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {event.sponsorship_needs?.slice(0, 3).map((need) => (
                            <Badge key={need} variant="secondary" className="text-xs">
                              {need}
                            </Badge>
                          ))}
                          {event.sponsorship_needs?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{event.sponsorship_needs.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{event.organizers?.university}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleBookmark(event.id)}>
                            {isBookmarked(event.id) ? (
                              <BookmarkIcon className="h-4 w-4" />
                            ) : (
                              <BookmarkIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleExpressInterest(event)}
                            disabled={hasApplied(event.id)}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {hasApplied(event.id) ? "Applied" : "Express Interest"}
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setViewingEvent(event)}>
                          View Details
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
                <p className="text-muted-foreground">Complete your profile to get better matches</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{match.events.title}</CardTitle>
                        <CardDescription>
                          {new Date(match.events.event_date).toLocaleDateString()} •{" "}
                          {match.events.expected_audience?.toLocaleString()} attendees •{" "}
                          {match.events.organizers?.university}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {match.events.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <MatchScore score={match.match_score} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleExpressInterest(match.events)}>
                          Express Interest
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setViewingEvent(match.events)}>
                          View Details
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
                <p className="text-muted-foreground">Start expressing interest in events!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{application.events?.title}</CardTitle>
                        <CardDescription>
                          {application.events?.event_date &&
                            new Date(application.events.event_date).toLocaleDateString()}{" "}
                          • {application.events?.organizers?.university}
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
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Your Message:</p>
                        <p className="text-sm text-muted-foreground">{application.proposal_message}</p>
                      </div>
                      {application.response_message && (
                        <div>
                          <p className="text-sm font-medium">Organizer Response:</p>
                          <p className="text-sm text-muted-foreground">{application.response_message}</p>
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

        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookmarkIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground">Bookmark events you're interested in!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{bookmark.events.title}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {bookmark.events.category}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{bookmark.events.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(bookmark.events.event_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {bookmark.events.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {bookmark.events.expected_audience?.toLocaleString()} attendees
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{bookmark.events.organizers?.university}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleBookmark(bookmark.event_id)}>
                          <BookmarkIcon className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleExpressInterest(bookmark.events)}>
                          Express Interest
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setViewingEvent(bookmark.events)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {viewingEvent && <ViewEventDialog event={viewingEvent} onOpenChange={() => setViewingEvent(null)} />}
      {expressInterestEvent && (
        <ExpressInterestDialog
          event={expressInterestEvent}
          onOpenChange={() => setExpressInterestEvent(null)}
          onInterestSubmitted={handleInterestSubmitted}
        />
      )}
    </div>
  )
}
