import { getBoard } from '@/app/actions'
import CreateTaskForm from '@/components/CreateTaskForm'
import TaskColumn from '@/components/TaskColumn'
import { Task, TaskStatus } from '@/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Helper function to get timestamp (avoids React purity lint errors)
function getTimestamp() {
  return Date.now()
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function BoardDetailPage({ params }: Props) {
  const { id } = await params
  // #region agent log
  const timestamp1 = getTimestamp()
  fetch('http://127.0.0.1:7242/ingest/8b9b42c1-c8a7-4ac1-865c-e3af5c066549',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/board/[id]/page.tsx:12',message:'Function entry',data:{boardId:id},timestamp:timestamp1,sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const result = await getBoard(id)
  // #region agent log
  const timestamp2 = getTimestamp()
  fetch('http://127.0.0.1:7242/ingest/8b9b42c1-c8a7-4ac1-865c-e3af5c066549',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/board/[id]/page.tsx:14',message:'After getBoard call',data:{success:result.success,hasData:result.success?!!result.data:false,tasksCount:result.success?result.data?.tasks?.length:undefined},timestamp:timestamp2,sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  if (!result.success || !result.data) {
    // #region agent log
    const timestamp3 = getTimestamp()
    fetch('http://127.0.0.1:7242/ingest/8b9b42c1-c8a7-4ac1-865c-e3af5c066549',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/board/[id]/page.tsx:16',message:'Board not found branch',data:{success:result.success,hasData:result.success?!!result.data:false},timestamp:timestamp3,sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    notFound()
  }

  const board = result.data
  // #region agent log
  const timestamp4 = getTimestamp()
  fetch('http://127.0.0.1:7242/ingest/8b9b42c1-c8a7-4ac1-865c-e3af5c066549',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/board/[id]/page.tsx:20',message:'Board data extracted',data:{boardId:board.id,boardName:board.name,tasksLength:board.tasks?.length,tasksType:typeof board.tasks,firstTaskType:board.tasks?.[0]?typeof board.tasks[0]:'none'},timestamp:timestamp4,sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  // Group tasks by status
  // #region agent log
  const timestamp5 = getTimestamp()
  fetch('http://127.0.0.1:7242/ingest/8b9b42c1-c8a7-4ac1-865c-e3af5c066549',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/board/[id]/page.tsx:23',message:'Before filtering tasks',data:{totalTasks:board.tasks.length},timestamp:timestamp5,sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: board.tasks.filter((t: Task) => t.status === 'todo'),
    in_progress: board.tasks.filter((t: Task) => t.status === 'in_progress'),
    done: board.tasks.filter((t: Task) => t.status === 'done')
  }
  // #region agent log
  const timestamp6 = getTimestamp()
  fetch('http://127.0.0.1:7242/ingest/8b9b42c1-c8a7-4ac1-865c-e3af5c066549',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/board/[id]/page.tsx:27',message:'After filtering tasks',data:{todoCount:tasksByStatus.todo.length,inProgressCount:tasksByStatus.in_progress.length,doneCount:tasksByStatus.done.length},timestamp:timestamp6,sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {board.name}
          </h1>
          
          {board.description && (
            <p className="text-gray-600">{board.description}</p>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            {board.tasks.length} total tasks
          </p>
        </div>

        {/* Create Task Form */}
        <div className="mb-8">
          <CreateTaskForm boardId={board.id} />
        </div>

        {/* Task Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To Do"
            status="todo"
            tasks={tasksByStatus.todo}
            boardId={board.id}
          />
          <TaskColumn
            title="In Progress"
            status="in_progress"
            tasks={tasksByStatus.in_progress}
            boardId={board.id}
          />
          <TaskColumn
            title="Done"
            status="done"
            tasks={tasksByStatus.done}
            boardId={board.id}
          />
        </div>
      </div>
    </div>
  )
}