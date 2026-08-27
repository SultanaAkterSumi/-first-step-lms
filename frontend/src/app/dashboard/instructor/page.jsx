'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { BookOpen, Users, LogOut, ArrowUpRight } from 'lucide-react'

export default function InstructorDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Instructor's own courses
const res = await api.get('/courses/my-courses')
setCourses(res.data.data)
        
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchCourses()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading || fetching) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
      Loading...
    </div>
  )

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 text-foreground">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">First Step</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-primary">Instructor workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">My Courses</h1>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {courses.length} courses
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="mt-10 text-center py-20 border border-border rounded-2xl">
            <p className="text-muted-foreground">No courses assigned to you yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.documentId}
                className="group flex min-h-52 flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/instructor/courses/' + course.documentId)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-primary transition"
                  >
                    <ArrowUpRight className="size-5" />
                  </button>
                </div>

                <h2 className="mt-6 text-lg font-semibold tracking-tight">{course.title}</h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <BookOpen className="size-3.5 text-primary" />
                    {course.lessonCount || 0} lessons
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard/instructor/courses/' + course.documentId)}
                  className="mt-auto flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Manage
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}