"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [tablesExist, setTablesExist] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkDatabaseSetup()
  }, [])

  const checkDatabaseSetup = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth")
        return
      }

      setCurrentUser(user)

      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        setTablesExist(false)
        return
      }

      setTablesExist(true)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error checking profile:", profileError)
      } else if (profile?.role) {
        router.push("/dashboard")
        return
      }
    } catch (error: any) {
      console.error("Error checking database:", error)
      setTablesExist(false)
    }
  }

  const handleSetup = async (formData: FormData) => {
    if (!tablesExist || !currentUser) {
      toast({
        title: "Not Ready",
        description: "Database not ready or user not authenticated.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const role = formData.get("role") as string
      const fullName = formData.get("fullName") as string

      if (!role || !fullName.trim()) {
        throw new Error("Role and full name are required")
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: fullName.trim(),
          role: role,
        })
        .select()
        .single()

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      if (role === "organizer") {
        const university = (formData.get("university") as string) || ""
        const position = (formData.get("position") as string) || ""

        const { error: orgError } = await supabase.from("organizers").insert({
          id: currentUser.id,
          university: university.trim(),
          position: position.trim(),
          profile_completion: 60,
        })

        if (orgError) {
          throw new Error(`Organizer creation failed: ${orgError.message}`)
        }
      } else if (role === "sponsor") {
        const companyName = (formData.get("companyName") as string) || "Unknown Company"
        const industry = (formData.get("industry") as string) || "other"
        const description = (formData.get("description") as string) || ""

        const { error: sponsorError } = await supabase.from("sponsors").insert({
          id: currentUser.id,
          company_name: companyName.trim(),
          industry: industry,
          description: description.trim(),
          profile_completion: 60,
        })

        if (sponsorError) {
          throw new Error(`Sponsor creation failed: ${sponsorError.message}`)
        }
      }

      toast({
        title: "Profile Created!",
        description: "Welcome to SponsorSync! Redirecting to dashboard...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("Setup error:", error)
      const errorMessage = error?.message || "Unknown error occurred"

      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-600">Complete Your Profile</CardTitle>
          <CardDescription>Let's set up your SponsorSync account</CardDescription>
        </CardHeader>
        <CardContent>
          {!tablesExist && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Database Setup Required</h3>
              <p className="text-yellow-700 mb-3">
                The database tables haven't been created yet. Please run the SQL scripts in your Supabase dashboard.
              </p>
              <Button onClick={checkDatabaseSetup} className="mt-3 w-full bg-transparent" variant="outline">
                Check Database Setup
              </Button>
            </div>
          )}

          {tablesExist && currentUser && (
            <form action={handleSetup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" name="fullName" placeholder="Your full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a... *</Label>
                <Select name="role" onValueChange={setUserRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizer">Student Organizer</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {userRole === "organizer" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input id="university" name="university" placeholder="Your university" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" name="position" placeholder="e.g., Event Coordinator, Student Leader" />
                  </div>
                </>
              )}

              {userRole === "sponsor" && (
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
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of your company and what you do"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading || !userRole}>
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
