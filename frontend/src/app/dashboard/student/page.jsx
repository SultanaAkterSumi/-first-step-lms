'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function StudentDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/enrollments/my-courses')
        setEnrollments(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchEnrollments()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getProgress = (enrollment) => {
    const total = enrollment.course?.lessons?.length || 0
    const completed = enrollment.completed_lessons?.length || 0
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <nav className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            +
          </div>
          <span className="font-mono text-sm font-semibold tracking-[0.2em]">FIRST STEP</span>
        </a>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Hi, <span className="text-foreground font-medium">{user?.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">My Courses</h1>
          <p className="text-muted-foreground mt-2">Continue where you left off.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-2xl">
            <p className="text-muted-foreground mb-4">You have not enrolled in any courses yet.</p>
            
             <a href="/courses" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition">
  Browse Courses
</a>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {enrollments.map((enrollment) => {
              const course = enrollment.course
              const progress = getProgress(enrollment)
              return (
                <div
                  key={enrollment.documentId}
                  onClick={() => router.push('/dashboard/student/learn/' + enrollment.documentId)}
                  className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary transition"
                >
                  {course?.cover_image_url && (
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="w-full h-36 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-2">{course?.title}</h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>{enrollment.completed_lessons?.length || 0} lessons completed</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: progress + '%' }}
                      />
                    </div>
                  </div>
                  <button className="mt-4 w-full h-10 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition">
                    Continue Learning
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}