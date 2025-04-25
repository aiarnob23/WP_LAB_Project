interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  deleted: boolean;
}

// Get all tasks from localStorage
export const getTasksFromLocalStorage = (): Task[] => {
  const tasks = localStorage.getItem("tasks");
  if (tasks) {
    return JSON.parse(tasks);
  }
  return [];
};

// Save all tasks to localStorage
export const saveTasksToLocalStorage = (tasks: Task[]): void => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Add a new task to localStorage
export const addTaskToLocalStorage = (task: Task): void => {
  const tasks = getTasksFromLocalStorage();
  tasks.push(task);
  saveTasksToLocalStorage(tasks);
};

// Move task to trash (mark as deleted)
export const moveToTrash = (taskId: string): void => {
  let tasks = getTasksFromLocalStorage();
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, deleted: true } : task
  );
  saveTasksToLocalStorage(tasks);
};

// Permanently delete task from trash
export const deleteFromTrash = (taskId: string): void => {
  let tasks = getTasksFromLocalStorage();
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasksToLocalStorage(tasks);
};

// Restore task from trash
export const restoreTask = (taskId: string): void => {
  let tasks = getTasksFromLocalStorage();
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, deleted: false } : task
  );
  saveTasksToLocalStorage(tasks);
};
