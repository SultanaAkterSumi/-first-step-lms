'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, BookOpen, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await login(identifier, password)
      // Login -> Landing page 
      router.push('/')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        
        {/* Left Side */}
        <section className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-size-[64px_64px]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-[0.2em]">FIRST STEP</span>
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-primary">Welcome back</p>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
              Continue where you left off.
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              Sign in to access your courses, track your progress, and keep learning.
            </p>
          </div>

          <p className="relative z-10 font-mono text-xs text-muted-foreground">EST. 2024 / LEARN WITH INTENTION</p>
        </section>

        {/* Right Side */}
        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            
            {/* Mobile Logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <span className="font-mono text-xs font-semibold tracking-[0.2em]">FIRST STEP</span>
            </div>

            <div className="mb-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">Sign in</p>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Welcome back.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter your credentials to access your dashboard.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* Email */}
              <label className="flex flex-col gap-2 text-sm font-medium">
                Email or Username
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>

              {/* Password */}
              <label className="flex flex-col gap-2 text-sm font-medium">
                Password
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              {/* Login Button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="size-4" />
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="/register" className="font-semibold text-primary underline-offset-4 transition hover:underline">
                Register here
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}