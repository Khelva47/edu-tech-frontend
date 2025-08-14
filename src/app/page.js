import Image from "next/image";"use client"

import { useState, useEffect } from "react"
import { Search, Users, TrendingUp, BookOpen, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data - replace with API calls
const mockStudents = [
  {
    id: "STU001",
    name: "Emma Johnson",
    registrationDate: "2024-01-15",
    status: "excellent",
    totalSessions: 45,
    averageScore: 92,
    lastSession: "2024-01-20",
    shapesProgress: {
      circle: 95,
      square: 88,
      triangle: 90,
      rectangle: 85,
    },
  },
  {
    id: "STU002",
    name: "Michael Chen",
    registrationDate: "2024-01-10",
    status: "active",
    totalSessions: 32,
    averageScore: 78,
    lastSession: "2024-01-19",
    shapesProgress: {
      circle: 82,
      square: 75,
      triangle: 80,
      rectangle: 76,
    },
  },
  {
    id: "STU003",
    name: "Sarah Williams",
    registrationDate: "2024-01-08",
    status: "needs_attention",
    totalSessions: 18,
    averageScore: 65,
    lastSession: "2024-01-18",
    shapesProgress: {
      circle: 70,
      square: 60,
      triangle: 68,
      rectangle: 62,
    },
  },
]

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
  const [students, setStudents] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState(mockStudents)

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  const totalStudents = students.length
  const activeToday = students.filter((s) => s.lastSession === "2024-01-20").length
  const averageScore = Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
  const totalSessions = students.reduce((acc, s) => acc + s.totalSessions, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Student Progress Dashboard</h1>
          <p className="text-slate-600 text-lg">Track learning progress for tactile board interactions</p>
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
                  <CardTitle className="text-lg font-semibold text-slate-800">{student.name}</CardTitle>
                  <Badge className={getStatusColor(student.status)}>{getStatusText(student.status)}</Badge>
                </div>
                <CardDescription className="text-slate-600">
                  ID: {student.id} • Registered: {new Date(student.registrationDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{student.totalSessions}</div>
                      <div className="text-xs text-slate-500">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{student.averageScore}%</div>
                      <div className="text-xs text-slate-500">Avg Score</div>
                    </div>
                  </div>

                  {/* Shape Progress */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">Shape Progress</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Circle:</span>
                        <span className="font-medium">{student.shapesProgress.circle}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Square:</span>
                        <span className="font-medium">{student.shapesProgress.square}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Triangle:</span>
                        <span className="font-medium">{student.shapesProgress.triangle}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rectangle:</span>
                        <span className="font-medium">{student.shapesProgress.rectangle}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/student/${student.id}`}>View Details</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/student/${student.id}/sessions`}>Sessions</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">No students found matching your search.</div>
          </div>
        )}
      </div>
    </div>
  )
}
