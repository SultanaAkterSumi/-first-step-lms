'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import api from '@/lib/api'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get('/blog-posts/' + params.id + '?populate=author')
        setPost(res.data.data)
      } catch (err) {
        console.error(err)
        router.push('/blog')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
      Loading...
    </div>
  )

  if (!post) return null

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-7 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          First Step
        </Link>
        <button
          onClick={() => router.push('/blog')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-4" />
          Back to Blog
        </button>
      </nav>

      {/* Post */}
      <article className="mx-auto max-w-4xl px-6 pb-20 sm:px-8">

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="mb-10 overflow-hidden rounded-2xl aspect-[2/1]">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl mb-4">
            {post.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            By <span className="text-foreground font-medium">{post.author?.username || 'First Step'}</span>
          </p>
        </div>

        {/* Body */}
        <div className="border-t border-border pt-8">
         <div className="max-w-none text-foreground leading-9 whitespace-pre-wrap text-xl">
            {post.body}
          </div>
        </div>
      </article>
    </main>
  )
}