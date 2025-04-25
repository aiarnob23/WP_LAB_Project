import { useState, useEffect } from "react";
import {
  getTasksFromLocalStorage,
  moveToTrash,
} from "../../service/taskService";
import { Trash2, Calendar, Check, Filter, SortDesc } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  deleted: boolean;
}

export default function CompletedTasks() {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alphabetical">(
    "recent"
  );
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  useEffect(() => {
    loadCompletedTasks();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [completedTasks, filter, sortBy]);

  const loadCompletedTasks = () => {
    const storedCompletedTasks = getTasksFromLocalStorage()
      .filter((task) => task.completed && !task.deleted)
      .map((task:Task) => {
        if (!task.completedDate) {
          return {
            ...task,
            completedDate:
              task.dueDate || new Date().toISOString().split("T")[0],
          };
        }
        return task;
      });

    setCompletedTasks(storedCompletedTasks);
  };

  const handleMoveToTrash = (taskId: string) => {
    const taskToDelete = completedTasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    moveToTrash(taskId);
    setCompletedTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskId)
    );

    setNotification({
      message: `"${taskToDelete.title}" moved to trash`,
      type: "warning",
    });
  };

  const applyFiltersAndSort = () => {
    let result = [...completedTasks];

    // Apply filters
    if (filter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0); // Normalize time portion

        result = result.filter((task) => {
          if (!task.completedDate) return false;
          const taskDate = new Date(task.completedDate);
          taskDate.setHours(0, 0, 0, 0); // Normalize time portion
          return taskDate >= weekAgo && taskDate <= today;
        });
      } else if (filter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0); // Normalize time portion

        result = result.filter((task) => {
          if (!task.completedDate) return false;
          const taskDate = new Date(task.completedDate);
          taskDate.setHours(0, 0, 0, 0); // Normalize time portion
          return taskDate >= monthAgo && taskDate <= today;
        });
      }
    }

    // Apply sorting
    if (sortBy === "recent") {
      result.sort((a, b) => {
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "oldest") {
      result.sort((a, b) => {
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return dateA - dateB;
      });
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredTasks(result);
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
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <Trash2 className="w-5 h-5 mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/40 rounded-lg overflow-hidden transition-colors duration-200">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl md:text-3xl mr-5 font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">
            Completed Tasks
          </h2>

          <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsFilterMenuOpen(!isFilterMenuOpen);
                  setIsSortMenuOpen(false);
                }}
                className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>

              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setIsFilterMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setFilter("week");
                        setIsFilterMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => {
                        setFilter("month");
                        setIsFilterMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      This Month
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSortMenuOpen(!isSortMenuOpen);
                  setIsFilterMenuOpen(false);
                }}
                className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <SortDesc className="w-4 h-4 mr-2" />
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </button>

              {isSortMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSortBy("recent");
                        setIsSortMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Most Recent
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("oldest");
                        setIsSortMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Oldest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("alphabetical");
                        setIsSortMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Alphabetical
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Check className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                No completed tasks
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Complete a task to see it here
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <li key={task.id} className="py-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <div className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-green-500 dark:bg-green-600 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 truncate">
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          {task.completedDate && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(task.completedDate)}
                            </span>
                          )}
                          <button
                            onClick={() => handleMoveToTrash(task.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                            title="Move to Trash"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
