"use client"

import * as React from 'react'
import { Children,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense, } from 'react'
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { LinkedInSignIn } from "@/components/linkedin-signin"
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  [key: string]: any;
}

const AppInput = (props: InputProps) => {
  const { label, placeholder, icon, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full min-w-[200px] relative">
      { label && 
        <label className='block mb-2 text-sm text-white'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          type="text"
          className="peer relative z-10 border-2 border-white/20 h-13 w-full rounded-md bg-white/5 px-4 font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white/10 placeholder:text-gray-400 text-white"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, #0ea5e9 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, #0ea5e9 0%, transparent 70%)`,
              }}
            />
          </>
        )}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

const LoginPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  // Check for error in URL params (from callback redirect)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'flow_state_expired') {
        setError('Authentication session expired. Please try signing in again.')
      } else {
        setError(decodeURIComponent(errorParam))
      }
      // Clean up URL
      router.replace('/login')
    }
  }, [searchParams, router])

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  const handleGitHubSignIn = async () => {
    try {
      console.log('🔵 Starting GitHub OAuth login...')
      
      // Clear any existing session to force new OAuth flow
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.warn('⚠️ Error signing out before GitHub login:', signOutError)
      } else {
        console.log('✅ Cleared existing session')
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Note: GitHub doesn't support queryParams like prompt/access_type
          // The signOut above ensures we get a fresh OAuth flow
        },
      })
      
      if (error) {
        console.error('❌ GitHub OAuth error:', error)
        setError(error.message)
      } else {
        console.log('✅ GitHub OAuth redirect initiated:', data?.url)
        // The redirect will happen automatically via data.url
      }
    } catch (error: any) {
      console.error('❌ Unexpected error in GitHub login:', error)
      setError(error.message || 'Failed to initiate GitHub login')
    }
  }

  const handleLinkedInSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid profile email',
      },
    })
    if (error) setError(error.message)
  }

  const socialIcons = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
      href: '#',
      gradient: 'bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee]',
      name: 'GitHub',
      onClick: handleGitHubSignIn
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 5a2 2 0 1 1-4-.002a2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z"/></svg>,
      href: '#',
      gradient: 'bg-gradient-to-r from-[#0ea5e9] to-[#f97316]',
      name: 'LinkedIn',
      onClick: handleLinkedInSignIn
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
      href: '#',
      gradient: 'bg-gradient-to-r from-[#f97316] to-[#22d3ee]',
      name: 'Google',
      onClick: handleGoogleSignIn
    }
  ];

  return (
    <div className="h-screen w-[100%] bg-[#0f172a] flex items-center justify-center p-4">
      <div className='card w-[80%] lg:w-[70%] md:w-[55%] flex justify-between h-[600px]'>
        <div
          className='w-full lg:w-1/2 px-4 lg:px-16 left h-full relative overflow-hidden'
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
            <div
              className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-[#0ea5e9]/30 via-[#f97316]/30 to-[#22d3ee]/30 rounded-full blur-3xl transition-opacity duration-200 ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            <div className="form-container sign-in-container h-full z-10">
              <form className='text-center py-10 md:py-20 grid gap-2 h-full' onSubmit={handleEmailAuth}>
                <div className='grid gap-4 md:gap-6 mb-2'>
                  <h1 className='text-3xl md:text-4xl font-extrabold text-white'>
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </h1>
                  <div className="social-container">
                    <div className="flex items-center justify-center">
                      <ul className="flex gap-3 md:gap-4">
                        {socialIcons.map((social, index) => {
                          return (
                            <li key={index} className="list-none">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (social.onClick) {
                                    social.onClick()
                                  } else if (social.href !== '#') {
                                    router.push(social.href)
                                  }
                                }}
                                className={`w-[2.5rem] md:w-[3rem] h-[2.5rem] md:h-[3rem] bg-white/5 rounded-full flex justify-center items-center relative z-[1] border-2 border-white/20 overflow-hidden group hover:border-white/40 transition-all`}
                                title={social.name}
                              >
                                <div
                                  className={`absolute inset-0 w-full h-full ${
                                    social.gradient
                                  } scale-y-0 origin-bottom transition-transform duration-500 ease-in-out group-hover:scale-y-100`}
                                />
                                <span className="text-[1.5rem] text-[hsl(203,92%,8%)] transition-all duration-500 ease-in-out z-[2] group-hover:text-white group-hover:rotate-y-360">
                                  {social.icon}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
                <span className='text-sm text-gray-300'>or use your account</span>
                {error && (
                  <div className='text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-2'>
                    {error}
                  </div>
                )}
                <div className='grid gap-4 items-center'>
                  <AppInput 
                    placeholder="Email" 
                    type="email" 
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                  <AppInput 
                    placeholder="Password" 
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <a href="#" className='font-light text-sm md:text-md text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors'>Forgot your password?</a>
                <div className='flex gap-4 justify-center items-center'>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-white/10 px-4 py-1.5 text-xs font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-[#0ea5e9] cursor-pointer border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm px-2 py-1">
                      {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                    </span>
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                      <div className="relative h-full w-8 bg-white/20" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-[#22d3ee] hover:text-[#22d3ee]/80 transition-colors underline"
                  >
                    {isSignUp ? 'Already have an account?' : 'Need an account?'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className='hidden lg:block w-1/2 right h-full overflow-hidden'>
            <Image
              src='/CV.jpg'
              width={1000}
              height={1000}
              priority
              alt="AI CV Generation Preview"
              className="w-full h-full object-cover transition-transform duration-300 opacity-30"
            />
          </div>
        </div>
      </div>
  )
}

// Wrapper component with Suspense for useSearchParams
export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginPage />
    </Suspense>
  )
}
