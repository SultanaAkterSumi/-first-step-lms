'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Check, CheckCircle2, ChevronDown, FileQuestion, Menu, X } from 'lucide-react'

export default function LearnPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const enrollmentId = params.enrollmentId

  const [enrollment, setEnrollment] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [completedIds, setCompletedIds] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [quizResults, setQuizResults] = useState([])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enrollRes = await api.get('/enrollments/my-courses')
        const myEnrollment = enrollRes.data.data.find(e => e.documentId === enrollmentId)
        if (!myEnrollment) { router.push('/dashboard/student'); return }
        setEnrollment(myEnrollment)
        const courseId = myEnrollment.course?.documentId
        const completedLessonIds = (myEnrollment.completed_lessons || []).map(l => l.documentId)
        setCompletedIds(completedLessonIds)
        const lessonsRes = await api.get('/lessons?filters[course][documentId][$eq]=' + courseId + '&sort=order:asc')
        const fetchedLessons = lessonsRes.data.data
        setLessons(fetchedLessons)
        if (fetchedLessons.length > 0) setSelectedLesson(fetchedLessons[0])

const quizzesRes = await api.get(
  '/quizzes?filters[course][documentId][$eq]=' + courseId
)
setQuizzes(quizzesRes.data.data)

// Quiz results 
const resultsRes = await api.get('/quiz-results?populate=quiz')
setQuizResults(resultsRes.data.data)

      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchData()
  }, [user, enrollmentId])

  const handleMarkComplete = async () => {
    if (!selectedLesson || !enrollment) return
    setMarking(true)
    try {
      await api.put('/enrollments/' + enrollmentId + '/complete-lesson', { lessonId: selectedLesson.documentId })
      setCompletedIds(prev => [...prev, selectedLesson.documentId])
      const currentIndex = lessons.findIndex(l => l.documentId === selectedLesson.documentId)
      if (currentIndex < lessons.length - 1) setSelectedLesson(lessons[currentIndex + 1])
    } catch (err) {
      console.error(err)
    } finally {
      setMarking(false)
    }
  }

  const progress = lessons.length > 0 ? Math.round((completedIds.length / lessons.length) * 100) : 0
  const isCompleted = selectedLesson ? completedIds.includes(selectedLesson.documentId) : false

  if (loading || fetching) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
        <div className="flex w-full items-center gap-4">
          <button type="button" onClick={() => setSidebarOpen(true)} className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-card md:hidden">
            <Menu className="size-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">F</span>
            <span className="text-sm font-semibold tracking-tight">First Step</span>
          </Link>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <span className="hidden text-sm text-muted-foreground sm:block truncate max-w-xs">{enrollment?.course?.title}</span>
          <button type="button" onClick={() => router.push('/dashboard/student')} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground transition">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to courses</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-xl">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-16 left-0 z-30 w-72 shrink-0 border-r border-border bg-card transition-transform md:sticky md:top-16 md:block md:h-screen md:translate-x-0`}>
          <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
            <div className="mb-7 flex items-start justify-between px-2">
              <div>
                <p className="mb-2 font-mono text-xs font-medium uppercase tracking-widest text-primary">Course</p>
                <h1 className="text-lg font-semibold leading-snug">{enrollment?.course?.title}</h1>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {completedIds.length} of {lessons.length} lessons complete
                </div>
              </div>
              <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-muted-foreground md:hidden">
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: progress + '%' }} />
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between px-2">
                <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">Lessons</h2>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </div>
              <nav className="space-y-1">
                {lessons.map((lesson) => {
                  const isActive = selectedLesson?.documentId === lesson.documentId
                  const isDone = completedIds.includes(lesson.documentId)
                  return (
                    <button key={lesson.documentId} type="button"
                      onClick={() => { setSelectedLesson(lesson); setSelectedQuiz(null); setSidebarOpen(false) }}
                      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-3 text-left transition ${isActive ? 'bg-primary/10 text-foreground ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
                    >
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs ${isDone ? 'bg-primary/15 text-primary' : isActive ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>
                        {isDone ? <Check className="size-3.5" /> : lesson.order}
                      </span>
                      <span className="block truncate text-sm font-medium">{lesson.title}</span>
                    </button>
                  )
                })}
              </nav>
            </section>

            {quizzes.length > 0 && (
              <section className="mt-8">
                <div className="mb-3 flex items-center justify-between px-2">
                  <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">Quizzes</h2>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </div>
                <nav className="space-y-1">
                  {quizzes.map((quiz) => {
  const isActive = selectedQuiz?.documentId === quiz.documentId
  const quizResult = quizResults.find(
    r => r.quiz?.documentId === quiz.documentId
  )
  return (
    <button
      key={quiz.documentId}
      type="button"
      onClick={() => { setSelectedQuiz(quiz); setSelectedLesson(null); setSidebarOpen(false) }}
      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-3 text-left transition ${isActive ? 'bg-primary/10 text-foreground ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-border text-muted-foreground">
        <FileQuestion className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{quiz.title}</span>
        {quizResult && (
          <span className="block text-xs text-primary mt-0.5">
            Last score: {quizResult.score}%
          </span>
        )}
      </span>
    </button>
  )
})}
                </nav>
              </section>
            )}
          </div>
        </aside>

        {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-background/70 md:hidden" />}

        <article className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-16 lg:py-12">
          <div className="mx-auto max-w-3xl">
            {selectedLesson && (
              <div>
                <div className="mb-8">
                  <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-primary">
                    Lesson {selectedLesson.order} / {lessons.length}
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{selectedLesson.title}</h2>
                </div>

                {selectedLesson.video_url && (
                  <a
                    href={selectedLesson.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Open Video
                  </a>
                )}

                {selectedLesson.content && (
                  <div className="mt-8 border-t border-border pt-8">
                    <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">Notes</p>
                    <div className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">{selectedLesson.content}</div>
                  </div>
                )}

                <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {isCompleted ? 'You have completed this lesson!' : 'Mark this lesson as complete when you are done.'}
                  </p>
                  <button type="button" onClick={handleMarkComplete} disabled={isCompleted || marking}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${isCompleted ? 'bg-primary/15 text-primary ring-1 ring-primary/30 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                  >
                    {isCompleted ? <CheckCircle2 className="size-4" /> : <Check className="size-4" />}
                    {marking ? 'Saving...' : isCompleted ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            )}

            {selectedQuiz && (
              <div className="text-center py-20">
                <FileQuestion className="size-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">{selectedQuiz.title}</h2>
                <p className="text-muted-foreground mb-6">Ready to test your knowledge?</p>
                <button type="button"
                  onClick={() => router.push('/dashboard/student/quiz/' + selectedQuiz.documentId)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
                >
                  Start Quiz
                </button>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}