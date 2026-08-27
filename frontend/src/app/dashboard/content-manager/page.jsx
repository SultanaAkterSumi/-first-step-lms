'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  BookOpen, CalendarDays, Edit3, ImageIcon,
  LayoutGrid, LogOut, Plus, Search, Trash2, X,
} from 'lucide-react'

export default function ContentManagerDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState('courses')
  const [courses, setCourses] = useState([])
  const [posts, setPosts] = useState([])
  const [instructors, setInstructors] = useState([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await api.get('/courses?populate=instructor')
        setCourses(coursesRes.data.data)

        const postsRes = await api.get('/blog-posts?populate=author')
        setPosts(postsRes.data.data)

        // Instructors list আনো
        const usersRes = await api.get('/users?populate=role')
        const instructorUsers = usersRes.data.filter(
          u => u.role?.type === 'instructor'
        )
        setInstructors(instructorUsers)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchData()
  }, [user])

  const handleLogout = () => { logout(); router.push('/') }

 const handleSaveCourse = async (courseData) => {
    try {
      const payload = {
        data: {
          title: courseData.title,
          description: [
            {
              type: "paragraph",
              children: [{ type: "text", text: courseData.description || "" }],
            },
          ],
          cover_image_url: courseData.cover_image_url,
          instructor: courseData.instructorId || null,
          published: courseData.published,
        }
      }

      if (courseData.documentId) {
        const res = await api.put('/courses/' + courseData.documentId, payload)
        setCourses(courses.map(c => c.documentId === courseData.documentId ? res.data.data : c))
      } else {
        const res = await api.post('/courses', payload)
if (res.data && res.data.data) {
  setCourses([res.data.data, ...courses])
} else {
  const refreshRes = await api.get('/courses?populate=instructor')
  setCourses(refreshRes.data.data)
}
      }
      setEditing(null)
    } catch (err) {
      alert('Failed to save course')
    }
  }

  const handleDeleteCourse = async (documentId) => {
    if (!confirm('Delete this course?')) return
    try {
      await api.delete('/courses/' + documentId)
      setCourses(courses.filter(c => c.documentId !== documentId))
    } catch (err) {
      alert('Failed to delete course')
    }
  }

  // Blog CRUD
  const handleSavePost = async (postData) => {
    try {
      if (postData.documentId) {
        const res = await api.put('/blog-posts/' + postData.documentId, {
          data: {
            title: postData.title,
            body: postData.body,
            cover_image_url: postData.cover_image_url,
            post_status: postData.post_status,
          }
        })
        setPosts(posts.map(p => p.documentId === postData.documentId ? res.data.data : p))
      } else {
        const res = await api.post('/blog-posts', {
          data: {
            title: postData.title,
            body: postData.body,
            cover_image_url: postData.cover_image_url,
            post_status: postData.post_status,
            author: user.id,
          }
        })
        setPosts([res.data.data, ...posts])
      }
      setEditing(null)
    } catch (err) {
      alert('Failed to save post')
    }
  }

  const handleDeletePost = async (documentId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete('/blog-posts/' + documentId)
      setPosts(posts.filter(p => p.documentId !== documentId))
    } catch (err) {
      alert('Failed to delete post')
    }
  }

  const filteredCourses = useMemo(() => {
    const q = query.toLowerCase()
    return courses.filter(c => c.title?.toLowerCase().includes(q))
  }, [courses, query])

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase()
    return posts.filter(p => p.title?.toLowerCase().includes(q))
  }, [posts, query])

  if (loading || fetching) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>
  )

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">First Step</span>
          </a>
          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">Content Manager</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition"
            >
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-screen-xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">

        {/* Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
              <LayoutGrid className="size-3.5" /> Workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Content Manager</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Manage courses, lessons, and blog posts.
            </p>
          </div>
          <button
            onClick={() => setEditing({ type: tab })}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <Plus className="size-4" />
            {tab === 'courses' ? 'Create Course' : 'Write Post'}
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="mb-7 flex flex-col gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-7">
            {['courses', 'blog'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setQuery('') }}
                className={`relative pb-4 text-sm font-semibold transition capitalize ${tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t}
                {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
              </button>
            ))}
          </div>
          <div className="mb-3 flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 text-muted-foreground sm:w-64">
            <Search className="size-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={'Search ' + tab + '...'}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Courses Tab */}
        {tab === 'courses' && (
          <section>
            <p className="mb-4 text-sm text-muted-foreground">{filteredCourses.length} courses</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {filteredCourses.map((course) => (
                <article key={course.documentId} className="group overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition">
                  <div className="relative aspect-[1.45] overflow-hidden bg-border">
                    {course.cover_image_url ? (
                      <img src={course.cover_image_url} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="size-8 text-primary/40" />
                      </div>
                    )}
                    <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[11px] font-semibold ${course.published ? 'bg-primary text-primary-foreground' : 'bg-card/90 text-muted-foreground'}`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h2 className="truncate font-semibold">{course.title}</h2>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {course.instructor?.username || 'No instructor'}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>Course</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditing({ type: 'courses', data: course })}
                          className="rounded-md p-1.5 hover:bg-card hover:text-foreground"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.documentId)}
                          className="rounded-md p-1.5 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Blog Tab */}
        {tab === 'blog' && (
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden grid-cols-[1fr_140px_150px_100px] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Title</span><span>Status</span><span>Date</span><span className="text-right">Actions</span>
            </div>
            {filteredPosts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No blog posts yet.</p>
            ) : filteredPosts.map((post) => (
              <div key={post.documentId} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[1fr_140px_150px_100px] sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {post.cover_image_url && (
                    <div className="hidden size-10 shrink-0 overflow-hidden rounded-md bg-border sm:block">
                      <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{post.title}</h2>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${post.post_status === 'published' ? 'bg-primary/15 text-primary' : 'bg-border text-muted-foreground'}`}>
                    {post.post_status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex justify-start gap-1 sm:justify-end">
                  <button
                    onClick={() => setEditing({ type: 'blog', data: post })}
                    className="rounded-md p-1.5 hover:bg-card hover:text-foreground"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.documentId)}
                    className="rounded-md p-1.5 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Editor Modal */}
      {editing && (
        <EditorModal
          editing={editing}
          instructors={instructors}
          onClose={() => setEditing(null)}
          onSaveCourse={handleSaveCourse}
          onSavePost={handleSavePost}
        />
      )}
    </main>
  )
}

function EditorModal({ editing, instructors, onClose, onSaveCourse, onSavePost }) {
  const isCourse = editing.type === 'courses'
  const existing = editing.data

  const [courseForm, setCourseForm] = useState({
    documentId: existing?.documentId || null,
    title: existing?.title || '',
    description: existing?.description?.[0]?.children?.[0]?.text || '',
    cover_image_url: existing?.cover_image_url || '',
    instructorId: existing?.instructor?.id || '',
    published: existing?.published || false,
  })

  const [postForm, setPostForm] = useState({
    documentId: existing?.documentId || null,
    title: existing?.title || '',
    body: existing?.body || '',
    cover_image_url: existing?.cover_image_url || '',
    post_status: existing?.post_status || 'draft',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              {isCourse ? 'Course editor' : 'Blog editor'}
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              {isCourse ? (existing ? 'Edit course' : 'Create course') : (existing ? 'Edit post' : 'Write a post')}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-card">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {isCourse ? (
            <>
              <label className="block space-y-2 text-sm font-medium">
                Title
                <input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Course title"
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Description
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="What will students learn?"
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Cover Image URL
                <input
                  value={courseForm.cover_image_url}
                  onChange={(e) => setCourseForm({ ...courseForm, cover_image_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Instructor
                <select
                  value={courseForm.instructorId}
                  onChange={(e) => setCourseForm({ ...courseForm, instructorId: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select instructor</option>
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>{i.username}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => setCourseForm({ ...courseForm, published: !courseForm.published })}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left"
              >
                <span>
                  <span className="block text-sm font-medium">Publish course</span>
                  <span className="block text-xs text-muted-foreground mt-1">Make visible to students</span>
                </span>
                <span className={`flex h-6 w-10 items-center rounded-full p-1 transition ${courseForm.published ? 'bg-primary justify-end' : 'bg-border justify-start'}`}>
                  <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </span>
              </button>
            </>
          ) : (
            <>
              <label className="block space-y-2 text-sm font-medium">
                Title
                <input
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="Post title"
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Body
                <textarea
                  value={postForm.body}
                  onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
                  placeholder="Write your post..."
                  rows={6}
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Cover Image URL
                <input
                  value={postForm.cover_image_url}
                  onChange={(e) => setPostForm({ ...postForm, cover_image_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Status
                <select
                  value={postForm.post_status}
                  onChange={(e) => setPostForm({ ...postForm, post_status: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-card">
            Cancel
          </button>
          <button
            onClick={() => isCourse ? onSaveCourse(courseForm) : onSavePost(postForm)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Save {isCourse ? 'course' : 'post'}
          </button>
        </div>
      </div>
    </div>
  )
}