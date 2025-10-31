"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, LogOut, Bell, Lock, Crown } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { Badge } from "@/components/ui/badge"
import { signOut } from "@/app/auth/actions"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"
import { useToast } from "@/components/ui/use-toast"

export function SettingsPage() {
  const { toast } = useToast()
  
  // Use React Query hooks for data fetching and caching
  const { data: profile, isLoading: loading, error } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  
  // Local state for form inputs
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    profession: profile?.profession || "",
    avatar_url: profile?.avatar_url || "",
  })

  // Sync form with profile data when it loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        profession: profile.profession || "",
        avatar_url: profile.avatar_url || "",
      })
    }
  }, [profile])

  const [plan] = useState("Free") // Plan can be loaded separately if needed

  const [settings, setSettings] = useState({
    theme: "system",
    emailNotifications: true,
    cvReminders: true,
    twoFactor: false,
    defaultTemplate: "modern",
  })

  // Handle save with React Query mutation
  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        full_name: profileForm.full_name || null,
        profession: profileForm.profession || null,
        avatar_url: profileForm.avatar_url || null,
      })
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  // Redirect to login if unauthorized
  useEffect(() => {
    if (error && 'message' in error && error.message === 'Unauthorized') {
      window.location.href = '/login'
    }
  }, [error])

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Grid Pattern Background */}
      <GridPattern 
        className="absolute inset-0 opacity-10" 
        width={40} 
        height={40} 
        x={0}
        y={0}
        strokeDasharray="0"
      />
      {/* Header */}
      <div className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-[#0f172a]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 border-white/20">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Settings</h1>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Profile Section */}
        <Card className="p-8 mb-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 text-white">Profile</h2>
          {loading ? (
            <div className="text-gray-400">Loading profile...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-white">Full Name</label>
                <Input
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-white">Email Address</label>
                <Input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  placeholder="your@email.com"
                  className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400 opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-white">Profession</label>
                <Input
                  value={profileForm.profession}
                  onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })}
                  placeholder="e.g. Software Engineer, Designer, etc."
                  className="bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <ShimmerButton 
                onClick={handleSaveProfile} 
                disabled={updateProfileMutation.isPending} 
                className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </ShimmerButton>
            </div>
          )}
        </Card>

        {/* Preferences Section */}
        <Card className="p-8 mb-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 text-white">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Theme</p>
                <p className="text-xs text-gray-300">Choose your preferred color scheme</p>
              </div>
              <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                <SelectTrigger className="w-32 bg-[#0f172a]/60 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/20">
                  <SelectItem value="light" className="text-white">Light</SelectItem>
                  <SelectItem value="dark" className="text-white">Dark</SelectItem>
                  <SelectItem value="system" className="text-white">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-white/20 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-white">Default Template</p>
                  <p className="text-xs text-gray-300">Template for new CVs</p>
                </div>
                <Select
                  value={settings.defaultTemplate}
                  onValueChange={(value) => setSettings({ ...settings, defaultTemplate: value })}
                >
                  <SelectTrigger className="w-32 bg-[#0f172a]/60 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/20">
                    <SelectItem value="modern" className="text-white">Modern</SelectItem>
                    <SelectItem value="classic" className="text-white">Classic</SelectItem>
                    <SelectItem value="minimal" className="text-white">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-8 mb-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Bell className="w-5 h-5 text-[#0ea5e9]" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Email Notifications</p>
                <p className="text-xs text-gray-300">Receive updates about your account</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="border-t border-white/20 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-white">CV Reminders</p>
                  <p className="text-xs text-gray-300">Get reminded to update your CVs</p>
                </div>
                <Switch
                  checked={settings.cvReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, cvReminders: checked })}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Section */}
        <Card className="p-8 mb-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Lock className="w-5 h-5 text-[#f97316]" />
            Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Two-Factor Authentication</p>
                <p className="text-xs text-gray-300">Add an extra layer of security</p>
              </div>
              <Switch
                checked={settings.twoFactor}
                onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
              />
            </div>

            <div className="border-t border-white/20 pt-4">
              <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10">
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Plan Section */}
        <Card className="p-8 mb-6 border-[#0ea5e9]/20 bg-[#0ea5e9]/5">
          <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#0ea5e9]" />
            Current Plan
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-white">{plan} Plan</p>
              <AnimatedGradientText className="text-sm">
                1 CV per month • Basic templates
              </AnimatedGradientText>
            </div>
            <Link href="/upgrade">
              <ShimmerButton className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white">
                Upgrade Plan
              </ShimmerButton>
            </Link>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 border-red-500/20 bg-red-500/5">
          <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 text-red-400 hover:text-red-300 bg-transparent w-full border-red-500/20 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0f172a]/95 backdrop-blur-sm border-white/20 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Sign Out</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">Are you sure you want to sign out of your account?</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel className="bg-[#0f172a] border-white/20 text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await signOut()
                    }}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Sign Out
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 text-red-400 hover:text-red-300 bg-transparent w-full border-red-500/20 hover:bg-red-500/10"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0f172a]/95 backdrop-blur-sm border-white/20 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Account</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This action cannot be undone. All your CVs and data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel className="bg-[#0f172a] border-white/20 text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600">
                    Delete Account
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </main>
    </div>
  )
}
