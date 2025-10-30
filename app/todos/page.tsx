import { TodoList } from "@/components/todo-list"

export default function TodosPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-balance">Todo List</h1>
        <p className="text-muted-foreground text-balance">Manage your tasks and track your progress</p>
      </div>

      <TodoList />
    </div>
  )
}
