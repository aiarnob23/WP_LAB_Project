import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 mt-16 px-6 py-8 md:mt-[30px] md:ml-[300px]">
        <Outlet />
      </div>
    </div>
  );
}
