# Task Board System

A full-stack task management application built with Next.js 14, TypeScript, Prisma, and SQLite.

## Features

### Dashboard
- View all boards with task counts
- Create new boards with name and description
- Delete boards (cascades to tasks)
- Navigate to board details

### Board Management
- View all tasks grouped by status (To Do, In Progress, Done)
- Create new tasks with title, description, and status
- Edit task titles inline (click to edit)
- Change task status via dropdown (instant updates)
- Delete tasks with confirmation
- Back navigation to dashboard

### Technical Features
- Server-side rendering with Next.js App Router
- Type-safe database operations with Prisma ORM
- Real-time UI updates without page refresh
- Form validation and error handling
- Optimistic UI updates
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript** (strict mode)
- **Tailwind CSS**

### Backend
- **Next.js Server Actions**
- **Prisma ORM**
- **SQLite** (local database)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Setup Prisma and Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
task-board/
├── app/
│   ├── page.tsx                    # Dashboard page
│   ├── board/[id]/page.tsx         # Board detail page
│   ├── board/[id]/not-found.tsx    # 404 page
│   ├── actions.ts                  # Server Actions (all DB operations)
│   └── layout.tsx                  # Root layout
├── components/
│   ├── BoardList.tsx               # Board grid display
│   ├── CreateBoardForm.tsx         # New board form
│   ├── CreateTaskForm.tsx          # New task form
│   ├── TaskColumn.tsx              # Task status column
│   └── TaskCard.tsx                # Individual task card
├── lib/
│   └── prisma.ts                   # Prisma Client singleton
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Sample data seeder
├── types/
│   └── index.ts                    # TypeScript types
└── package.json
```

## Database Schema

### Board Model
- `id`: String (UUID)
- `name`: String (required)
- `description`: String (optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `tasks`: Task[] (one-to-many relation)

### Task Model
- `id`: String (UUID)
- `title`: String (required)
- `description`: String (optional)
- `status`: String (todo | in_progress | done)
- `priority`: String (optional)
- `boardId`: String (foreign key)
- `board`: Board (many-to-one relation)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Note**: Deleting a board automatically deletes all associated tasks (cascade delete).

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Prisma commands
npx prisma studio          # Open Prisma Studio (database GUI)
npx prisma migrate dev     # Create new migration
npx prisma generate        # Regenerate Prisma Client
npx prisma db seed         # Seed database with sample data
```

## Usage Guide

### Creating a Board
1. Go to dashboard (/)
2. Fill in "Board Name" (required)
3. Optionally add description
4. Click "Create Board"

### Managing Tasks
1. Click on a board from dashboard
2. Fill in task title in "Create New Task" form
3. Select initial status (default: To Do)
4. Click "Create Task"

### Editing Tasks
- **Edit Title**: Click on task title to edit inline
- **Change Status**: Use dropdown in task card
- **Delete Task**: Click "Delete" button (requires confirmation)

### Deleting Boards
- Click "Delete Board" button on board card
- Confirm deletion (all tasks will be deleted)

## Development Notes

### Server Components vs Client Components
- **Server Components**: Pages, data fetching
- **Client Components**: Forms, interactive elements (marked with `'use client'`)

### Server Actions Pattern
All database operations use Server Actions (`app/actions.ts`):
- Consistent return type: `{ success: boolean, data?: T, error?: string }`
- Automatic revalidation with `revalidatePath()`
- Built-in form handling

### Type Safety
- No `any` types used
- Prisma-generated types for database models
- Strict TypeScript configuration

## Troubleshooting

### Prisma Client Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Database File Location
SQLite database is stored at: `prisma/dev.db`

### Port Already in Use
Change port in `package.json`:
```json
"dev": "next dev -p 3001"
```

## License

MIT

## Author

Built as a technical assessment project.