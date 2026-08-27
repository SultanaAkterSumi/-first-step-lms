'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

function Arrow() {
  return <span aria-hidden="true" className="text-lg leading-none">↗</span>
}

const features = [
  { mark: '↗', title: 'Learn at Your Pace', text: 'Fit meaningful learning into your life with flexible lessons that move with you.' },
  { mark: '✦', title: 'Expert Instructors', text: 'Learn from thoughtful practitioners who know how to make complex ideas click.' },
  { mark: '◒', title: 'Track Progress', text: 'See your momentum grow with clear milestones and a learning path built for you.' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [blogs, setBlogs] = useState([])

  const { user, logout } = useAuth()
  const router = useRouter()

  // Real courses 
  useEffect(() => {
    const fetchData = async () => {
      try {
       const coursesRes = await api.get('/courses?filters[published][$eq]=true&pagination[limit]=3&populate=instructor')
        setCourses(coursesRes.data.data)

        const blogsRes = await api.get('/blog-posts?pagination[limit]=2')
setBlogs(blogsRes.data.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  // Role wise dashboard link
  const getDashboardLink = () => {
    const role = user?.role?.type
    if (role === 'admin') return '/dashboard/admin'
    if (role === 'instructor') return '/dashboard/instructor'
    if (role === 'content_manager') return '/dashboard/content-manager'
    if (role === 'student') return '/dashboard/student'
    return '/'
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">+</span>
          First Step
        </a>
        <div className="hidden items-center gap-9 text-sm text-muted-foreground md:flex">
          <a className="transition-colors hover:text-foreground" href="/courses">Courses</a>
          <a className="transition-colors hover:text-foreground" href="/blog">Blog</a>
        </div>
        <div className="hidden items-center gap-5 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">Hi, <span className="text-foreground font-medium">{user.username}</span></span>
              <a href={getDashboardLink()} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
                Dashboard
              </a>
              <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Login</a>
              <a href="/register" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">Get Started</a>
            </>
          )}
        </div>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-muted-foreground md:hidden">
          {menuOpen ? '×' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mx-6 flex flex-col gap-4 border-t border-border py-5 text-sm">
          <a href="/courses">Courses</a>
          <a href="/blog">Blog</a>
          {user ? (
            <>
              <a href={getDashboardLink()} className="w-fit rounded-full bg-primary px-4 py-2 text-primary-foreground">Dashboard</a>
              <button onClick={handleLogout} className="text-left text-muted-foreground">Logout</button>
            </>
          ) : (
            <>
              <a href="/login">Login</a>
              <a href="/register" className="w-fit rounded-full bg-primary px-4 py-2 text-primary-foreground">Get Started</a>
            </>
          )}
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="max-w-4xl">
          <p className="mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary" /> Learn something that moves you
          </p>
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-7xl lg:text-[6.5rem]">
            Your First Step to <span className="text-primary">Smarter</span> Learning
          </h1>
          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              A better way to learn the skills that shape your future. Start small, stay curious, and keep going.
            </p>
            <div className="flex shrink-0 gap-3">
              <a href="/courses" className="group flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
                Browse Courses <Arrow />
              </a>
              {!user && (
                <a href="/register" className="flex items-center gap-3 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
                  Get Started Free <Arrow />
                </a>
              )}
              {user && (
                <a href={getDashboardLink()} className="flex items-center gap-3 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
                  My Dashboard <Arrow />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-20 border-y border-border py-5 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>Trusted by curious minds everywhere</span>
            <span className="hidden h-px flex-1 bg-border sm:block" />
            <span className="font-mono text-xs tracking-wider">START WHERE YOU ARE · GO FROM THERE</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">Why First Step</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Learning, made human.</h2>
          </div>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="bg-card p-7 lg:p-9">
              <span className="mb-14 block text-3xl text-primary">{feature.mark}</span>
              <h3 className="mb-3 text-xl font-medium">{feature.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Featured Courses — Real Data */}
      <section className="bg-card/50 px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">Curated for you</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured courses</h2>
            </div>
            <a href="/courses" className="hidden items-center gap-2 text-sm font-medium text-primary sm:flex">
              View all <Arrow />
            </a>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {courses.length > 0 ? courses.map((course) => (
              <article key={course.documentId} className="group overflow-hidden rounded-2xl border border-border bg-card">
                {course.cover_image_url ? (
                  <img src={course.cover_image_url} alt={course.title} className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-4xl">📚</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-medium leading-snug group-hover:text-primary">{course.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {course.instructor?.username && `By ${course.instructor.username}`}
                  </p>
                  <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
                    <a href="/courses" className="text-foreground">Explore <Arrow /></a>
                  </div>
                </div>
              </article>
            )) : (
              // Placeholder যদি কোনো course না থাকে
              [1,2,3].map((i) => (
                <div key={i} className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Blog Preview — Real Data */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">From the journal</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ideas for your next step</h2>
          </div>
          <a href="/blog" className="hidden items-center gap-2 text-sm font-medium text-primary sm:flex">
            Read the blog <Arrow />
          </a>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {blogs.length > 0 ? blogs.map((post) => (
            <article key={post.documentId} className="group border-t border-border pt-5">
              <div className="mb-16 flex items-center justify-between text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="rounded-full border border-border px-3 py-1">{post.post_status}</span>
              </div>
              <h3 className="max-w-lg text-2xl font-medium leading-tight tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
                {post.title}
              </h3>
              <a href={`/blog/${post.documentId}`} className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                Read story <Arrow />
              </a>
            </article>
          )) : (
            <p className="text-muted-foreground text-sm">No blog posts yet.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-24 rounded-3xl bg-primary px-6 py-16 text-primary-foreground sm:px-12 lg:mx-auto lg:max-w-7xl lg:py-20">
        <p className="mb-5 text-xs uppercase tracking-[0.2em] opacity-70">Your next chapter starts here</p>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Take the first step. We'll help with the rest.
          </h2>
          <a href={user ? getDashboardLink() : '/register'} className="flex w-fit items-center gap-3 rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground">
            {user ? 'Go to Dashboard' : 'Start learning free'} <Arrow />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-3 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">+</span>
            First Step
          </a>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/courses" className="hover:text-foreground">Courses</a>
            <a href="/blog" className="hover:text-foreground">Blog</a>
            {!user && <a href="/login" className="hover:text-foreground">Login</a>}
          </div>
          <p className="text-xs text-muted-foreground">© 2026 First Step. Keep learning.</p>
        </div>
      </footer>
    </main>
  )
}