import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    // Get student basic info
    const studentQuery = `
      SELECT 
        student_id as id,
        CONCAT(first_name, ' ', last_name) as name,
        first_name,
        last_name,
        DATE_FORMAT(created_at, '%Y-%m-%d') as registrationDate,
        date_of_birth,
        email,
        phone,
        emergency_contact,
        emergency_phone,
        medical_notes,
        learning_goals,
        CASE 
          WHEN (SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id) >= 90 THEN 'excellent'
          WHEN (SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id) >= 70 THEN 'active'
          ELSE 'needs_attention'
        END as status,
        (SELECT COUNT(*) FROM learning_sessions WHERE student_id = students.student_id) as totalSessions,
        COALESCE((SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id), 0) as averageScore,
        (SELECT MAX(session_date) FROM learning_sessions WHERE student_id = students.student_id) as lastSession
      FROM students 
      WHERE student_id = ?
    `

    const students = await executeQuery(studentQuery, [params.id])

    if (students.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    // Get shapes progress with detailed stats
    const shapesQuery = `
      SELECT 
        shape_type,
        COUNT(*) as sessions,
        AVG(assessment_score) as progress,
        AVG(CASE WHEN is_correct = 1 THEN 100 ELSE 0 END) as accuracy
      FROM learning_sessions 
      WHERE student_id = ? 
      GROUP BY shape_type
    `
    const shapesData = await executeQuery(shapesQuery, [params.id])

    const shapesProgress = {
      circle: { progress: 0, sessions: 0, accuracy: 0 },
      square: { progress: 0, sessions: 0, accuracy: 0 },
      triangle: { progress: 0, sessions: 0, accuracy: 0 },
      rectangle: { progress: 0, sessions: 0, accuracy: 0 },
    }

    shapesData.forEach((shape) => {
      const shapeKey = shape.shape_type.toLowerCase()
      shapesProgress[shapeKey] = {
        progress: Math.round(shape.progress),
        sessions: shape.sessions,
        accuracy: Math.round(shape.accuracy),
      }
    })

    // Get recent sessions
    const sessionsQuery = `
      SELECT 
        id,
        DATE_FORMAT(session_date, '%Y-%m-%d') as date,
        shape_type as shape,
        1 as questionsAsked,
        CASE WHEN is_correct = 1 THEN 1 ELSE 0 END as correctAnswers,
        CASE WHEN is_correct = 1 THEN 100 ELSE 0 END as accuracy,
        '5 minutes' as duration
      FROM learning_sessions 
      WHERE student_id = ? 
      ORDER BY session_date DESC 
      LIMIT 10
    `
    const recentSessions = await executeQuery(sessionsQuery, [params.id])

    const studentData = {
      ...student,
      averageScore: Math.round(student.averageScore),
      shapesProgress,
      recentSessions,
    }

    return NextResponse.json({
      success: true,
      data: studentData,
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
    const existingStudent = await executeQuery("SELECT student_id FROM students WHERE student_id = ?", [params.id])

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

    await executeQuery(updateQuery, values)

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to update student" }, { status: 500 })
  }
}
