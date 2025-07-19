"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventCreated: () => void
}

const sponsorshipTypes = [
  { id: "monetary", label: "Monetary Support" },
  { id: "product", label: "Product Sponsorship" },
  { id: "swag", label: "Swag & Merchandise" },
  { id: "media", label: "Media Coverage" },
  { id: "venue", label: "Venue Support" },
]

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [selectedSponsorshipNeeds, setSelectedSponsorshipNeeds] = useState<string[]>([])

  const handleSponsorshipNeedChange = (needId: string, checked: boolean) => {
    if (checked) {
      setSelectedSponsorshipNeeds([...selectedSponsorshipNeeds, needId])
    } else {
      setSelectedSponsorshipNeeds(selectedSponsorshipNeeds.filter((id) => id !== needId))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No authenticated user")
      }

      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const category = formData.get("category") as string
      const location = formData.get("location") as string
      const expectedAudience = Number.parseInt(formData.get("expectedAudience") as string)
      const isOnline = formData.get("isOnline") === "on"

      if (!title || !category || !date) {
        throw new Error("Please fill in all required fields")
      }

      const { data: eventData, error } = await supabase
        .from("events")
        .insert({
          organizer_id: user.id,
          title,
          description,
          category,
          event_date: date.toISOString().split("T")[0],
          location: isOnline ? "Online" : location,
          is_online: isOnline,
          expected_audience: expectedAudience || 0,
          sponsorship_needs: selectedSponsorshipNeeds,
          status: "published",
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Event Created!",
        description: "Your event has been created and published successfully.",
      })

      onEventCreated()

      // Reset form
      setDate(undefined)
      setSelectedSponsorshipNeeds([])
    } catch (error: any) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Create a new event to connect with potential sponsors</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" name="title" placeholder="Tech Innovation Summit 2024" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="culture">Culture</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your event, its goals, and what makes it special..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedAudience">Expected Audience</Label>
              <Input id="expectedAudience" name="expectedAudience" type="number" placeholder="500" min="1" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="isOnline" name="isOnline" />
              <Label htmlFor="isOnline">This is an online event</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="University Campus, City" />
          </div>

          <div className="space-y-3">
            <Label>Sponsorship Needs</Label>
            <div className="grid grid-cols-2 gap-3">
              {sponsorshipTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={selectedSponsorshipNeeds.includes(type.id)}
                    onCheckedChange={(checked) => handleSponsorshipNeedChange(type.id, checked as boolean)}
                  />
                  <Label htmlFor={type.id} className="text-sm">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
