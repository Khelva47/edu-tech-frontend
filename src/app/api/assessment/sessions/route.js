import { NextResponse } from "next/server"
import { executeQuerySafe } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const date = searchParams.get("date")

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 })
    }

    let query = `
      SELECT 
        id,
        student_id,
        question,
        answer,
        assessment,
        timestamp
      FROM assessment_sessions 
      WHERE student_id = ?
    `

    const params = [studentId]

    if (date) {
      query += " AND DATE(timestamp) = ?"
      params.push(date)
    }

    query += " ORDER BY timestamp DESC"

    const assessments = await executeQuerySafe(query, params)

    return NextResponse.json({
      success: true,
      data: assessments,
      total: assessments.length,
    })
  } catch (error) {
    console.error("Error fetching assessment sessions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch assessment sessions" }, { status: 500 })
  }
}
