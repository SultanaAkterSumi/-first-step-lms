'use client'

import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4.5v17M9 6h6" strokeLinecap="round" />
    </svg>
  )
}

export default function CoursesPage() {
  const [query, setQuery] = useState('')
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses?populate=instructor')
        setCourses(res.data.data)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    const fetchEnrolled = async () => {
      if (!user || user.role?.type !== 'student') return
      try {
        const res = await api.get('/enrollments/my-courses')
        const ids = res.data.data.map((e) => e.course?.documentId)
        setEnrolledIds(ids)
      } catch (err) {
        console.error('Failed to fetch enrollments:', err)
      }
    }
    fetchEnrolled()
  }, [user])

  const handleEnroll = async (courseDocumentId) => {
    if (!user) { router.push('/login'); return }
    if (user.role?.type !== 'student') return
    setEnrolling(courseDocumentId)
    try {
      await api.post('/enrollments/enroll', { data: { courseId: courseDocumentId } })
      setEnrolledIds((prev) => [...prev, courseDocumentId])
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Enrollment failed')
    } finally {
      setEnrolling(null)
    }
  }

  const filteredCourses = useMemo(() => {
    const q = query.toLowerCase().trim()
    return courses.filter((course) =>
      `${course.title} ${course.description}`.toLowerCase().includes(q)
    )
  }, [query, courses])

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">F</span>
          <span className="font-semibold tracking-tight">First Step</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground transition">Blog</Link>
          {user ? (
            <Link href={
              user.role?.type === 'student' ? '/dashboard/student' :
              user.role?.type === 'instructor' ? '/dashboard/instructor' :
              user.role?.type === 'content_manager' ? '/dashboard/content-manager' :
              '/dashboard/admin'
            } className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium text-primary">LEARN SOMETHING NEW</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All Courses</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Explore practical courses designed to help you take your next step with confidence.
            </p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
              className="h-11 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </header>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading courses...</div>
        ) : (
          <div className="grid gap-5 pt-8 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.documentId)
              const isEnrolling = enrolling === course.documentId
              return (
                <article
                  key={course.documentId}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-transform duration-200 hover:-translate-y-1 hover:border-primary/50"
                >
                  <div className="relative aspect-[1.8] overflow-hidden bg-card">
                    {course.cover_image_url ? (
                      <img src={course.cover_image_url} alt={course.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="size-full bg-primary/10 flex items-center justify-center">
                        <BookIcon />
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-[200px] flex-col p-5">
                    <h2 className="text-lg font-semibold tracking-tight">{course.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {course.description?.[0]?.children?.[0]?.text || 'No description'}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Instructor</p>
                        <p className="mt-1 text-sm font-medium">{course.instructor?.username || 'Unknown'}</p>
                      </div>
                    </div>
                    {user?.role?.type === 'student' && (
                      <button
                        onClick={() => !isEnrolled && handleEnroll(course.documentId)}
                        disabled={isEnrolled || isEnrolling}
                        className={`mt-4 h-10 rounded-lg text-sm font-semibold transition-colors ${isEnrolled ? 'bg-card border border-primary text-primary cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                      >
                        {isEnrolling ? 'Enrolling...' : isEnrolled ? 'Enrolled ✓' : 'Enroll'}
                      </button>
                    )}
                    {(!user || user?.role?.type !== 'student') && (
                      <button
                        onClick={() => router.push('/courses/' + course.documentId)}
                        className="mt-4 h-10 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        View Course
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
        {!loading && filteredCourses.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">No courses match your search.</p>
        )}
      </div>
    </main>
  )
}