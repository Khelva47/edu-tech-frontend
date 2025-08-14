import { executeQuerySafe } from "@/lib/db"

export async function POST(request) {
  try {
    const { studentId } = await request.json()
    const today = new Date().toISOString().split("T")[0]

    // Check if student was already assessed today
    const [existingAssessment] = await executeQuerySafe(
      `SELECT id FROM learning_sessions 
       WHERE student_id = ? AND DATE(created_at) = ?`,
      [studentId, today],
    )

    if (existingAssessment.length > 0) {
      return Response.json(
        {
          error: "Student has already been assessed today",
        },
        { status: 400 },
      )
    }

    // Check if there's already an active session
    const [activeSession] = await executeQuerySafe(
      `SELECT id FROM assessment_sessions 
       WHERE student_id = ? AND status = 'active'`,
      [studentId],
    )

    if (activeSession.length > 0) {
      return Response.json(
        {
          error: "Assessment session already active for this student",
        },
        { status: 400 },
      )
    }

    // Create new assessment session
    const [result] = await executeQuerySafe(
      `INSERT INTO assessment_sessions (student_id, start_time, status) 
       VALUES (?, NOW(), 'active')`,
      [studentId],
    )

    return Response.json({
      sessionId: result.insertId,
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
