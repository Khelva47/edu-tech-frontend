import { NextResponse } from "next/server"
import { executeQuerySafe } from "@/lib/db"

export async function GET(request, { params }) {
  try {
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
        CASE 
          WHEN (SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id) >= 90 THEN 'excellent'
          WHEN (SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id) >= 70 THEN 'active'
          ELSE 'needs_attention'
        END as status,
        (SELECT COUNT(*) FROM learning_sessions WHERE student_id = students.student_id) as total_sessions,
        COALESCE((SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id), 0) as average_score,
        (SELECT MAX(session_date) FROM learning_sessions WHERE student_id = students.student_id) as last_session_date
      FROM students 
      WHERE student_id = ?
    `

    const students = await executeQuerySafe(studentQuery, [params.id])

    if (students.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    // Get recent sessions with detailed information
    const sessionsQuery = `
      SELECT 
        id,
        student_id,
        shape_type,
        question,
        student_answer,
        correct_answer,
        is_correct,
        assessment_score,
        ai_feedback,
        session_date,
        created_at
      FROM learning_sessions 
      WHERE student_id = ? 
      ORDER BY session_date DESC, created_at DESC
      LIMIT 20
    `
    const sessions = await executeQuerySafe(sessionsQuery, [params.id])

    return NextResponse.json({
      success: true,
      student: {
        ...student,
        average_score: Math.round(student.average_score || 0),
        total_sessions: student.total_sessions || 0,
      },
      sessions: sessions || [],
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch student" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()

    // Check if student exists
    const existingStudent = await executeQuerySafe("SELECT student_id FROM students WHERE student_id = ?", [params.id])

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
      params.id,
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
