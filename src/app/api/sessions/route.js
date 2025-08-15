import { NextResponse } from "next/server"
import { executeQuerySafe } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const shape = searchParams.get("shape")
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    let query = `
      SELECT 
        ls.id,
        ls.student_id,
        ls.shape,
        ls.explanation,
        ls.timestamp,
        s.first_name,
        s.last_name
      FROM learning_sessions ls
      LEFT JOIN students s ON ls.student_id = s.student_id
      WHERE 1=1
    `

    const params = []

    if (studentId) {
      query += " AND ls.student_id = ?"
      params.push(studentId)
    }

    if (shape) {
      query += " AND ls.shape = ?"
      params.push(shape)
    }

    query += " ORDER BY ls.timestamp DESC LIMIT ?"
    params.push(limit)

    const sessions = await executeQuerySafe(query, params)

    const formattedSessions = await Promise.all(
      sessions.map(async (session) => {
        // Get assessment data for this session's date
        const assessmentQuery = `
        SELECT 
          COUNT(*) as total_questions,
          SUM(CASE WHEN assessment = 'Correct' THEN 1 ELSE 0 END) as correct_answers
        FROM assessment_sessions 
        WHERE student_id = ? AND DATE(timestamp) = DATE(?)
      `

        const assessmentData = await executeQuerySafe(assessmentQuery, [session.student_id, session.timestamp])
        const assessment = assessmentData[0] || { total_questions: 0, correct_answers: 0 }

        return {
          id: session.id,
          studentId: session.student_id,
          studentName: `${session.first_name} ${session.last_name}`,
          date: session.timestamp,
          shape: session.shape,
          explanation: session.explanation,
          questionsAsked: Number(assessment.total_questions) || 0,
          correctAnswers: Number(assessment.correct_answers) || 0,
          accuracy:
            assessment.total_questions > 0
              ? Math.round((assessment.correct_answers / assessment.total_questions) * 100)
              : 0,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: formattedSessions,
      total: formattedSessions.length,
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { studentId, shape, explanation } = body

    if (!studentId || !shape || !explanation) {
      return NextResponse.json({ success: false, error: "Missing required session data" }, { status: 400 })
    }

    // Insert learning session
    const result = await executeQuerySafe(
      "INSERT INTO learning_sessions (student_id, shape, explanation) VALUES (?, ?, ?)",
      [studentId, shape, explanation],
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertId,
          studentId,
          shape,
          explanation,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
  }
}
