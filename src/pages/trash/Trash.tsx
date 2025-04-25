import { useState, useEffect } from "react";
import {
  getTasksFromLocalStorage,
  deleteFromTrash,
  restoreTask,
} from "../../service/taskService";
import { Trash2, RotateCcw, X, Calendar } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  deleted: boolean;
}

export default function Trash() {
  const [trash, setTrash] = useState<Task[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    loadTrashItems();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadTrashItems = () => {
    const storedTrash = getTasksFromLocalStorage().filter(
      (task) => task.deleted
    );
    setTrash(storedTrash);
  };

  const handleDeleteFromTrash = (taskId: string) => {
    const taskToDelete = trash.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    deleteFromTrash(taskId);
    setTrash(trash.filter((task) => task.id !== taskId));

    setNotification({
      message: `"${taskToDelete.title}" permanently deleted`,
      type: "error",
    });
  };

  const handleRestore = (taskId: string) => {
    const taskToRestore = trash.find((task) => task.id === taskId);
    if (!taskToRestore) return;

    restoreTask(taskId);
    setTrash(trash.filter((task) => task.id !== taskId));

    setNotification({
      message: `"${taskToRestore.title}" restored successfully`,
      type: "success",
    });
  };

  const handleClearAllTrash = () => {
    if (trash.length === 0) return;

    if (
      confirm("Are you sure you want to permanently delete all items in trash?")
    ) {
      trash.forEach((task) => deleteFromTrash(task.id));
      setTrash([]);

      setNotification({
        message: "All items permanently deleted",
        type: "warning",
      });
    }
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
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <RotateCcw className="w-5 h-5 mr-2" />
            ) : notification.type === "error" ? (
              <X className="w-5 h-5 mr-2" />
            ) : (
              <Trash2 className="w-5 h-5 mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/40 rounded-lg overflow-hidden transition-colors duration-200">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0 flex items-center">
            <Trash2
              className="mr-2 text-gray-700 dark:text-gray-300"
              size={28}
            />
            Trash
          </h2>

          {trash.length > 0 && (
            <button
              onClick={handleClearAllTrash}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <Trash2 className="mr-1" size={16} />
              Empty Trash
            </button>
          )}
        </div>

        <div className="p-6">
          {trash.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Trash is empty
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Items moved to trash will appear here
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {trash.map((task) => (
                <li key={task.id} className="py-4">
                  <div className="flex flex-col sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 line-through opacity-70 truncate">
                          {task.title}
                        </h3>
                        <div className="mt-2 sm:mt-0">
                          {task.dueDate && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 opacity-70 mr-2">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            Deleted
                          </span>
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 opacity-70">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-row gap-3 justify-end">
                        <button
                          onClick={() => handleRestore(task.id)}
                          className="py-2 px-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 flex items-center text-sm"
                          title="Restore Task"
                        >
                          <RotateCcw size={16} className="mr-1" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFromTrash(task.id)}
                          className="py-2 px-3 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200 flex items-center text-sm"
                          title="Delete Permanently"
                        >
                          <Trash2 size={16} className="mr-1" />
                          <span>Delete</span>
                        </button>
                      </div>
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
