import { NextResponse } from "next/server"
import { executeQuerySafe } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const shape = searchParams.get("shape")
    const limit = Math.max(1, Math.min(100, Number.parseInt(searchParams.get("limit")) || 50))

    let query = `
      SELECT 
        id,
        student_id,
        shape,
        explanation,
        timestamp
      FROM learning_sessions
      WHERE 1=1
    `

    const params = []

    if (studentId) {
      query += " AND student_id = ?"
      params.push(studentId)
    }

    if (shape) {
      query += " AND shape = ?"
      params.push(shape)
    }

    query += ` 
      ORDER BY timestamp DESC 
      LIMIT ?
    `
    params.push(limit)

    console.log("[v0] Executing query with params:", { query: query.trim(), params })

    const sessions = await executeQuerySafe(query, params)

    const formattedSessions = await Promise.all(
      sessions.map(async (session) => {
        let studentName = "Unknown Student"
        let questionsAsked = 0
        let correctAnswers = 0

        try {
          // Get student name separately
          const studentData = await executeQuerySafe(
            "SELECT first_name, last_name FROM students WHERE student_id = ?",
            [session.student_id],
          )

          if (studentData && studentData[0]) {
            studentName = `${studentData[0].first_name || ""} ${studentData[0].last_name || ""}`.trim()
          }

          // Get assessment data for this session's date
          const assessments = await executeQuerySafe(
            `SELECT COUNT(*) as total, 
           SUM(CASE WHEN assessment = 'Correct' THEN 1 ELSE 0 END) as correct
           FROM assessment_sessions 
           WHERE student_id = ? AND DATE(timestamp) = DATE(?)`,
            [session.student_id, session.timestamp],
          )

          if (assessments && assessments[0]) {
            questionsAsked = Number(assessments[0].total) || 0
            correctAnswers = Number(assessments[0].correct) || 0
          }
        } catch (error) {
          console.error("[v0] Error fetching additional data:", error)
          // Continue with default values
        }

        return {
          id: session.id,
          studentId: session.student_id,
          studentName,
          date: session.timestamp,
          shape: session.shape,
          explanation: session.explanation,
          questionsAsked,
          correctAnswers,
          accuracy: questionsAsked > 0 ? Math.round((correctAnswers / questionsAsked) * 100) : 0,
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
