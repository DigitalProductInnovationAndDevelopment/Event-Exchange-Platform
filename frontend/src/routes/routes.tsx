import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AppContainer } from "../components/AppContainer";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { EventsList } from "../pages/Events/EventsList";
import { EventDetails } from "../pages/Events/EventDetails";
import { EventEdit } from "../pages/Events/EventEdit";
import { EventCreate } from "../pages/Events/EventCreate";
import { EmployeesList } from "../pages/Employees/EmployeesList";
import { LoginSuccess } from "../pages/LoginSuccess.tsx";
import { EmployeeDetails } from "../pages/Employees/EmployeeDetails";
import { NotFound } from "../pages/NotFound";
import { EventParticipants } from "../pages/Events/EventParticipants.tsx";
import { EventSeatPlan } from "../pages/Events/EventSeatPlan.tsx";
import { EventSeatAllocation } from "../pages/Events/EventSeatAllocation.tsx";
import { EmployeeEdit } from "../pages/Employees/EmployeeEdit";
import { EmployeeCreate } from "../pages/Employees/EmployeeCreate";
import { ProfileEdit } from "../pages/Profile/ProfileEdit.tsx";
import { Role } from "types/employee.ts";

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
      <ProtectedRoute allowedRoles={[Role.ADMIN, Role.EMPLOYEE, Role.PARTNER, Role.VISITOR]}>
        <AppContainer />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.EMPLOYEE, Role.PARTNER, Role.VISITOR]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.EMPLOYEE, Role.PARTNER, Role.VISITOR]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.EMPLOYEE, Role.PARTNER, Role.VISITOR]}>
            <ProfileEdit />
          </ProtectedRoute>
        ),
      },
      {
        path: "events",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.EMPLOYEE, Role.PARTNER, Role.VISITOR]}>
            <EventsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "events/create",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EventCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: "events/:eventId",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.EMPLOYEE, Role.PARTNER, Role.VISITOR]}>
            <EventDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "events/:eventId/edit",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EventEdit />
          </ProtectedRoute>
        ),
      },
      {
        path: "events/:eventId/manage-participants",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EventParticipants />
          </ProtectedRoute>
        ),
      },
      {
        path: "events/:eventId/seat-plan/:schematicsId",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EventSeatPlan />
          </ProtectedRoute>
        ),
      },
      {
        path: "events/:eventId/seat-allocation/:schematicsId",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EventSeatAllocation />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EmployeesList />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees/new",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EmployeeCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees/:employeeId",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EmployeeDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees/:employeeId/edit",
        element: (
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EmployeeEdit />
          </ProtectedRoute>
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

export const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });
