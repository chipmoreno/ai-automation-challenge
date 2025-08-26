"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Todo = {
  id: number;
  task: string;
  is_complete: boolean;
  user_identifier: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [userIdentifier, setUserIdentifier] = useState("test@example.com");

  useEffect(() => {
    if (userIdentifier) {
      fetchTodos();
    }
  }, [userIdentifier]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      setTodos(data);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ task: newTask, user_identifier: userIdentifier }])
      .select();

    if (error) {
      console.error("Error adding todo:", error);
    } else if (data) {
      setTodos([...todos, data[0]]);
      setNewTask("");
    }
  };

  const updateTodoStatus = async (id: number, is_complete: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_complete })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo status:", error);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_complete } : todo
        )
      );
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo({ ...todo });
  };

  const updateTodoText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !editingTodo.task.trim()) return;

    const { data, error } = await supabase
      .from("todos")
      .update({ task: editingTodo.task })
      .eq("id", editingTodo.id)
      .select();

    if (error) {
      console.error("Error updating todo text:", error);
    } else if (data) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingTodo.id ? data[0] : todo
        )
      );
      setEditingTodo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Todo List</h1>

        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="userIdentifier" className="block text-sm font-medium mb-2">
              Your Name/Email (User Identifier)
            </label>
            <input
              id="userIdentifier"
              type="text"
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., yourname@example.com"
            />
          </div>

          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded"
              placeholder="Add a new task..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add
            </button>
          </form>

          <div>
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-2 border-b"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.is_complete}
                    onChange={() =>
                      updateTodoStatus(todo.id, !todo.is_complete)
                    }
                    className="h-5 w-5 text-blue-500 rounded"
                  />
                  <span
                    className={`ml-4 text-lg ${
                      todo.is_complete ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.task}
                  </span>
                </div>
                <button
                  onClick={() => handleEdit(todo)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {editingTodo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
              <form onSubmit={updateTodoText} className="flex gap-2">
                <input
                  type="text"
                  value={editingTodo.task}
                  onChange={(e) =>
                    setEditingTodo({ ...editingTodo, task: e.target.value })
                  }
                  className="flex-grow p-2 border border-gray-300 rounded"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTodo(null)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}