"use client"

import type React from "react"

import { useState } from "react"
import { useTodos } from "@/hooks/use-todos"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Pencil, Trash2, Timer, Filter, ArrowUpDown } from "lucide-react"
import { TodoDialog } from "./todo-dialog"
import type { Todo } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function TodoList() {
  const { todos, filter, setFilter, sortBy, setSortBy, createTodo, toggleTodo, editTodo, removeTodo, stats } =
    useTodos()
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoTitle.trim()) {
      createTodo(newTodoTitle.trim())
      setNewTodoTitle("")
    }
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingTodo(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-warning/10 text-warning-foreground border-warning/20"
      case "low":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const handleToggle = async (todoId: string) => {
    console.log("[v0] Toggling todo:", todoId)
    try {
      await toggleTodo(todoId)
      console.log("[v0] Toggle successful")
    } catch (error) {
      console.error("[v0] Toggle failed:", error)
      toast({
        title: "Failed to update todo",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-headline-small font-bold">{stats.total}</div>
          <div className="text-body-small text-muted-foreground">Total Tasks</div>
        </Card>
        <Card className="p-4">
          <div className="text-headline-small font-bold text-primary">{stats.active}</div>
          <div className="text-body-small text-muted-foreground">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-headline-small font-bold text-success">{stats.completed}</div>
          <div className="text-body-small text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-4">
          <div className="text-headline-small font-bold text-accent">{stats.totalPomodoros}</div>
          <div className="text-body-small text-muted-foreground">Pomodoros</div>
        </Card>
      </div>

      {/* Quick Add */}
      <Card className="p-4">
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <Input
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter: {filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("all")}>All Tasks</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("active")}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowUpDown className="h-4 w-4" />
              Sort: {sortBy}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy("createdAt")}>Date Created</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("priority")}>Priority</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("pomodoros")}>Pomodoros</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-body-medium text-muted-foreground">
              No tasks found. Add your first task to get started!
            </p>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id} className="p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleToggle(todo.id)}
                  className="mt-1"
                  aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-title-medium leading-relaxed ${todo.completed ? "text-muted-foreground line-through" : ""}`}
                    >
                      {todo.title}
                    </h3>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(todo)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => removeTodo(todo.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {todo.description && (
                    <p className="text-body-medium text-muted-foreground leading-relaxed">{todo.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                      {todo.priority}
                    </Badge>

                    {todo.pomodoroCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Timer className="h-3 w-3" />
                        {todo.pomodoroCount}
                        {todo.estimatedPomodoros && ` / ${todo.estimatedPomodoros}`}
                      </Badge>
                    )}

                    {todo.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Todo Dialog */}
      <TodoDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        todo={editingTodo}
        onSave={(updates) => {
          if (editingTodo) {
            editTodo(editingTodo.id, updates)
          } else {
            createTodo(updates.title, {
              description: updates.description,
              priority: updates.priority,
              estimatedPomodoros: updates.estimatedPomodoros,
              tags: updates.tags,
            })
          }
          handleDialogClose()
        }}
      />
    </div>
  )
}
