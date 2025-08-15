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
  connectionLimit: 2,
  acquireTimeout: 60000,
  queueLimit: 0,
  reconnect: true,
  idleTimeout: 30000,
  maxIdle: 1,
}

let pool = null

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)

    pool.on("connection", (connection) => {
      console.log("[v0] New connection established as id " + connection.threadId)
    })

    pool.on("error", (err) => {
      console.error("[v0] Database pool error:", err)
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        pool = null
      }
    })
  }
  return pool
}

export async function executeQuery(query, params = []) {
  try {
    const pool = await getConnection()
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    if (error.code === "ER_TOO_MANY_USER_CONNECTIONS" || error.code === "PROTOCOL_CONNECTION_LOST") {
      pool = null
    }
    throw error
  }
}

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

  const createLearningSessionsTable = `
    CREATE TABLE IF NOT EXISTS learning_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20),
      shape TEXT,
      explanation TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_student_id (student_id),
      INDEX idx_timestamp (timestamp)
    )
  `

  const createAssessmentSessionsTable = `
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20),
      question TEXT,
      answer TEXT,
      assessment TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_student_id (student_id),
      INDEX idx_timestamp (timestamp)
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
    const studentsTable = await executeQuery(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'students'",
      [process.env.MYSQL_DATABASE],
    )

    const sessionsTable = await executeQuery(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'learning_sessions'",
      [process.env.MYSQL_DATABASE],
    )

    const assessmentTable = await executeQuery(
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

export async function executeQuerySafe(query, params = []) {
  try {
    return await executeQuery(query, params)
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      console.log("Table doesn't exist, creating tables...")
      await ensureTablesExist()
      return await executeQuery(query, params)
    }
    throw error
  }
}
