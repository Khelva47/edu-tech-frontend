import { executeQuerySafe } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id
    const today = new Date().toISOString().split("T")[0]

    const assessmentCheck = await executeQuerySafe(
      `SELECT id, timestamp FROM assessment_sessions 
       WHERE student_id = ? AND DATE(timestamp) = ? 
       ORDER BY timestamp DESC LIMIT 1`,
      [studentId, today],
    )

    const learningCheck = await executeQuerySafe(
      `SELECT id, timestamp FROM learning_sessions 
       WHERE student_id = ? AND DATE(timestamp) = ? 
       ORDER BY timestamp DESC LIMIT 1`,
      [studentId, today],
    )

    return Response.json({
      assessedToday: assessmentCheck.length > 0,
      learnedToday: learningCheck.length > 0,
      lastAssessment: assessmentCheck.length > 0 ? assessmentCheck[0].timestamp : null,
      lastLearning: learningCheck.length > 0 ? learningCheck[0].timestamp : null,
    })
  } catch (error) {
    console.error("Error checking assessment status:", error)
    return Response.json({ error: "Failed to check assessment status" }, { status: 500 })
  }
}
