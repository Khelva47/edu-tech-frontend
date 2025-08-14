import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
}

let pool

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery(query, params = []) {
  try {
    const connection = await getConnection()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Initialize database tables to match Python script exactly
export async function initializeDatabase() {
  const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      date_of_birth DATE,
      email VARCHAR(255),
      phone VARCHAR(20),
      emergency_contact VARCHAR(100),
      emergency_phone VARCHAR(20),
      medical_notes TEXT,
      learning_goals TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `

  // Match Python script schema exactly
  const createLearningSessionsTable = `
    CREATE TABLE IF NOT EXISTS learning_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id TEXT,
      shape TEXT,
      explanation TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    )
  `

  // Match Python script schema exactly
  const createAssessmentSessionsTable = `
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id TEXT,
      question TEXT,
      answer TEXT,
      assessment TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    )
  `

  try {
    await executeQuery(createStudentsTable)
    await executeQuery(createLearningSessionsTable)
    await executeQuery(createAssessmentSessionsTable)
    console.log("Database tables initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

export async function checkTablesExist() {
  try {
    const connection = await getConnection()

    // Check if students table exists
    const [studentsTable] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'students'",
      [process.env.MYSQL_DATABASE],
    )

    // Check if learning_sessions table exists
    const [sessionsTable] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'learning_sessions'",
      [process.env.MYSQL_DATABASE],
    )

    const [assessmentTable] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'assessment_sessions'",
      [process.env.MYSQL_DATABASE],
    )

    return {
      studentsExists: studentsTable[0].count > 0,
      sessionsExists: sessionsTable[0].count > 0,
      assessmentExists: assessmentTable[0].count > 0,
    }
  } catch (error) {
    console.error("Error checking table existence:", error)
    return { studentsExists: false, sessionsExists: false, assessmentExists: false }
  }
}

export async function ensureTablesExist() {
  try {
    const { studentsExists, sessionsExists, assessmentExists } = await checkTablesExist()

    if (!studentsExists || !sessionsExists || !assessmentExists) {
      console.log("Tables missing, initializing database...")
      await initializeDatabase()
      return true
    }

    return false
  } catch (error) {
    console.error("Error ensuring tables exist:", error)
    throw error
  }
}

// Enhanced executeQuery with automatic table creation
export async function executeQuerySafe(query, params = []) {
  try {
    // First try to execute the query
    return await executeQuery(query, params)
  } catch (error) {
    // If table doesn't exist, try to create tables and retry
    if (error.code === "ER_NO_SUCH_TABLE") {
      console.log("Table doesn't exist, creating tables...")
      await ensureTablesExist()
      // Retry the query
      return await executeQuery(query, params)
    }
    throw error
  }
}
