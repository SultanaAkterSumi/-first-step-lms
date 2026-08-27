'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import {
  ArrowLeft, BookOpen, ChevronRight, ChevronDown,
  FileQuestion, Pencil, Plus, Trash2, Users, X,
} from 'lucide-react'

export default function CourseManagePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId

  const [tab, setTab] = useState('Lessons')
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [students, setStudents] = useState([])
  const [fetching, setFetching] = useState(true)

  // Add/Edit states
  const [addingLesson, setAddingLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [lessonForm, setLessonForm] = useState({ title: '', video_url: '', content: '', order: 1 })

  const [addingQuiz, setAddingQuiz] = useState(false)
  const [quizForm, setQuizForm] = useState({ title: '' })
  const [expandedQuiz, setExpandedQuiz] = useState(null)
  const [questions, setQuestions] = useState({})
  const [addingQuestion, setAddingQuestion] = useState(null)
  const [questionForm, setQuestionForm] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a'
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Course data
        const courseRes = await api.get('/courses/' + courseId)
        setCourse(courseRes.data.data)

        // Lessons
        const lessonsRes = await api.get(
          '/lessons?filters[course][documentId][$eq]=' + courseId + '&sort=order:asc'
        )
        setLessons(lessonsRes.data.data)

        // Quizzes
        const quizzesRes = await api.get(
          '/quizzes?filters[course][documentId][$eq]=' + courseId
        )
        setQuizzes(quizzesRes.data.data)

        // Students (enrollments)
        const enrollRes = await api.get('/enrollments/course/' + courseId + '/students')
setStudents(enrollRes.data.data)

      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchData()
  }, [user, courseId])

  // Lesson CRUD
  const handleAddLesson = async () => {
    try {
      const res = await api.post('/lessons', {
        data: {
          ...lessonForm,
          order: lessons.length + 1,
          course: courseId,
        }
      })
      setLessons([...lessons, res.data.data])
      setAddingLesson(false)
      setLessonForm({ title: '', video_url: '', content: '', order: 1 })
    } catch (err) {
      alert('Failed to add lesson')
    }
  }

  const handleEditLesson = async () => {
    try {
      const res = await api.put('/lessons/' + editingLesson.documentId, {
        data: lessonForm
      })
      setLessons(lessons.map(l => l.documentId === editingLesson.documentId ? res.data.data : l))
      setEditingLesson(null)
      setLessonForm({ title: '', video_url: '', content: '', order: 1 })
    } catch (err) {
      alert('Failed to update lesson')
    }
  }

  const handleDeleteLesson = async (documentId) => {
    if (!confirm('Delete this lesson?')) return
    try {
      await api.delete('/lessons/' + documentId)
      setLessons(lessons.filter(l => l.documentId !== documentId))
    } catch (err) {
      alert('Failed to delete lesson')
    }
  }

  // Quiz CRUD
  const handleAddQuiz = async () => {
    try {
      const res = await api.post('/quizzes', {
        data: { title: quizForm.title, course: courseId }
      })
      setQuizzes([...quizzes, res.data.data])
      setAddingQuiz(false)
      setQuizForm({ title: '' })
    } catch (err) {
      alert('Failed to add quiz')
    }
  }

  const handleDeleteQuiz = async (documentId) => {
    if (!confirm('Delete this quiz?')) return
    try {
      await api.delete('/quizzes/' + documentId)
      setQuizzes(quizzes.filter(q => q.documentId !== documentId))
    } catch (err) {
      alert('Failed to delete quiz')
    }
  }

  // Questions
  const fetchQuestions = async (quizDocumentId) => {
    try {
      const res = await api.get(
        '/quiz-questions?filters[quiz][documentId][$eq]=' + quizDocumentId
      )
      setQuestions(prev => ({ ...prev, [quizDocumentId]: res.data.data }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleExpandQuiz = (quizDocumentId) => {
    if (expandedQuiz === quizDocumentId) {
      setExpandedQuiz(null)
    } else {
      setExpandedQuiz(quizDocumentId)
      fetchQuestions(quizDocumentId)
    }
  }

  const handleAddQuestion = async (quizDocumentId) => {
    try {
      const res = await api.post('/quiz-questions', {
        data: { ...questionForm, quiz: quizDocumentId }
      })
      setQuestions(prev => ({
        ...prev,
        [quizDocumentId]: [...(prev[quizDocumentId] || []), res.data.data]
      }))
      setAddingQuestion(null)
      setQuestionForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' })
    } catch (err) {
      alert('Failed to add question')
    }
  }

  const handleDeleteQuestion = async (quizDocumentId, questionDocumentId) => {
    if (!confirm('Delete this question?')) return
    try {
      await api.delete('/quiz-questions/' + questionDocumentId)
      setQuestions(prev => ({
        ...prev,
        [quizDocumentId]: prev[quizDocumentId].filter(q => q.documentId !== questionDocumentId)
      }))
    } catch (err) {
      alert('Failed to delete question')
    }
  }

  if (loading || fetching) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>
  )

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">First Step</span>
          </Link>
          <div className="absolute left-1/2 hidden -translate-x-1/2 sm:flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-sm font-medium text-muted-foreground">{course?.title}</span>
          </div>
          <button
            onClick={() => router.push('/dashboard/instructor')}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to courses</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Instructor workspace</span>
              <ChevronRight className="size-3" />
              <span className="text-foreground">{course?.title}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Manage your course</h1>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{students.length} students</p>
              <p className="text-xs text-muted-foreground">Actively enrolled</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mb-8 flex gap-6 border-b border-border">
          {['Lessons', 'Quizzes', 'Students'].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition ${tab === item ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {item === 'Lessons' && <BookOpen className="size-4" />}
              {item === 'Quizzes' && <FileQuestion className="size-4" />}
              {item === 'Students' && <Users className="size-4" />}
              {item}
              {tab === item && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
            </button>
          ))}
        </nav>

        {/* Lessons Tab */}
        {tab === 'Lessons' && (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-primary">Course content</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your lessons</h2>
              </div>
              <button
                onClick={() => { setAddingLesson(true); setEditingLesson(null) }}
                className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                <Plus className="size-4" /> Add lesson
              </button>
            </div>

            {/* Add/Edit Form */}
            {(addingLesson || editingLesson) && (
              <div className="rounded-xl border border-primary/35 bg-card p-5">
                <div className="mb-5 flex items-start justify-between">
                  <p className="text-sm font-semibold">{editingLesson ? 'Edit lesson' : 'Create a new lesson'}</p>
                  <button onClick={() => { setAddingLesson(false); setEditingLesson(null) }}>
                    <X className="size-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    LESSON TITLE
                    <input
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="e.g. Introduction to Next.js"
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground">
                    VIDEO URL
                    <input
                      value={lessonForm.video_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground md:col-span-2">
                    LESSON CONTENT
                    <textarea
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      placeholder="Write lesson notes..."
                      rows={3}
                      className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </label>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => { setAddingLesson(false); setEditingLesson(null) }}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingLesson ? handleEditLesson : handleAddLesson}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    {editingLesson ? 'Update lesson' : 'Save lesson'}
                  </button>
                </div>
              </div>
            )}

            {/* Lessons List */}
            <div className="overflow-hidden rounded-xl border border-border bg-card/60">
              {lessons.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No lessons yet. Add your first lesson!</p>
              ) : lessons.map((lesson, index) => (
                <div key={lesson.documentId} className="group flex items-center gap-4 border-b border-border px-4 py-4 last:border-0 sm:px-5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-border font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{lesson.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingLesson(lesson)
                        setLessonForm({
                          title: lesson.title,
                          video_url: lesson.video_url || '',
                          content: lesson.content || '',
                          order: lesson.order || index + 1
                        })
                        setAddingLesson(false)
                      }}
                      className="rounded-md p-2 text-muted-foreground hover:bg-card hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.documentId)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quizzes Tab */}
        {tab === 'Quizzes' && (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-primary">Knowledge checks</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your quizzes</h2>
              </div>
              <button
                onClick={() => setAddingQuiz(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                <Plus className="size-4" /> Add quiz
              </button>
            </div>

            {/* Add Quiz Form */}
            {addingQuiz && (
              <div className="rounded-xl border border-primary/35 bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">Create a new quiz</p>
                  <button onClick={() => setAddingQuiz(false)}>
                    <X className="size-4 text-muted-foreground" />
                  </button>
                </div>
                <input
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ title: e.target.value })}
                  placeholder="Quiz title..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setAddingQuiz(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">Cancel</button>
                  <button onClick={handleAddQuiz} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save quiz</button>
                </div>
              </div>
            )}

            {/* Quizzes List */}
            <div className="space-y-3">
              {quizzes.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No quizzes yet.</p>
              ) : quizzes.map((quiz) => (
                <div key={quiz.documentId} className="overflow-hidden rounded-xl border border-border bg-card/60">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <button
                      onClick={() => handleExpandQuiz(quiz.documentId)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileQuestion className="size-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium">{quiz.title}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {(questions[quiz.documentId] || []).length} questions
                        </span>
                      </span>
                      {expandedQuiz === quiz.documentId ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.documentId)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {expandedQuiz === quiz.documentId && (
                    <div className="border-t border-border px-5 pb-5 pt-3">
                      {(questions[quiz.documentId] || []).map((q, index) => (
                        <div key={q.documentId} className="flex gap-3 border-b border-border py-3 last:border-0">
                          <span className="font-mono text-xs text-primary">0{index + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm">{q.question}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Correct: <span className="text-primary font-medium">{q.correct_answer?.toUpperCase()}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(quiz.documentId, q.documentId)}
                            className="rounded-md p-1.5 text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Question Form */}
                      {addingQuestion === quiz.documentId ? (
                        <div className="mt-4 rounded-lg border border-border bg-background p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add question</p>
                          <input
                            value={questionForm.question}
                            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                            placeholder="Write your question..."
                            className="mb-3 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            {['a', 'b', 'c', 'd'].map((opt) => (
                              <input
                                key={opt}
                                value={questionForm['option_' + opt]}
                                onChange={(e) => setQuestionForm({ ...questionForm, ['option_' + opt]: e.target.value })}
                                placeholder={'Option ' + opt.toUpperCase()}
                                className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                              />
                            ))}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              Correct answer
                              <select
                                value={questionForm.correct_answer}
                                onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                                className="rounded-md border border-border bg-card px-2 py-1.5 text-foreground outline-none"
                              >
                                <option value="a">A</option>
                                <option value="b">B</option>
                                <option value="c">C</option>
                                <option value="d">D</option>
                              </select>
                            </label>
                            <div className="flex gap-2">
                              <button onClick={() => setAddingQuestion(null)} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground">Cancel</button>
                              <button
                                onClick={() => handleAddQuestion(quiz.documentId)}
                                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                              >
                                Save question
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingQuestion(quiz.documentId)}
                          className="mt-3 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Plus className="size-4" /> Add question
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Students Tab */}
        {tab === 'Students' && (
          <section className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Course community</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your students</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
              <table className="w-full min-w-[520px] text-left">
                <thead className="border-b border-border bg-card text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Lessons completed</th>
                    <th className="px-5 py-3 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-sm text-muted-foreground">No students enrolled yet.</td>
                    </tr>
                  ) : students.map((enrollment) => {
                    const totalLessons = lessons.length
                    const completedCount = enrollment.completed_lessons?.length || 0
                    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
                    return (
                      <tr key={enrollment.documentId} className="border-b border-border last:border-0">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium">{enrollment.student?.username || 'Unknown'}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{enrollment.student?.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {completedCount} / {totalLessons}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-border">
                              <div className="h-full rounded-full bg-primary" style={{ width: progress + '%' }} />
                            </div>
                            <span className="text-sm font-medium">{progress}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}