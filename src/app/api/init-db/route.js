import { initializeDatabase, checkTablesExist } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await initializeDatabase()
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const tableStatus = await checkTablesExist()
    return NextResponse.json({
      success: true,
      data: {
        studentsTableExists: tableStatus.studentsExists,
        sessionsTableExists: tableStatus.sessionsExists,
        allTablesExist: tableStatus.studentsExists && tableStatus.sessionsExists,
      },
    })
  } catch (error) {
    console.error("Error checking table status:", error)
    return NextResponse.json({ error: "Failed to check table status" }, { status: 500 })
  }
}
