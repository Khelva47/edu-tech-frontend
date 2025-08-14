import { NextResponse } from "next/server"

// Mock student data - replace with database queries
const getStudentById = (id) => {
  const students = {
    STU001: {
      id: "STU001",
      name: "Emma Johnson",
      registrationDate: "2024-01-15",
      status: "excellent",
      totalSessions: 45,
      averageScore: 92,
      lastSession: "2024-01-20",
      shapesProgress: {
        circle: { progress: 95, sessions: 12, accuracy: 94 },
        square: { progress: 88, sessions: 11, accuracy: 89 },
        triangle: { progress: 90, sessions: 12, accuracy: 91 },
        rectangle: { progress: 85, sessions: 10, accuracy: 87 },
      },
      recentSessions: [
        {
          id: "SES001",
          date: "2024-01-20",
          shape: "circle",
          questionsAsked: 5,
          correctAnswers: 5,
          accuracy: 100,
          duration: "8 minutes",
        },
      ],
    },
  }
  return students[id] || null
}

export async function GET(request, { params }) {
  try {
    const student = getStudentById(params.id)

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: student,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch student" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const student = getStudentById(params.id)

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    // Update student data (mock implementation)
    const updatedStudent = { ...student, ...body }

    return NextResponse.json({
      success: true,
      data: updatedStudent,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update student" }, { status: 500 })
  }
}
