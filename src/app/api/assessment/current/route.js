import { executeQuerySafe } from "@/lib/db"

// This endpoint is for the Python code to get the current student being assessed
export async function GET() {
  try {
    const activeSessionQuery = `SELECT 
        a.student_id,
        a.timestamp as start_time,
        s.first_name,
        s.last_name,
        s.student_id as registration_id
       FROM active_sessions a
       JOIN students s ON a.student_id = s.student_id
       WHERE a.is_active = TRUE
       ORDER BY a.timestamp DESC
       LIMIT 1`

    const activeSessionResult = await executeQuerySafe(activeSessionQuery)
    const activeSession = activeSessionResult || []

    if (activeSession.length === 0) {
      return Response.json({
        currentStudent: null,
        message: "No active assessment session",
      })
    }

    return Response.json({
      currentStudent: {
        studentId: activeSession[0].student_id,
        registrationId: activeSession[0].registration_id,
        firstName: activeSession[0].first_name,
        lastName: activeSession[0].last_name,
        startTime: activeSession[0].start_time,
      },
    })
  } catch (error) {
    console.error("Error getting current assessment:", error)
    return Response.json({ error: "Failed to get current assessment" }, { status: 500 })
  }
}
