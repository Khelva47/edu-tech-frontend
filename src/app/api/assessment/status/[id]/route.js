import { executeQuerySafe } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const studentId = params.id
    const today = new Date().toISOString().split("T")[0]

    // Check if student was assessed today
    const [assessmentCheck] = await executeQuerySafe(
      `SELECT id, created_at FROM learning_sessions 
       WHERE student_id = ? AND DATE(created_at) = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [studentId, today],
    )

    // Check for active assessment session
    const [activeSession] = await executeQuerySafe(
      `SELECT id, student_id, start_time, status FROM assessment_sessions 
       WHERE student_id = ? AND status = 'active' 
       ORDER BY start_time DESC LIMIT 1`,
      [studentId],
    )

    return Response.json({
      assessedToday: assessmentCheck.length > 0,
      lastAssessment: assessmentCheck.length > 0 ? assessmentCheck[0].created_at : null,
      currentSession:
        activeSession.length > 0
          ? {
              id: activeSession[0].id,
              startTime: activeSession[0].start_time,
              status: activeSession[0].status,
            }
          : null,
    })
  } catch (error) {
    console.error("Error checking assessment status:", error)
    return Response.json({ error: "Failed to check assessment status" }, { status: 500 })
  }
}
