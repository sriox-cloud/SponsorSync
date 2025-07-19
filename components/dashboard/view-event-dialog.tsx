"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, Users, Globe, Building } from "lucide-react"

interface ViewEventDialogProps {
  event: any
  onOpenChange: (open: boolean) => void
}

export function ViewEventDialog({ event, onOpenChange }: ViewEventDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {event.category}
              </Badge>
              <Badge variant={event.status === "published" ? "default" : "secondary"}>{event.status}</Badge>
            </div>
          </div>
          <DialogDescription className="text-base">{event.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Event Date</p>
                <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Expected Audience</p>
                <p className="text-sm text-muted-foreground">{event.expected_audience?.toLocaleString()} attendees</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {event.is_online ? (
                <Globe className="h-5 w-5 text-muted-foreground" />
              ) : (
                <MapPin className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {event.is_online ? "Online Event" : event.location || "TBD"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Event Type</p>
                <p className="text-sm text-muted-foreground capitalize">{event.category}</p>
              </div>
            </div>
          </div>

          {/* Sponsorship Needs */}
          {event.sponsorship_needs && event.sponsorship_needs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Sponsorship Needs</h3>
              <div className="flex flex-wrap gap-2">
                {event.sponsorship_needs.map((need: string) => (
                  <Badge key={need} variant="secondary" className="capitalize">
                    {need.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Event Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{new Date(event.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2">{new Date(event.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
