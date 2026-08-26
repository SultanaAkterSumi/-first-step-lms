'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ArrowRight, BookOpen, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleRegister = async () => {
    setError('')
    setLoading(true)

    try {
      await register(username, email, password)
      //Send user to login page after successful registration
      router.push('/login')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-[0.2em] text-foreground">FIRST STEP</span>
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-primary">Your learning starts here</p>
            <h1 className="max-w-xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground xl:text-6xl">
              Take the first step toward what&apos;s next.
            </h1>
            <p className="mt-6 max-w-md text-pretty text-base leading-7 text-muted-foreground">
              Join a focused learning space built to help you build momentum, learn with purpose, and keep moving forward.
            </p>
            <div className="mt-10 flex flex-col gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3"><Check className="size-4 text-primary" /><span>Learn at your own pace</span></div>
              <div className="flex items-center gap-3"><Check className="size-4 text-primary" /><span>Track your progress clearly</span></div>
              <div className="flex items-center gap-3"><Check className="size-4 text-primary" /><span>Build skills that move you forward</span></div>
            </div>
          </div>

          <p className="relative z-10 font-mono text-xs text-muted-foreground">EST. 2024 / LEARN WITH INTENTION</p>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <span className="font-mono text-xs font-semibold tracking-[0.2em]">FIRST STEP</span>
            </div>

            <div className="mb-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">Create your account</p>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Start learning today.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Set up your student profile to access your learning dashboard.</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* Username */}
              <label className="flex flex-col gap-2 text-sm font-medium">
                Username
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>

              {/* Email */}
              <label className="flex flex-col gap-2 text-sm font-medium">
                Email address
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Create a secure password"
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

              {/* Register Button */}
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register'}
                <ArrowRight className="size-4" />
              </button>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              Already a student? Your role will be Student by default.
            </p>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-primary underline-offset-4 transition hover:underline">
                Log in
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}