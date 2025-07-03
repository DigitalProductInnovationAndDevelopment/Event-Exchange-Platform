import type {RouteObject} from "react-router-dom";
import {createBrowserRouter} from "react-router-dom";
import {ProtectedRoute} from "../components/ProtectedRoute";
import {AppContainer} from "../components/AppContainer";
import {Login} from "../pages/Login";
import {Dashboard} from "../pages/Dashboard";
import {EventsList} from "../pages/Events/EventsList";
import {EventDetails} from "../pages/Events/EventDetails";
import {EventEdit} from "../pages/Events/EventEdit";
import {EventCreate} from "../pages/Events/EventCreate";
import {EmployeesList} from "../pages/Employees/EmployeesList";
import {LoginSuccess} from "../pages/LoginSuccess.tsx";
import {EmployeeDetails} from "../pages/Employees/EmployeeDetails";
import {NotFound} from "../pages/NotFound";
import {CanvasProvider} from "../components/canvas/contexts/CanvasContext.tsx";
import KonvaCanvas from "../components/canvas/KonvaCanvas.tsx";
import {EventParticipants} from "../pages/Events/EventParticipants.tsx";
import {EventSeatPlan} from "../pages/Events/EventSeatPlan.tsx";
import {EventSeatAllocation} from "../pages/Events/EventSeatAllocation.tsx";
import {EmployeeEdit} from "../pages/Employees/EmployeeEdit";
import {EmployeeCreate} from "../pages/Employees/EmployeeCreate";

const routes: RouteObject[] = [
  // Public routes
  {
      path: "/login",
    element: <Login />,
  },
  {
      path: "/login_success",
    element: <LoginSuccess />,
  },

  // Protected routes with layout
  {
      path: "/",
    element: (
      <ProtectedRoute>
        <AppContainer />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
          path: "dashboard",
        element: <Dashboard />,
      },
      {
          path: "events",
        element: <EventsList />,
      },
      {
          path: "events/create",
        element: <EventCreate />,
      },
      {
          path: "events/:eventId",
        element: <EventDetails />,
      },
      {
          path: "events/:eventId/edit",
        element: <EventEdit />,
      },
      {
          path: "events/:eventId/manage-participants",
        element: <EventParticipants />,
      },
      {
          path: "events/:eventId/seat-plan/:schematicsId",
        element: <EventSeatPlan />,
      },
      {
          path: "events/:eventId/seat-allocation",
        element: <EventSeatAllocation />,
      },
      {
          path: "employees",
        element: <EmployeesList />,
      },
      {
          path: "employees/new",
        element: <EmployeeCreate />,
      },
      {
          path: "employees/:employeeId",
        element: <EmployeeDetails />,
      },
      // TODO: Unnecessary route, remove it
      {
          path: "employees/:employeeId/edit",
        element: <EmployeeEdit />,
      },
      {
          path: "canvas/:schematicsId",
          element: (
              <CanvasProvider>
                  <KonvaCanvas/>
              </CanvasProvider>
          ),
      },
    ],
  },

  // Not found route
  {
      path: "*",
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
