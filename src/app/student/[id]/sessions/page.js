"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function StudentSessionsPage() {
  const params = useParams()
  const studentId = params.id
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSessionData()
  }, [studentId])

  const fetchSessionData = async () => {
    try {
      setLoading(true)

      // Fetch student info
      const studentResponse = await fetch(`/api/students/${studentId}`)
      if (!studentResponse.ok) {
        throw new Error("Student not found")
      }
      const studentData = await studentResponse.json()

      // Fetch learning sessions
      const sessionsResponse = await fetch(`/api/sessions?studentId=${studentId}`)
      const sessionsData = await sessionsResponse.json()

      // Fetch assessment sessions for each learning session
      const sessionsWithAssessments = await Promise.all(
        sessionsData.data.map(async (session) => {
          try {
            const assessmentResponse = await fetch(
              `/api/assessment/sessions?studentId=${studentId}&date=${session.date.split("T")[0]}`,
            )
            const assessmentData = await assessmentResponse.json()

            return {
              ...session,
              questions: assessmentData.success ? assessmentData.data : [],
              score: session.accuracy,
              duration: "N/A", // Duration not tracked in Python script
            }
          } catch (err) {
            console.error("Error fetching assessments:", err)
            return {
              ...session,
              questions: [],
              score: 0,
              duration: "N/A",
            }
          }
        }),
      )

      setSessionData({
        name: `${studentData.student.first_name} ${studentData.student.last_name}`,
        sessions: sessionsWithAssessments,
      })
      setError(null)
    } catch (err) {
      console.error("Error fetching session data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-slate-800 mb-2">Sessions not found</div>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/student/${studentId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student Details
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Learning Sessions</h1>
          <p className="text-slate-600 text-lg">{sessionData.name} - Detailed session history</p>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {sessionData.sessions.map((session) => (
            <Card key={session.id} className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-800 capitalize">
                      {session.shape} Learning Session
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(session.date).toLocaleTimeString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">{session.score}% Score</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Volume2 className="h-4 w-4" />
                    <span>AI Voice Interaction Session</span>
                  </div>

                  {/* AI Explanation */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">AI Explanation Given:</h3>
                    <p className="text-blue-700">{session.explanation}</p>
                  </div>

                  {/* Questions and Answers */}
                  {session.questions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800">Comprehension Questions & Responses</h3>
                      {session.questions.map((qa, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-800 mb-2">
                                Question {index + 1}: {qa.question}
                              </h4>
                            </div>
                            {qa.assessment === "Correct" ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 mt-1" />
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded">
                              <div className="text-sm font-medium text-blue-800 mb-1">Student Answer:</div>
                              <div className="text-blue-700">"{qa.answer}"</div>
                            </div>

                            <div className="bg-amber-50 p-3 rounded">
                              <div className="text-sm font-medium text-amber-800 mb-1">AI Assessment:</div>
                              <div className="text-amber-700">{qa.assessment}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Session Summary */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Session Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Total Questions:</span>
                        <span className="font-medium text-slate-800 ml-2">{session.questions.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Correct Answers:</span>
                        <span className="font-medium text-green-600 ml-2">
                          {session.questions.filter((q) => q.assessment === "Correct").length}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Incorrect Answers:</span>
                        <span className="font-medium text-red-600 ml-2">
                          {session.questions.filter((q) => q.assessment !== "Correct").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sessionData.sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">No sessions found for this student.</div>
            <p className="text-slate-500 mt-2">
              Sessions will appear here after the student interacts with the tactile board.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
