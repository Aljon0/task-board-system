import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import path from 'path'

const getDatabasePath = () => {
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL.replace('file:', '')
    // Handle absolute paths
    if (path.isAbsolute(url)) {
      return url
    }
    return path.join(process.cwd(), url)
  }
  return path.join(process.cwd(), 'prisma', 'dev.db')
}

const adapter = new PrismaBetterSqlite3({ url: getDatabasePath() })

const prisma = new PrismaClient({
  adapter
})

async function main() {
  // Clean existing data
  await prisma.task.deleteMany()
  await prisma.board.deleteMany()

  // Create boards with tasks
  const board1 = await prisma.board.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of company website',
      tasks: {
        create: [
          {
            title: 'Create wireframes',
            description: 'Design initial wireframes for all pages',
            status: 'done'
          },
          {
            title: 'Develop homepage',
            description: 'Build responsive homepage with hero section',
            status: 'in_progress'
          },
          {
            title: 'Setup analytics',
            description: 'Integrate Google Analytics and tracking',
            status: 'todo'
          }
        ]
      }
    }
  })

  const board2 = await prisma.board.create({
    data: {
      name: 'Q1 Marketing Campaign',
      description: 'Launch new product marketing initiatives',
      tasks: {
        create: [
          {
            title: 'Social media strategy',
            status: 'in_progress'
          },
          {
            title: 'Email templates',
            status: 'todo'
          }
        ]
      }
    }
  })

  const board3 = await prisma.board.create({
    data: {
      name: 'Mobile App Development',
      tasks: {
        create: [
          {
            title: 'Setup React Native project',
            status: 'done'
          },
          {
            title: 'Design app navigation',
            status: 'done'
          },
          {
            title: 'Build authentication flow',
            status: 'in_progress'
          },
          {
            title: 'Integrate push notifications',
            status: 'todo'
          }
        ]
      }
    }
  })

  console.log('✅ Seed data created:', {
    boards: [board1.name, board2.name, board3.name]
  })
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })