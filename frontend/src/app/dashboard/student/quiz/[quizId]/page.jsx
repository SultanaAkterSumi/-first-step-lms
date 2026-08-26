'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, Check, CircleCheck, CircleX, GraduationCap, RotateCcw } from 'lucide-react'

export default function QuizPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const quizId = params.quizId

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRes = await api.get('/quizzes/' + quizId)
        setQuiz(quizRes.data.data)

        const questionsRes = await api.get(
          '/quiz-questions?filters[quiz][documentId][$eq]=' + quizId
        )
        const fetchedQuestions = questionsRes.data.data
        setQuestions(fetchedQuestions)
        setAnswers(Array(fetchedQuestions.length).fill(null))
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchQuiz()
  }, [user, quizId])

  const handleNext = () => {
    const newAnswers = [...answers]
    newAnswers[current] = selected
    setAnswers(newAnswers)

    if (current === questions.length - 1) {
      handleSubmit(newAnswers)
    } else {
      setCurrent(current + 1)
      setSelected(newAnswers[current + 1] ?? null)
    }
  }

  const handleSubmit = async (finalAnswers) => {
    setSubmitting(true)
    try {
      const formattedAnswers = questions.map((q, i) => ({
        questionId: q.documentId,
        selectedOption: finalAnswers[i] || null,
      }))

      const res = await api.post('/quiz-results/submit', {
        quizId,
        answers: formattedAnswers,
      })

      setResult(res.data)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers(Array(questions.length).fill(null))
    setSubmitted(false)
    setResult(null)
  }

  if (loading || fetching) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
      Loading...
    </div>
  )

  // Result Screen
  if (submitted && result) {
    return (
      <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-5" />
              </div>
              <span className="font-mono text-sm font-semibold tracking-[0.18em]">FIRST STEP</span>
            </div>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <RotateCcw className="size-4" /> Retake
            </button>
          </header>

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-8 text-center sm:px-12">
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary">Quiz Complete</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {result.score >= 70 ? 'Nice work. Keep going.' : 'Keep practicing!'}
              </h1>
              <p className="mt-3 text-muted-foreground">
                You scored{' '}
                <span className="font-semibold text-foreground">
                  {result.correct}/{result.total}
                </span>{' '}
                — {result.score}%
              </p>
            </div>

            <div className="divide-y divide-border">
              {questions.map((q, index) => {
                const userAnswer = answers[index]
                const correct = userAnswer === q.correct_answer
                const optionLabels = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d }
                return (
                  <div key={q.documentId} className="flex gap-4 px-6 py-5 sm:px-12">
                    <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${correct ? 'bg-primary/15 text-primary' : 'bg-red-500/15 text-red-400'}`}>
                      {correct ? <CircleCheck className="size-5" /> : <CircleX className="size-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-6">{q.question}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your answer:{' '}
                        <span className={correct ? 'text-primary' : 'text-red-400'}>
                          {userAnswer ? optionLabels[userAnswer] || 'Not answered' : 'Skipped'}
                        </span>
                        {!correct && (
                          <span> · Correct: <span className="text-primary">{optionLabels[q.correct_answer]}</span></span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <button
            onClick={() => router.back()}
            className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <ArrowLeft className="size-4" /> Back to Course
          </button>
        </div>
      </main>
    )
  }

  const question = questions[current]
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0

  const options = question ? [
    { key: 'a', label: 'A', text: question.option_a },
    { key: 'b', label: 'B', text: question.option_b },
    { key: 'c', label: 'C', text: question.option_c },
    { key: 'd', label: 'D', text: question.option_d },
  ] : []

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-[0.18em]">FIRST STEP</span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
        </header>

        {/* Progress */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{quiz?.title}</span>
            <span className="font-mono text-xs text-muted-foreground">
              Question {current + 1} of {questions.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: progress + '%' }}
            />
          </div>
        </div>

        {/* Question */}
        {question && (
          <section className="flex flex-col gap-8">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-primary">
                Choose one answer
              </p>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {question.question}
              </h1>
            </div>

            {/* Options */}
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((option) => {
                const isSelected = selected === option.key
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : option.key)}
                    className={`group flex min-h-20 items-center gap-4 rounded-xl border p-4 text-left transition-all ${isSelected ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_#22c55e]' : 'border-border bg-card hover:border-primary/50'}`}
                  >
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>
                      {option.label}
                    </span>
                    <span className="text-sm font-medium leading-6">{option.text}</span>
                    {isSelected && <Check className="ml-auto size-5 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="flex items-center justify-end border-t border-border pt-6">
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {submitting ? 'Submitting...' : current === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </button>
        </footer>
      </div>
    </main>
  )
}