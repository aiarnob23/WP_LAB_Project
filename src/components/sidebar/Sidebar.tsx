import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Menu,
  Plus,
  Trash2,
  CheckCircle,
  Sun,
  Moon,
  X,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme : "light";
  });

  const location = useLocation();

  // Set theme in localStorage and document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebarOnMobile = () => {
    if (isMobile) setIsOpen(false);
  };

  const menuItems = [
    { name: "Tasks", icon: <FileText size={20} />, path: "/" },
    { name: "Add New", icon: <Plus size={20} />, path: "/add-new" },
    {
      name: "Completed",
      icon: <CheckCircle size={20} />,
      path: "/completed",
    },
    { name: "Trash", icon: <Trash2 size={20} />, path: "/trash" },
  ];

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <>
      {/* Mobile Toggle Button - Now positioned OUTSIDE the sidebar */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-600/50 transition-all duration-300"
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>
      )}

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-screen bg-blue-950 dark:bg-gray-800 text-white z-50 transition-all duration-300 ease-in-out shadow-xl flex flex-col ${
            isOpen
              ? "translate-x-0 w-64"
              : isMobile
              ? "-translate-x-full w-64"
              : "w-16"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full px-5 py-6">
            {isOpen && (
              <h2 className="text-xl font-bold text-white">Task Manager</h2>
            )}
            {!isOpen && !isMobile && (
              <div className="mx-auto">
                <FileText size={24} className="text-blue-300" />
              </div>
            )}

            {/* Close button for mobile */}
            {isOpen && isMobile && (
              <button
                onClick={toggleSidebar}
                className="text-blue-300 hover:text-white"
                aria-label="Close sidebar"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-grow overflow-y-auto pt-5 pb-4 px-3">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={closeSidebarOnMobile}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isOpen ? "" : "justify-center"
                      } ${
                        isActive
                          ? "bg-blue-800/80 dark:bg-blue-900 border-blue-400 border-[0.5px] text-white shadow-md"
                          : "text-blue-100 hover:bg-blue-800/50 dark:hover:bg-gray-700"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span
                        className={`flex-shrink-0 ${
                          isActive
                            ? "text-white"
                            : "text-blue-300 dark:text-blue-200"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="ml-3 font-medium text-sm">
                          {item.name}
                        </span>
                      )}
                      {!isOpen && !isMobile && (
                        <span className="sr-only">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme Toggle Button - Improved with icons */}
          <div className="p-4 flex justify-start items-center">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-800/30 dark:bg-gray-700/50 text-blue-300 dark:text-gray-300 hover:bg-blue-800/50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <>
                  <Moon size={16} />
                  {isOpen && <span>Dark Mode</span>}
                </>
              ) : (
                <>
                  <Sun size={16} />
                  {isOpen && <span>Light Mode</span>}
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          {isOpen && (
            <div className="p-4 border-t border-blue-800/50 dark:border-gray-700 text-xs text-blue-300 dark:text-gray-400 flex justify-between items-center">
              <span>© 2025 TaskMaster</span>
              <span>v1.0</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
