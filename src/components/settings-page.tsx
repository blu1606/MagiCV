"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, LogOut, Bell, Lock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
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

export function SettingsPage() {
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    plan: "Free",
  })

  const [settings, setSettings] = useState({
    theme: "system",
    emailNotifications: true,
    cvReminders: true,
    twoFactor: false,
    defaultTemplate: "modern",
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert("Profile updated successfully!")
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Settings</h1>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <Card className="p-6 mb-6 bg-black/60 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 text-white">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block text-white">Full Name</label>
              <Input
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block text-white">Email Address</label>
              <Input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="glitch-button text-black font-bold">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6 mb-6 bg-black/60 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 text-white">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Theme</p>
                <p className="text-xs text-gray-300">Choose your preferred color scheme</p>
              </div>
              <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Default Template</p>
                  <p className="text-xs text-muted-foreground">Template for new CVs</p>
                </div>
                <Select
                  value={settings.defaultTemplate}
                  onValueChange={(value) => setSettings({ ...settings, defaultTemplate: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6 mb-6 bg-black/60 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Bell className="w-5 h-5" />
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

            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">CV Reminders</p>
                  <p className="text-xs text-muted-foreground">Get reminded to update your CVs</p>
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
        <Card className="p-6 mb-6 bg-black/60 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Lock className="w-5 h-5" />
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

            <div className="border-t border-border/50 pt-4">
              <Button variant="outline" className="w-full bg-transparent">
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Plan Section */}
        <Card className="p-6 mb-6 border-pink-400/20 bg-pink-400/5">
          <h2 className="text-lg font-semibold mb-4 text-white">Current Plan</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-white">{user.plan} Plan</p>
              <p className="text-sm text-gray-300">1 CV per month • Basic templates</p>
            </div>
            <Link href="/upgrade">
              <Button className="glitch-button text-black font-bold">Upgrade Plan</Button>
            </Link>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-500/20 bg-red-500/5">
          <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to sign out of your account?</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sign Out
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent w-full"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your CVs and data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
