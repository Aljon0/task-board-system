import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getDatabasePath = () => {
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL.replace('file:', '')
    // Handle absolute paths
    if (path.isAbsolute(url)) {
      return url
    }
    return path.join(process.cwd(), url)
  }
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  return dbPath
}

const dbPath = getDatabasePath()

// Ensure database directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

let adapter: PrismaBetterSqlite3
let prismaInstance: PrismaClient

try {
  adapter = new PrismaBetterSqlite3({ url: dbPath })
  prismaInstance = new PrismaClient({ adapter })
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  throw error
}

export const prisma = globalForPrisma.prisma ?? prismaInstance

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}