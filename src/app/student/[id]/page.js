"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, TrendingUp, BookOpen, Award, Clock, Play, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const getStatusColor = (status) => {
  switch (status) {
    case "excellent":
      return "bg-green-100 text-green-800"
    case "active":
      return "bg-blue-100 text-blue-800"
    case "needs_attention":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getShapeIcon = (shape) => {
  const icons = {
    circle: "●",
    square: "■",
    triangle: "▲",
    rectangle: "▬",
  }
  return icons[shape] || "●"
}

export default function StudentDetail() {
  const params = useParams()
  const [student, setStudent] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assessmentStatus, setAssessmentStatus] = useState({
    assessedToday: false,
    currentSession: null,
    loading: false,
  })

  useEffect(() => {
    if (params.id) {
      fetchStudentData()
      checkAssessmentStatus()
    }
  }, [params.id])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students/${params.id}`)
      if (!response.ok) {
        throw new Error("Student not found")
      }
      const data = await response.json()
      setStudent(data.student)
      setSessions(data.sessions || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching student:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkAssessmentStatus = async () => {
    try {
      const response = await fetch(`/api/assessment/status/${params.id}`)
      const data = await response.json()
      setAssessmentStatus((prev) => ({
        ...prev,
        assessedToday: data.assessedToday,
        currentSession: data.currentSession,
      }))
    } catch (error) {
      console.error("Error checking assessment status:", error)
    }
  }

  const startAssessment = async () => {
    setAssessmentStatus((prev) => ({ ...prev, loading: true }))

    try {
      const response = await fetch("/api/assessment/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId: params.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setAssessmentStatus((prev) => ({
          ...prev,
          currentSession: {
            id: data.sessionId,
            startTime: data.startTime,
            status: data.status,
          },
          loading: false,
        }))
        alert("Assessment session started! The tactile board is now ready for this student.")
      } else {
        alert(data.error || "Failed to start assessment")
        setAssessmentStatus((prev) => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error("Error starting assessment:", error)
      alert("Failed to start assessment session")
      setAssessmentStatus((prev) => ({ ...prev, loading: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Student Not Found</h1>
          <p className="text-slate-600 mb-4">{error || `The student with ID ${params.id} could not be found.`}</p>
          <Button aschild="true">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" aschild="true" className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-slate-600 text-lg">
                Student ID: {student.student_id} • Registered: {new Date(student.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(student.status || "active")} size="lg">
                {(student.status || "active").replace("_", " ").toUpperCase()}
              </Badge>
              {assessmentStatus.currentSession ? (
                <Badge className="bg-green-100 text-green-800" size="lg">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Assessment Active
                </Badge>
              ) : assessmentStatus.assessedToday ? (
                <Badge className="bg-gray-100 text-gray-800" size="lg">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Assessed Today
                </Badge>
              ) : (
                <Button
                  onClick={startAssessment}
                  disabled={assessmentStatus.loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {assessmentStatus.loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start Assessment
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{student.total_sessions || 0}</div>
              <p className="text-xs text-slate-500">Learning interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{student.average_score || 0}%</div>
              <p className="text-xs text-slate-500">Overall performance</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Last Session</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {student.last_session_date
                  ? new Date(student.last_session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "None"}
              </div>
              <p className="text-xs text-slate-500">Most recent activity</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Contact</CardTitle>
              <Award className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-slate-800">{student.email || "No email"}</div>
              <p className="text-xs text-slate-500">{student.phone || "No phone"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Student Information</CardTitle>
              <CardDescription>Personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                  <div className="text-slate-800">
                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : "Not provided"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Emergency Contact</label>
                  <div className="text-slate-800">{student.emergency_contact || "Not provided"}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Medical Notes</label>
                <div className="text-slate-800">{student.medical_notes || "None"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Learning Goals</label>
                <div className="text-slate-800">{student.learning_goals || "Not specified"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">Recent Sessions</CardTitle>
                  <CardDescription>Latest learning interactions</CardDescription>
                </div>
                <Button aschild="true" variant="outline" size="sm">
                  <Link href={`/student/${student.student_id}/sessions`}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">{getShapeIcon(session.shape_type)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 capitalize">{session.shape_type || "Unknown"}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.session_date).toLocaleDateString()}
                          <Clock className="h-3 w-3 ml-1" />
                          {session.duration || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-800">{session.assessment_score || 0}%</div>
                      <div className="text-xs text-slate-500">Score</div>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-4 text-slate-500">No sessions recorded yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button aschild="true" size="lg">
            <Link href={`/student/${student.student_id}/sessions`}>View All Sessions</Link>
          </Button>
          <Button variant="outline" size="lg">
            Generate Report
          </Button>
          {assessmentStatus.currentSession && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                Assessment started at {new Date(assessmentStatus.currentSession.startTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
