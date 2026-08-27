'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import api from '@/lib/api'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get(
          '/blog-posts?filters[post_status][$eq]=published&populate=author&sort=createdAt:desc'
        )
        setPosts(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span className="text-base">First Step</span>
        </Link>
        <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
          The learning journal
        </span>
      </nav>

      {/* Header */}
      <header className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12">
        <div className="max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <span className="h-px w-8 bg-primary" />
            From First Step
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-7xl">
            From the Journal
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-7 text-muted-foreground sm:text-xl">
            Ideas, guides, and stories to keep you learning
          </p>
        </div>
      </header>

      {/* Posts */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-8 lg:px-12">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No blog posts yet.</div>
        ) : (
          <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-16 lg:gap-x-10">
            {posts.map((post) => (
              <article key={post.documentId} className="group">

                {/* Cover Image */}
                {post.cover_image_url && (
                  <Link href={'/blog/' + post.documentId} className="block overflow-hidden rounded-2xl bg-card">
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    </div>
                  </Link>
                )}

                <div className="pt-6">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    }).toUpperCase()}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
                    <Link href={'/blog/' + post.documentId} className="transition-colors hover:text-primary">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-4 text-sm text-muted-foreground">
                    By {post.author?.username || 'First Step'}
                  </p>
                  <Link
                    href={'/blog/' + post.documentId}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                  >
                    Read More <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}