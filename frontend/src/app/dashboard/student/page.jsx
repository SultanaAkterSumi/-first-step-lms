'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BookOpen, LogOut } from 'lucide-react'

export default function StudentDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Navbar */}
      <nav className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-[0.2em]">FIRST STEP</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, <span className="text-foreground font-medium">{user?.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Student Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user?.username}! Ready to learn?</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => router.push('/courses')}
            className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary transition"
          >
            <BookOpen className="size-8 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Browse Courses</h3>
            <p className="text-muted-foreground text-sm">Explore all available courses and enroll.</p>
          </div>

          <div
            onClick={() => router.push('/dashboard/student/my-courses')}
            className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary transition"
          >
            <BookOpen className="size-8 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">My Courses</h3>
            <p className="text-muted-foreground text-sm">Continue learning from where you left off.</p>
          </div>

          <div
            onClick={() => router.push('/dashboard/student/results')}
            className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary transition"
          >
            <BookOpen className="size-8 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Quiz Results</h3>
            <p className="text-muted-foreground text-sm">View your quiz scores and progress.</p>
          </div>
        </div>
      </div>
    </div>
  )
}