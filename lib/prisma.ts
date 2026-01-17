import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import os from 'os'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getDatabasePath = () => {
  // If DATABASE_URL is explicitly set, use it
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL.replace(/^file:/, '')
    // Handle absolute paths
    if (path.isAbsolute(url)) {
      return url
    }
    return path.join(process.cwd(), url)
  }

  // In production, use a writable directory
  if (process.env.NODE_ENV === 'production') {
    // Use /tmp on Unix systems (works on most serverless platforms)
    // On Windows, use the temp directory
    const tempDir = os.platform() === 'win32' ? os.tmpdir() : '/tmp'
    const dbPath = path.join(tempDir, 'task-board.db')
    
    // Ensure the temp directory exists and is writable
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      // Test write permissions
      const testFile = path.join(tempDir, '.write-test')
      try {
        fs.writeFileSync(testFile, 'test')
        fs.unlinkSync(testFile)
      } catch {
        console.warn('Temp directory is not writable, falling back to project directory')
        // Fallback to project directory
        return path.join(process.cwd(), 'data', 'task-board.db')
      }
      return dbPath
    } catch (error) {
      console.warn('Failed to use temp directory, falling back to project directory:', error)
      // Fallback to project directory
      return path.join(process.cwd(), 'data', 'task-board.db')
    }
  }

  // Development: use prisma/dev.db
  return path.join(process.cwd(), 'prisma', 'dev.db')
}

const dbPath = getDatabasePath()

// Set DATABASE_URL for Prisma tools (migrations, etc.) if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${dbPath}`
}

// Ensure database directory exists
const dbDir = path.dirname(dbPath)
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  
  // Verify directory write permissions
  try {
    fs.accessSync(dbDir, fs.constants.W_OK)
  } catch {
    console.error(`Database directory is not writable: ${dbDir}`)
    throw new Error(`Database directory is not writable. Please check directory permissions for: ${dbDir}`)
  }
  
  // If database file doesn't exist, Prisma will create it on first use
  // But we should verify the parent directory is writable
  if (fs.existsSync(dbPath)) {
    // Verify existing file is writable
    try {
      fs.accessSync(dbPath, fs.constants.W_OK)
    } catch {
      console.error(`Database file is not writable: ${dbPath}`)
      throw new Error(`Database file is not writable. Please check file permissions for: ${dbPath}`)
    }
  }
} catch (error) {
  console.error('Failed to setup database directory:', error)
  throw error
}

function initializePrisma(): PrismaClient {
  try {
    // Ensure database directory exists before initializing adapter
    const dbDir = path.dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // The database file will be created by Prisma if it doesn't exist
    // But we need to ensure the directory is writable
    if (!fs.existsSync(dbPath)) {
      // Test if we can create a file in the directory
      try {
        const testFile = path.join(dbDir, '.test-write')
        fs.writeFileSync(testFile, 'test')
        fs.unlinkSync(testFile)
      } catch {
        console.error('Cannot write to database directory:', dbDir)
        throw new Error(`Database directory is not writable: ${dbDir}`)
      }
    }

    // Initialize adapter with the database path
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    const prismaInstance = new PrismaClient({ adapter })
    
    return prismaInstance
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to initialize database: ${errorMessage}`)
  }
}

// Initialize Prisma client
let prismaInstance: PrismaClient

try {
  prismaInstance = initializePrisma()
} catch (error) {
  console.error('Prisma initialization error:', error)
  // Re-throw to prevent app from starting with broken database connection
  throw error
}

export const prisma = globalForPrisma.prisma ?? prismaInstance

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}