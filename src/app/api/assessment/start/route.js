import { executeQuerySafe } from "@/lib/db"

export async function POST(request) {
  try {
    const { studentId } = await request.json()
    const today = new Date().toISOString().split("T")[0]

    // Check if student was already assessed today
    const existingAssessmentQuery = `SELECT id FROM learning_sessions 
       WHERE student_id = '${studentId}' AND DATE(timestamp) = '${today}' AND assessment_score IS NOT NULL`

    const existingAssessmentResult = await executeQuerySafe(existingAssessmentQuery)
    const existingAssessment = existingAssessmentResult || []

    if (existingAssessment.length > 0) {
      return Response.json(
        {
          error: "Student has already been assessed today",
        },
        { status: 400 },
      )
    }

    const activeSessionResult = await executeQuerySafe(
      `SELECT session_id FROM active_sessions 
       WHERE student_id = '${studentId}' AND is_active = TRUE`,
    )

    const activeSession = activeSessionResult || []

    if (activeSession.length > 0) {
      return Response.json(
        {
          error: "Assessment session already active for this student",
        },
        { status: 400 },
      )
    }

    const insertQuery = `INSERT INTO active_sessions (student_id, is_active, timestamp) VALUES ('${studentId}', TRUE, NOW())`
    await executeQuerySafe(insertQuery)

    return Response.json({
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
