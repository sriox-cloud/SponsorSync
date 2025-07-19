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

interface EditEventDialogProps {
  event: any
  onOpenChange: (open: boolean) => void
  onEventUpdated: () => void
}

const sponsorshipTypes = [
  { id: "monetary", label: "Monetary Support" },
  { id: "product", label: "Product Sponsorship" },
  { id: "swag", label: "Swag & Merchandise" },
  { id: "media", label: "Media Coverage" },
  { id: "venue", label: "Venue Support" },
]

export function EditEventDialog({ event, onOpenChange, onEventUpdated }: EditEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date(event.event_date))
  const [selectedSponsorshipNeeds, setSelectedSponsorshipNeeds] = useState<string[]>(event.sponsorship_needs || [])

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
      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const category = formData.get("category") as string
      const location = formData.get("location") as string
      const expectedAudience = Number.parseInt(formData.get("expectedAudience") as string)
      const isOnline = formData.get("isOnline") === "on"
      const status = formData.get("status") as string

      const { error } = await supabase
        .from("events")
        .update({
          title,
          description,
          category,
          event_date: date.toISOString().split("T")[0],
          location: isOnline ? "Online" : location,
          is_online: isOnline,
          expected_audience: expectedAudience || 0,
          sponsorship_needs: selectedSponsorshipNeeds,
          status,
        })
        .eq("id", event.id)

      if (error) {
        throw error
      }

      toast({
        title: "Event Updated!",
        description: "Your event has been updated successfully.",
      })

      onEventUpdated()
    } catch (error: any) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update your event details</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" name="title" defaultValue={event.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" defaultValue={event.category} required>
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
            <Textarea id="description" name="description" defaultValue={event.description} rows={3} />
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
              <Input
                id="expectedAudience"
                name="expectedAudience"
                type="number"
                defaultValue={event.expected_audience}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="isOnline" name="isOnline" defaultChecked={event.is_online} />
              <Label htmlFor="isOnline">This is an online event</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={event.location} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={event.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
