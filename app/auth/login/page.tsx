'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Only the credential/existence signal is genericized — naming it would confirm
// whether an email is registered. Errors the user can act on are passed through,
// and anything unexpected is reported as such instead of as a wrong password.
function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }

  if (code === 'email_not_confirmed') {
    return 'Please confirm your email address — check your inbox for the link.'
  }
  if (code === 'over_request_rate_limit' || status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (code === 'invalid_credentials') {
    return 'Invalid email or password.'
  }
  return 'Something went wrong. Please try again.'
}

function normalizeIdentifier(val: string): string {
  const clean = val.trim()
  
  if (/^\+?[0-9\s-]+$/.test(clean)) {
    const digits = clean.replace(/[^0-9]/g, '')
    let normalizedPhone = digits
    
    if (digits.startsWith('213') && digits.length === 12) {
      normalizedPhone = '0' + digits.slice(3)
    } else if (digits.length === 9) {
      normalizedPhone = '0' + digits
    }
    
    if (normalizedPhone.length === 10 && normalizedPhone.startsWith('0')) {
      return `${normalizedPhone}@admin.com`
    }
  }
  
  return clean
}

export default function Page() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const email = normalizeIdentifier(identifier)

      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      if (!user) throw new Error('No user returned')

      // Check if user is admin/owner via user_roles table or user_metadata fallback
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const isAdmin = roleData?.role === 'admin' || roleData?.role === 'owner' || user?.user_metadata?.is_admin === true
      if (!isAdmin) {
        await supabase.auth.signOut()
        throw new Error('Not authorized as admin')
      }

      router.push('/admin')
    } catch (error: unknown) {
      console.error('Login error:', error)
      const message = (error as any)?.message
      if (message === 'Not authorized as admin') {
        setError('Only admin users can access this area.')
      } else {
        setError(loginErrorMessage(error))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Enter your admin credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="identifier">Email or Phone Number</Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Email or phone number"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
