import { NextResponse } from "next/server"

// Mock session data - replace with database queries
const mockSessions = [
  {
    id: "SES001",
    studentId: "STU001",
    date: "2024-01-20T10:30:00Z",
    shape: "circle",
    questionsAsked: 5,
    correctAnswers: 5,
    accuracy: 100,
    duration: 480, // seconds
    questions: [
      {
        question: "What shape is this?",
        studentAnswer: "circle",
        correctAnswer: "circle",
        isCorrect: true,
        aiAssessment: "Perfect identification",
      },
    ],
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const shape = searchParams.get("shape")
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    let filteredSessions = mockSessions

    if (studentId) {
      filteredSessions = filteredSessions.filter((s) => s.studentId === studentId)
    }

    if (shape) {
      filteredSessions = filteredSessions.filter((s) => s.shape === shape)
    }

    filteredSessions = filteredSessions.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredSessions,
      total: filteredSessions.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate required fields
    const { studentId, shape, questionsAsked, correctAnswers } = body
    if (!studentId || !shape || questionsAsked === undefined || correctAnswers === undefined) {
      return NextResponse.json({ success: false, error: "Missing required session data" }, { status: 400 })
    }

    // Create new session (mock implementation)
    const newSession = {
      id: `SES${String(mockSessions.length + 1).padStart(3, "0")}`,
      studentId,
      date: new Date().toISOString(),
      shape,
      questionsAsked,
      correctAnswers,
      accuracy: Math.round((correctAnswers / questionsAsked) * 100),
      duration: body.duration || 0,
      questions: body.questions || [],
    }

    mockSessions.push(newSession)

    return NextResponse.json(
      {
        success: true,
        data: newSession,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
  }
}
