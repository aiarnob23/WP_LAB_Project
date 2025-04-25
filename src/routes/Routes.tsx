import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Tasks from "../pages/tasks/Tasks";
import AddNewTask from "../pages/add-new/AddNew";
import CompletedTasks from "../pages/completed/Completed";
import Trash from "../pages/trash/Trash";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Tasks/>,
      },
      {
        path: "/add-new",
        element: <AddNewTask/>,
      },
      {
        path: "/completed",
        element: <CompletedTasks/>,
      },
      {
        path: "/trash",
        element: <Trash/>,
      },
    ],
  },
]);

export default router;
