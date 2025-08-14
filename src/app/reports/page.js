"use client"

import { useState } from "react"
import { Calendar, Download, FileText, TrendingUp, Users, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for reports
const mockReportData = {
  overview: {
    totalStudents: 15,
    activeStudents: 12,
    totalSessions: 234,
    averageScore: 78.5,
  },
  studentPerformance: [
    { id: "STU001", name: "Emma Johnson", sessions: 45, avgScore: 92, improvement: "+8%" },
    { id: "STU002", name: "Michael Chen", sessions: 32, avgScore: 78, improvement: "+5%" },
    { id: "STU003", name: "Sarah Williams", sessions: 18, avgScore: 65, improvement: "-2%" },
  ],
  shapeAnalytics: {
    circle: { totalInteractions: 156, avgScore: 85, difficulty: "Easy" },
    square: { totalInteractions: 142, avgScore: 79, difficulty: "Medium" },
    triangle: { totalInteractions: 138, avgScore: 73, difficulty: "Medium" },
    rectangle: { totalInteractions: 125, avgScore: 68, difficulty: "Hard" },
  },
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedStudent, setSelectedStudent] = useState("all")

  const handleExportReport = (format) => {
    // Mock export functionality
    console.log(`Exporting report in ${format} format for ${selectedPeriod} period`)
    alert(`Report exported successfully in ${format.toUpperCase()} format!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Progress Reports</h1>
          <p className="text-slate-600 text-lg">Comprehensive analytics and student performance reports</p>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="STU001">Emma Johnson</SelectItem>
              <SelectItem value="STU002">Michael Chen</SelectItem>
              <SelectItem value="STU003">Sarah Williams</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button onClick={() => handleExportReport("pdf")} variant="outline" className="bg-white">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => handleExportReport("csv")} variant="outline" className="bg-white">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{mockReportData.overview.totalStudents}</div>
              <p className="text-xs text-slate-500">Enrolled in program</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Students</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{mockReportData.overview.activeStudents}</div>
              <p className="text-xs text-slate-500">Currently learning</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{mockReportData.overview.totalSessions}</div>
              <p className="text-xs text-slate-500">Learning interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
              <Calendar className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{mockReportData.overview.averageScore}%</div>
              <p className="text-xs text-slate-500">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Performance Table */}
        <Card className="bg-white shadow-sm border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Student Performance Summary</CardTitle>
            <CardDescription>Individual student progress and improvement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Sessions</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Avg Score</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReportData.studentPerformance.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-800">{student.name}</div>
                          <div className="text-sm text-slate-500">{student.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{student.sessions}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {student.avgScore}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            student.improvement.startsWith("+")
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {student.improvement}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Shape Analytics */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Shape Learning Analytics</CardTitle>
            <CardDescription>Performance breakdown by geometric shapes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(mockReportData.shapeAnalytics).map(([shape, data]) => (
                <div key={shape} className="text-center p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 capitalize mb-2">{shape}</h3>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{data.totalInteractions}</div>
                    <div className="text-xs text-slate-500">Total Interactions</div>
                    <div className="text-lg font-semibold text-green-600">{data.avgScore}%</div>
                    <div className="text-xs text-slate-500">Average Score</div>
                    <Badge
                      className={
                        data.difficulty === "Easy"
                          ? "bg-green-100 text-green-800"
                          : data.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {data.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
