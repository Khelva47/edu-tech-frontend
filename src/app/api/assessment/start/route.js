import { executeQuerySafe } from "@/lib/db"

export async function POST(request) {
  try {
    const { studentId } = await request.json()
    const today = new Date().toISOString().split("T")[0]

    // Check if student was already assessed today
    const existingAssessmentResult = await executeQuerySafe(
      `SELECT id FROM assessment_sessions 
       WHERE student_id = ? AND DATE(timestamp) = ?`,
      [studentId, today],
    )

    // Handle case where query result might be undefined
    const existingAssessment = existingAssessmentResult || []

    if (existingAssessment.length > 0) {
      return Response.json(
        {
          error: "Student has already been assessed today",
        },
        { status: 400 },
      )
    }

    // Check if there's already an active session
    const activeSessionResult = await executeQuerySafe(
      `SELECT id FROM assessment_sessions 
       WHERE student_id = ? AND status = 'active'`,
      [studentId],
    )

    // Handle case where query result might be undefined
    const activeSession = activeSessionResult || []

    if (activeSession.length > 0) {
      return Response.json(
        {
          error: "Assessment session already active for this student",
        },
        { status: 400 },
      )
    }

    // Create new assessment session
    const insertResult = await executeQuerySafe(
      `INSERT INTO assessment_sessions (student_id, timestamp, status) 
       VALUES (?, NOW(), 'active')`,
      [studentId],
    )

    // Handle case where insert result might be undefined
    if (!insertResult || !insertResult.insertId) {
      throw new Error("Failed to create assessment session")
    }

    return Response.json({
      sessionId: insertResult.insertId,
      studentId: studentId,
      startTime: new Date().toISOString(),
      status: "active",
      message: "Assessment session started successfully",
    })
  } catch (error) {
    console.error("Error starting assessment:", error)
    return Response.json({ error: "Failed to start assessment" }, { status: 500 })
  }
}
