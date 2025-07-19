"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: any
  onProfileUpdated: () => void
}

export function EditProfileDialog({ open, onOpenChange, profile, onProfileUpdated }: EditProfileDialogProps) {
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

      const fullName = formData.get("fullName") as string

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
        })
        .eq("id", user.id)

      if (profileError) {
        throw profileError
      }

      // Update role-specific data
      if (profile.role === "organizer") {
        const university = formData.get("university") as string
        const position = formData.get("position") as string
        const phone = formData.get("phone") as string

        const { error: orgError } = await supabase
          .from("organizers")
          .update({
            university,
            position,
            phone,
          })
          .eq("id", user.id)

        if (orgError) {
          throw orgError
        }
      } else if (profile.role === "sponsor") {
        const companyName = formData.get("companyName") as string
        const industry = formData.get("industry") as string
        const description = formData.get("description") as string
        const website = formData.get("website") as string

        const { error: sponsorError } = await supabase
          .from("sponsors")
          .update({
            company_name: companyName,
            industry,
            description,
            website,
          })
          .eq("id", user.id)

        if (sponsorError) {
          throw sponsorError
        }
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
      })

      onProfileUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={profile?.full_name} required />
          </div>

          {profile?.role === "organizer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input id="university" name="university" placeholder="Your university" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" placeholder="e.g., Event Coordinator" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="+1 (555) 123-4567" />
              </div>
            </>
          )}

          {profile?.role === "sponsor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="companyName" placeholder="Your company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select name="industry">
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" placeholder="https://yourcompany.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of your company"
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
