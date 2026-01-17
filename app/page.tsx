import BoardList from '@/components/BoardList'
import CreateBoardForm from '@/components/CreateBoardForm'
import { getBoards } from './actions'

export default async function DashboardPage() {
  const result = await getBoards()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Boards</h1>
          <p className="text-gray-600">Manage your projects and tasks</p>
        </div>

        <div className="mb-8">
          <CreateBoardForm />
        </div>

        {result.success ? (
          <BoardList boards={result.data} />
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {result.error}
          </div>
        )}
      </div>
    </div>
  )
}