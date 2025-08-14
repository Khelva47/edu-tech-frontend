import { NextResponse } from "next/server"
import { executeQuerySafe } from "@/lib/db"

export async function GET() {
  try {
    const query = `
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
      ORDER BY created_at DESC
    `

    const students = await executeQuerySafe(query)

    return NextResponse.json({
      success: true,
      students: students.map((student) => ({
        ...student,
        average_score: Math.round(student.average_score || 0),
        total_sessions: student.total_sessions || 0,
      })),
      total: students.length,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch students", students: [] }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate required fields
    const { firstName, lastName, studentId } = body
    if (!firstName || !lastName || !studentId) {
      return NextResponse.json(
        {
          success: false,
          error: "First name, last name, and student ID are required",
        },
        { status: 400 },
      )
    }

    const existingStudent = await executeQuerySafe("SELECT student_id FROM students WHERE student_id = ?", [studentId])

    if (existingStudent.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Student ID already exists",
        },
        { status: 400 },
      )
    }

    // Insert new student
    const insertQuery = `
      INSERT INTO students (
        student_id, first_name, last_name, date_of_birth, 
        email, phone, emergency_contact, emergency_phone, 
        medical_notes, learning_goals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      studentId,
      firstName,
      lastName,
      body.dateOfBirth || null,
      body.email || null,
      body.phone || null,
      body.emergencyContact || null,
      body.emergencyPhone || null,
      body.medicalNotes || null,
      body.learningGoals || null,
    ]

    await executeQuerySafe(insertQuery, values)

    // Return the created student
    const newStudent = {
      id: studentId,
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      email: body.email || null,
      phone: body.phone || null,
      created_at: new Date().toISOString(),
      status: "active",
      total_sessions: 0,
      average_score: 0,
      last_session_date: null,
    }

    return NextResponse.json(
      {
        success: true,
        student: newStudent,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to create student" }, { status: 500 })
  }
}
