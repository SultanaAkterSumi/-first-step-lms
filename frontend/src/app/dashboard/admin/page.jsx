'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  BookOpen, ChevronDown, FileText, GraduationCap,
  LayoutDashboard, LogOut, Menu, Search, UserRound, Users, X,
} from 'lucide-react'

const tabs = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Users', icon: Users },
  { label: 'Courses', icon: BookOpen },
  { label: 'Blog', icon: FileText },
]

const roleStyles = {
  admin: 'bg-purple-500/12 text-purple-300 ring-1 ring-purple-400/20',
  instructor: 'bg-blue-500/12 text-blue-300 ring-1 ring-blue-400/20',
  content_manager: 'bg-orange-500/12 text-orange-300 ring-1 ring-orange-400/20',
  student: 'bg-green-500/12 text-green-300 ring-1 ring-green-400/20',
  authenticated: 'bg-gray-500/12 text-gray-300 ring-1 ring-gray-400/20',
}

const roleLabels = {
  admin: 'Admin',
  instructor: 'Instructor',
  content_manager: 'Content Manager',
  student: 'Student',
  authenticated: 'Authenticated',
}

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [posts, setPosts] = useState([])
  const [roles, setRoles] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, postsRes, rolesRes, enrollRes] = await Promise.all([
          api.get('/users?populate=role'),
          api.get('/courses?populate=instructor'),
          api.get('/blog-posts?populate=author'),
          api.get('/users-permissions/roles'),
          api.get('/enrollments'),
        ])
        setUsers(usersRes.data)
        setCourses(coursesRes.data.data)
        setPosts(postsRes.data.data)
        setRoles(rolesRes.data.roles || [])
        setEnrollments(enrollRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchData()
  }, [user])

  const handleLogout = () => { logout(); router.push('/') }

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await api.put('/users/' + userId, { role: newRoleId })
      const res = await api.get('/users?populate=role')
      setUsers(res.data)
    } catch (err) {
      alert('Failed to change role')
    }
  }

  if (loading || fetching) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>
  )

  const stats = {
    users: users.length,
    courses: courses.length,
    enrollments: enrollments.length,
    posts: posts.length,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap size={18} />
            </span>
            <span className="font-semibold tracking-tight">First Step</span>
            <span className="hidden border-l border-border pl-3 text-xs text-muted-foreground sm:inline">Admin</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(label)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${activeTab === label ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-card text-muted-foreground">
                <UserRound size={15} />
              </span>
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground sm:flex transition"
            >
              <LogOut size={15} /> Logout
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-md p-2 text-muted-foreground hover:bg-card md:hidden"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
            {tabs.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setActiveTab(label); setMobileOpen(false) }}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${activeTab === label ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground'}`}
              >
                <Icon size={16} />{label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary mb-1">Workspace overview</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, {user?.username}</h1>
              <p className="text-sm leading-6 text-muted-foreground mt-1">Here is what is happening across First Step today.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Total Users', value: stats.users, icon: Users },
                { label: 'Total Courses', value: stats.courses, icon: BookOpen },
                { label: 'Total Enrollments', value: stats.enrollments, icon: GraduationCap },
                { label: 'Total Blog Posts', value: stats.posts, icon: FileText },
              ].map(({ label, value, icon: Icon }) => (
                <article key={label} className="flex min-h-32 flex-col justify-between rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'Users' && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary mb-1">People</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">User Management</h1>
              <p className="text-sm leading-6 text-muted-foreground mt-1">Manage access and roles across your platform.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b border-border bg-background/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Current Role</th>
                      <th className="px-5 py-3 font-medium">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-background/40 transition">
                        <td className="px-5 py-4">
                          <p className="font-medium">{u.username}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[u.role?.type] || ''}`}>
                            {roleLabels[u.role?.type] || u.role?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative w-44">
                            <select
                              value={u.role?.id || ''}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="h-9 w-full appearance-none rounded-md border border-border bg-background px-3 pr-8 text-xs text-foreground outline-none focus:border-primary"
                            >
                              {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'Courses' && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary mb-1">Curriculum</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Course Catalog</h1>
              <p className="text-sm leading-6 text-muted-foreground mt-1">{courses.length} courses on the platform.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead className="border-b border-border bg-background/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Title</th>
                      <th className="px-5 py-3 font-medium">Instructor</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((course) => (
                      <tr key={course.documentId} className="hover:bg-background/40">
                        <td className="px-5 py-4 font-medium">{course.title}</td>
                        <td className="px-5 py-4 text-muted-foreground">{course.instructor?.username || 'Unknown'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${course.published ? 'bg-green-500/12 text-green-300' : 'bg-border text-muted-foreground'}`}>
                            {course.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'Blog' && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary mb-1">Publishing</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Blog Posts</h1>
              <p className="text-sm leading-6 text-muted-foreground mt-1">{posts.length} posts on the platform.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-border bg-background/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Title</th>
                      <th className="px-5 py-3 font-medium">Author</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.map((post) => (
                      <tr key={post.documentId} className="hover:bg-background/40">
                        <td className="max-w-[300px] px-5 py-4 font-medium truncate">{post.title}</td>
                        <td className="px-5 py-4 text-muted-foreground">{post.author?.username || 'Unknown'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${post.post_status === 'published' ? 'bg-green-500/12 text-green-300' : 'bg-border text-muted-foreground'}`}>
                            {post.post_status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}