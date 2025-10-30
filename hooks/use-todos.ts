"use client"

import { useState, useEffect } from "react"
import { getTodos, addTodo, updateTodo, deleteTodo, updateDailyStats } from "@/lib/supabase-storage"
import type { Todo } from "@/lib/types"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "pomodoros">("createdAt")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const loadedTodos = await getTodos()
      setTodos(loadedTodos)
    } catch (error) {
      console.error("Failed to load todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async (
    title: string,
    options?: {
      description?: string
      priority?: "low" | "medium" | "high"
      estimatedPomodoros?: number
      tags?: string[]
    },
  ) => {
    try {
      const newTodo = await addTodo({
        title,
        description: options?.description,
        completed: false,
        priority: options?.priority || "medium",
        estimatedPomodoros: options?.estimatedPomodoros,
        tags: options?.tags || [],
      })
      setTodos((prev) => [newTodo, ...prev])
      return newTodo
    } catch (error) {
      console.error("Failed to create todo:", error)
      throw error
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    try {
      const newCompleted = !todo.completed
      await updateTodo(id, {
        completed: newCompleted,
      })

      if (newCompleted) {
        await updateDailyStats({ completedTodos: 1 })
      }

      await loadTodos()
    } catch (error) {
      console.error("Failed to toggle todo:", error)
      throw error
    }
  }

  const editTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      await updateTodo(id, updates)
      await loadTodos()
    } catch (error) {
      console.error("Failed to edit todo:", error)
    }
  }

  const removeTodo = async (id: string) => {
    try {
      await deleteTodo(id)
      await loadTodos()
    } catch (error) {
      console.error("Failed to remove todo:", error)
    }
  }

  const getFilteredTodos = () => {
    let filtered = todos

    // Apply filter
    if (filter === "active") {
      filtered = filtered.filter((t) => !t.completed)
    } else if (filter === "completed") {
      filtered = filtered.filter((t) => t.completed)
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortBy === "pomodoros") {
        return b.pomodoroCount - a.pomodoroCount
      } else {
        return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    return filtered
  }

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
    totalPomodoros: todos.reduce((sum, t) => sum + t.pomodoroCount, 0),
  }

  return {
    todos: getFilteredTodos(),
    allTodos: todos,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    createTodo,
    toggleTodo,
    editTodo,
    removeTodo,
    stats,
    refresh: loadTodos,
    loading,
  }
}
