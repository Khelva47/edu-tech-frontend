"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock session data
const mockSessionData = {
  STU001: {
    name: "Emma Johnson",
    sessions: [
      {
        id: "SES001",
        date: "2024-01-20",
        shape: "circle",
        duration: "12 minutes",
        score: 95,
        questions: [
          {
            question: "What shape is this?",
            studentAnswer: "Circle",
            correctAnswer: "Circle",
            isCorrect: true,
            aiAssessment: "Perfect identification",
          },
          {
            question: "How many sides does this shape have?",
            studentAnswer: "Zero sides, it's round",
            correctAnswer: "Zero sides or no sides",
            isCorrect: true,
            aiAssessment: "Excellent understanding of circular properties",
          },
        ],
      },
      {
        id: "SES002",
        date: "2024-01-19",
        shape: "square",
        duration: "15 minutes",
        score: 88,
        questions: [
          {
            question: "What shape is this?",
            studentAnswer: "Square",
            correctAnswer: "Square",
            isCorrect: true,
            aiAssessment: "Correct identification",
          },
          {
            question: "How many corners does this shape have?",
            studentAnswer: "Four corners",
            correctAnswer: "Four corners",
            isCorrect: true,
            aiAssessment: "Good understanding",
          },
          {
            question: "Are all sides equal?",
            studentAnswer: "Yes, they are the same",
            correctAnswer: "Yes, all sides are equal",
            isCorrect: true,
            aiAssessment: "Demonstrates understanding of square properties",
          },
          {
            question: "What makes this different from a rectangle?",
            studentAnswer: "It's smaller",
            correctAnswer: "All sides are equal length",
            isCorrect: false,
            aiAssessment: "Needs clarification on square vs rectangle differences",
          },
        ],
      },
    ],
  },
}

export default function StudentSessionsPage() {
  const params = useParams()
  const studentId = params.id
  const [sessionData, setSessionData] = useState(null)

  useEffect(() => {
    // Mock API call
    const data = mockSessionData[studentId]
    setSessionData(data)
  }, [studentId])

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-slate-800 mb-2">Sessions not found</div>
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
                        {session.duration}
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

                  {/* Questions and Answers */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Questions & Responses</h3>
                    {session.questions.map((qa, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800 mb-2">
                              Question {index + 1}: {qa.question}
                            </h4>
                          </div>
                          {qa.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-1" />
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-sm font-medium text-blue-800 mb-1">Student Answer:</div>
                            <div className="text-blue-700">"{qa.studentAnswer}"</div>
                          </div>

                          <div className="bg-green-50 p-3 rounded">
                            <div className="text-sm font-medium text-green-800 mb-1">Expected Answer:</div>
                            <div className="text-green-700">"{qa.correctAnswer}"</div>
                          </div>

                          <div className="bg-amber-50 p-3 rounded">
                            <div className="text-sm font-medium text-amber-800 mb-1">AI Assessment:</div>
                            <div className="text-amber-700">{qa.aiAssessment}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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
                          {session.questions.filter((q) => q.isCorrect).length}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Incorrect Answers:</span>
                        <span className="font-medium text-red-600 ml-2">
                          {session.questions.filter((q) => !q.isCorrect).length}
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
          </div>
        )}
      </div>
    </div>
  )
}
