'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Linkedin } from 'lucide-react'
import { useState } from 'react'

export function LinkedInSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid profile email',
        },
      })

      if (error) {
        console.error('LinkedIn sign-in error:', error)
        alert('Failed to sign in with LinkedIn. Please try again.')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      size="lg"
      className="w-full font-mono"
      variant="outline"
    >
      <Linkedin className="mr-2 h-5 w-5" />
      {isLoading ? 'Connecting...' : '> SIGN IN WITH LINKEDIN'}
    </Button>
  )
}
