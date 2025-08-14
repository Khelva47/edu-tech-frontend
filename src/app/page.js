"use client"

import { useState, useEffect } from "react"
import { Search, Users, TrendingUp, BookOpen, Eye, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

const getStatusText = (status) => {
  switch (status) {
    case "excellent":
      return "Excellent Progress"
    case "active":
      return "Active Learning"
    case "needs_attention":
      return "Needs Attention"
    default:
      return "Unknown"
  }
}

export default function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState([])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/students")
      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }
      const data = await response.json()
      setStudents(data.students || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching students:", err)
      setError("Failed to load students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  const totalStudents = students.length
  const activeToday = students.filter((s) => {
    const today = new Date().toISOString().split("T")[0]
    return s.last_session_date === today
  }).length
  const averageScore =
    students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.average_score || 0), 0) / students.length) : 0
  const totalSessions = students.reduce((acc, s) => acc + (s.total_sessions || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStudents}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Student Progress Dashboard</h1>
            <p className="text-slate-600 text-lg">Track learning progress for tactile board interactions</p>
          </div>
          <Button asChild className="mt-2 bg-blue-600 hover:bg-blue-700">
            <Link href="/create-student">
              <Plus className="h-4 w-4 mr-2" />
              Create Student
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalStudents}</div>
              <p className="text-xs text-slate-500">Registered learners</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Today</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{activeToday}</div>
              <p className="text-xs text-slate-500">Learning sessions today</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{averageScore}%</div>
              <p className="text-xs text-slate-500">Overall performance</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalSessions}</div>
              <p className="text-xs text-slate-500">Learning interactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search students by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {student.first_name} {student.last_name}
                  </CardTitle>
                  <Badge className={getStatusColor(student.status || "active")}>
                    {getStatusText(student.status || "active")}
                  </Badge>
                </div>
                <CardDescription className="text-slate-600">
                  ID: {student.student_id} • Registered: {new Date(student.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{student.total_sessions || 0}</div>
                      <div className="text-xs text-slate-500">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{student.average_score || 0}%</div>
                      <div className="text-xs text-slate-500">Avg Score</div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">Contact</h4>
                    <div className="text-xs text-slate-600">
                      <div>Email: {student.email || "Not provided"}</div>
                      <div>Phone: {student.phone || "Not provided"}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/student/${student.student_id}`}>View Details</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/student/${student.student_id}/sessions`}>Sessions</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">
              {students.length === 0 ? "No students registered yet." : "No students found matching your search."}
            </div>
            {students.length === 0 && (
              <Button asChild className="mt-4">
                <Link href="/create-student">Create First Student</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
