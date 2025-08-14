import { NextResponse } from "next/server"
import { executeQuerySafe } from "@/lib/db"

export async function GET() {
  try {
    const query = `
      SELECT 
        student_id as id,
        CONCAT(first_name, ' ', last_name) as name,
        DATE_FORMAT(created_at, '%Y-%m-%d') as registrationDate,
        CASE 
          WHEN (SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id) >= 90 THEN 'excellent'
          WHEN (SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id) >= 70 THEN 'active'
          ELSE 'needs_attention'
        END as status,
        (SELECT COUNT(*) FROM learning_sessions WHERE student_id = students.student_id) as totalSessions,
        COALESCE((SELECT AVG(assessment_score) FROM learning_sessions WHERE student_id = students.student_id), 0) as averageScore,
        (SELECT MAX(session_date) FROM learning_sessions WHERE student_id = students.student_id) as lastSession
      FROM students
      ORDER BY created_at DESC
    `

    const students = await executeQuerySafe(query)

    // Get shapes progress for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const shapesQuery = `
          SELECT 
            shape_type,
            AVG(assessment_score) as progress
          FROM learning_sessions 
          WHERE student_id = ? 
          GROUP BY shape_type
        `
        const shapesData = await executeQuerySafe(shapesQuery, [student.id])

        const shapesProgress = {
          circle: 0,
          square: 0,
          triangle: 0,
          rectangle: 0,
        }

        shapesData.forEach((shape) => {
          shapesProgress[shape.shape_type.toLowerCase()] = Math.round(shape.progress)
        })

        return {
          ...student,
          averageScore: Math.round(student.averageScore),
          shapesProgress,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: studentsWithProgress,
      total: studentsWithProgress.length,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch students" }, { status: 500 })
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
      name: `${firstName} ${lastName}`,
      registrationDate: new Date().toISOString().split("T")[0],
      status: "active",
      totalSessions: 0,
      averageScore: 0,
      lastSession: null,
      shapesProgress: {
        circle: 0,
        square: 0,
        triangle: 0,
        rectangle: 0,
      },
    }

    return NextResponse.json(
      {
        success: true,
        data: newStudent,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to create student" }, { status: 500 })
  }
}
