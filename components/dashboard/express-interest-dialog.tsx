"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface ExpressInterestDialogProps {
  event: any
  onOpenChange: (open: boolean) => void
  onInterestSubmitted: () => void
}

export function ExpressInterestDialog({ event, onOpenChange, onInterestSubmitted }: ExpressInterestDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No authenticated user")
      }

      const proposalMessage = formData.get("proposalMessage") as string

      if (!proposalMessage.trim()) {
        throw new Error("Please provide a message explaining your interest")
      }

      // Create application
      const { error } = await supabase.from("applications").insert({
        event_id: event.id,
        sponsor_id: user.id,
        status: "pending",
        proposal_message: proposalMessage.trim(),
      })

      if (error) {
        throw error
      }

      toast({
        title: "Interest Expressed!",
        description: "Your application has been sent to the event organizer.",
      })

      onInterestSubmitted()
    } catch (error: any) {
      console.error("Error expressing interest:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to express interest",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Express Interest in Event</DialogTitle>
          <DialogDescription>Send a sponsorship proposal to the event organizer</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <Badge variant="outline" className="capitalize">
                {event.category}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

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

            {event.sponsorship_needs && event.sponsorship_needs.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Sponsorship Needs:</p>
                <div className="flex flex-wrap gap-1">
                  {event.sponsorship_needs.map((need: string) => (
                    <Badge key={need} variant="secondary" className="text-xs">
                      {need}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Proposal Form */}
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposalMessage">Your Sponsorship Proposal *</Label>
              <Textarea
                id="proposalMessage"
                name="proposalMessage"
                placeholder="Explain why you're interested in sponsoring this event, what you can offer, and how it aligns with your company's goals..."
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what type of sponsorship you can provide and what you hope to achieve.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Proposal"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
