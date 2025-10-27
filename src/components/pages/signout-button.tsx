'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      alert('Failed to sign out. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}
