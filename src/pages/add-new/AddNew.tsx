import { useState, useEffect, useRef } from "react";
import { addTaskToLocalStorage } from "../../service/taskService";
import {
  Calendar,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  deleted: boolean;
}

const AddNewTask = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLDivElement | null>(null);

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(
    new Date()
  );

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "Select a date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };


  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        dateInputRef.current &&
        !dateInputRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      dueDate,
      completed: false,
      deleted: false,
    };

    addTaskToLocalStorage(newTask);

    setSuccessMessage("Task successfully added!");
    setTimeout(() => setSuccessMessage(""), 3000);

    setTitle("");
    setDescription("");
    setDueDate("");
    setError("");
  };

  const handleDateChange = (date: Date): void => {
    setDueDate(date.toISOString().split("T")[0]);
    setShowCalendar(false);
  };

  // Handle previous month 
  const handlePrevMonth = (e: React.MouseEvent): void => {
    e.stopPropagation(); 
    setCurrentCalendarDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Handle next month 
  const handleNextMonth = (e: React.MouseEvent): void => {
    e.stopPropagation(); 
    setCurrentCalendarDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Close calendar button 
  const handleCloseCalendar = (e: React.MouseEvent): void => {
    e.stopPropagation(); 
    setShowCalendar(false);
  };

  // calendar grid
  const renderCalendar = () => {
    const today = new Date();
    const selectedDate = dueDate ? new Date(dueDate) : null;

    const currentMonth = new Date(currentCalendarDate);
    currentMonth.setDate(1);

    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const startDay = currentMonth.getDay();
    const monthName = currentMonth.toLocaleString("default", { month: "long" });
    const year = currentMonth.getFullYear();


    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null); 
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Generate weeks
    const weeks: any = [];
    let week: any = [];

    days.forEach((day, index) => {
      week.push(day);
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        weeks.push([...week]);
        week = [];
      }
    });

    const isToday = (day: number): boolean => {
      if (!day) return false;
      const date = new Date(currentMonth);
      date.setDate(day);
      return date.toDateString() === today.toDateString();
    };

    const isSelected = (day: number): boolean => {
      if (!day || !selectedDate) return false;
      const date = new Date(currentMonth);
      date.setDate(day);
      return date.toDateString() === selectedDate.toDateString();
    };

    // Handle day selection 
    const handleDayClick = (day: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (day) {
        const date = new Date(currentMonth);
        date.setDate(day);
        handleDateChange(date);
      }
    };

    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/40 p-4 w-64 sm:w-72"
        ref={calendarRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            type="button" 
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="font-bold text-gray-800 dark:text-gray-200">
            {monthName} {year}
          </div>

          <div className="flex items-center">
            <button
              onClick={handleNextMonth}
              type="button" 
              className="p-1 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={handleCloseCalendar}
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week: any, weekIndex: any) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day: any, dayIndex: number) => (
              <div
                key={dayIndex}
                className={`
                  h-8 w-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors duration-200
                  ${!day ? "invisible" : ""}
                  ${
                    isToday(day)
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                      : ""
                  }
                  ${
                    isSelected(day)
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }
                `}
                onClick={(e) => day && handleDayClick(day, e)}
              >
                {day}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="p-5 sm:p-6 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/40 rounded-lg transition-colors duration-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Create New Task
        </h2>

        {/* Status messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md flex items-center">
            <AlertCircle
              size={20}
              className="text-red-500 dark:text-red-400 mr-2"
            />
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-md flex items-center">
            <Check
              size={20}
              className="text-green-500 dark:text-green-400 mr-2"
            />
            <p className="text-green-600 dark:text-green-300 text-sm">
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title*
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 min-h-32"
              placeholder="Add details about this task..."
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <div className="relative" ref={dateInputRef}>
              <div
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition duration-200 bg-white dark:bg-gray-700"
              >
                <div className="flex items-center">
                  <Calendar
                    size={18}
                    className="text-gray-500 dark:text-gray-400 mr-2"
                  />
                  <span
                    className={`${
                      dueDate
                        ? "text-gray-800 dark:text-gray-200"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {formatDisplayDate(dueDate)}
                  </span>
                </div>
              </div>

              {showCalendar && (
                <div
                  className="absolute top-full  border-gray-400 dark:border-blue-200 border-[1px]  mb-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderCalendar()}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-12">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Create Task
            </button>

            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setDueDate("");
                setError("");
              }}
              className="w-full sm:w-auto mt-3 sm:mt-0 py-3 px-5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewTask;
