"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { SponsorDashboard } from "@/components/dashboard/sponsor-dashboard"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is “JSON object requested, multiple rows returned”
        console.error("Unexpected profile fetch error:", error)
        router.push("/setup")
        return
      }

      if (!data) {
        // No profile yet – send the user to the profile setup flow.
        router.push("/setup")
        return
      }

      setUserRole(data.role)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/auth")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {userRole === "organizer" && <OrganizerDashboard />}
        {userRole === "sponsor" && <SponsorDashboard />}
        {!userRole && (
          <div className="text-center">
            <p>Unable to determine user role. Please contact support.</p>
          </div>
        )}
      </div>
    </div>
  )
}
