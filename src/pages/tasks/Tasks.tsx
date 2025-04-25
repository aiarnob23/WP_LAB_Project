import { useState, useEffect } from "react";
import {
  getTasksFromLocalStorage,
  moveToTrash,
  saveTasksToLocalStorage,
} from "../../service/taskService";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  deleted: boolean;
  completionMessage?: boolean;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadTasks = () => {
    const storedTasks = getTasksFromLocalStorage().filter(
      (task) => !task.completed && !task.deleted
    );
    setTasks(storedTasks);
  };

  const handleToggleComplete = (taskId: string) => {
    const taskToComplete = tasks.find((task) => task.id === taskId);
    if (!taskToComplete) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completionMessage: true } : task
      )
    );

    setNotification({
      message: `"${taskToComplete.title}" marked as completed`,
      type: "success",
    });

    setTimeout(() => {
      const updatedTasks = getTasksFromLocalStorage().map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      );
      saveTasksToLocalStorage(updatedTasks);

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }, 2000);
  };

  const handleDelete = (taskId: string) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    moveToTrash(taskId);
    setTasks(tasks.filter((task) => task.id !== taskId));

    setNotification({
      message: `"${taskToDelete.title}" moved to trash`,
      type: "warning",
    });
  };

  const filterTasks = () => {
    if (filter === "all") return tasks;

    const today = new Date().toISOString().split("T")[0];

    if (filter === "today") {
      return tasks.filter((task) => task.dueDate === today);
    } else {
      return tasks.filter((task) => task.dueDate > today);
    }
  };

  const getTaskDueStatus = (dueDate: string) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (!dueDate) return "";
    if (dueDate < today)
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    if (dueDate === today)
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
    if (dueDate === tomorrowStr)
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredTasks = filterTasks();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-md ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/40 rounded-lg overflow-hidden transition-colors duration-200">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl md:text-3xl mr-5 font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">
            My Tasks
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === "all"
                  ? "border-2 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === "today"
                  ? "border-2 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === "upcoming"
                  ? "border-2 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>

        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                ></path>
              </svg>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                No tasks to show
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Add a new task to get started
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className={`py-4 transition-all duration-300 ${
                    task.completionMessage
                      ? "bg-green-50 dark:bg-green-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={task.completionMessage || task.completed}
                        onChange={() => handleToggleComplete(task.id)}
                        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                        disabled={task.completionMessage}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-lg font-medium text-gray-800 dark:text-gray-200 truncate ${
                            task.completionMessage
                              ? "line-through text-gray-500 dark:text-gray-500"
                              : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {task.dueDate && !task.completionMessage && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskDueStatus(
                                task.dueDate
                              )}`}
                            >
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.completionMessage ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                            >
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {task.description && (
                        <p
                          className={`mt-1 text-sm ${
                            task.completionMessage
                              ? "text-gray-400 dark:text-gray-500 line-through"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
