import { NextResponse } from "next/server"
import { executeQuerySafe } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id

    // Get student basic info
    const studentQuery = `
      SELECT 
        id,
        student_id,
        first_name,
        last_name,
        email,
        phone,
        emergency_contact,
        emergency_phone,
        medical_notes,
        learning_goals,
        date_of_birth,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM learning_sessions WHERE student_id = students.student_id) as total_sessions,
        (SELECT COUNT(*) FROM assessment_sessions WHERE student_id = students.student_id) as total_assessments,
        (SELECT MAX(timestamp) FROM learning_sessions WHERE student_id = students.student_id) as last_session_date
      FROM students 
      WHERE student_id = ?
    `

    const students = await executeQuerySafe(studentQuery, [studentId])

    if (students.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    const learningSessionsQuery = `
      SELECT 
        id,
        student_id,
        shape,
        explanation,
        timestamp
      FROM learning_sessions 
      WHERE student_id = ? 
      ORDER BY timestamp DESC
      LIMIT 10
    `
    const learningSessions = await executeQuerySafe(learningSessionsQuery, [studentId])

    const assessmentSessionsQuery = `
      SELECT 
        id,
        student_id,
        question,
        answer,
        assessment,
        timestamp
      FROM assessment_sessions 
      WHERE student_id = ? 
      ORDER BY timestamp DESC
      LIMIT 10
    `
    const assessmentSessions = await executeQuerySafe(assessmentSessionsQuery, [studentId])

    const avgScoreQuery = `
      SELECT AVG(CASE WHEN assessment = 'Correct' THEN 100 ELSE 0 END) as avg_score
      FROM assessment_sessions 
      WHERE student_id = ?
    `
    const [avgResult] = await executeQuerySafe(avgScoreQuery, [studentId])
    const averageScore = Math.round(avgResult?.avg_score || 0)

    let status = "needs_attention"
    if (averageScore >= 90) status = "excellent"
    else if (averageScore >= 70) status = "active"

    return NextResponse.json({
      success: true,
      student: {
        ...student,
        status,
        average_score: averageScore,
        total_sessions: student.total_sessions || 0,
        total_assessments: student.total_assessments || 0,
      },
      learningSessions: learningSessions || [],
      assessmentSessions: assessmentSessions || [],
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch student" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id
    const body = await request.json()

    // Check if student exists
    const existingStudent = await executeQuerySafe("SELECT student_id FROM students WHERE student_id = ?", [studentId])

    if (existingStudent.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    // Update student data
    const updateQuery = `
      UPDATE students SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        date_of_birth = COALESCE(?, date_of_birth),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        emergency_contact = COALESCE(?, emergency_contact),
        emergency_phone = COALESCE(?, emergency_phone),
        medical_notes = COALESCE(?, medical_notes),
        learning_goals = COALESCE(?, learning_goals),
        updated_at = CURRENT_TIMESTAMP
      WHERE student_id = ?
    `

    const values = [
      body.firstName,
      body.lastName,
      body.dateOfBirth,
      body.email,
      body.phone,
      body.emergencyContact,
      body.emergencyPhone,
      body.medicalNotes,
      body.learningGoals,
      studentId,
    ]

    await executeQuerySafe(updateQuery, values)

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to update student" }, { status: 500 })
  }
}
