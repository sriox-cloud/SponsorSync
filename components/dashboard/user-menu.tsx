"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, Edit } from "lucide-react"
import { EditProfileDialog } from "./edit-profile-dialog"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

export function UserMenu() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
              <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
              <p className="text-xs leading-none text-muted-foreground capitalize">{profile?.role}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEditProfile(true)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={profile}
        onProfileUpdated={fetchProfile}
      />
    </>
  )
}
