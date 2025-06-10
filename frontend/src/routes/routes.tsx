import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { EventsList } from '../pages/Events/EventsList';
import { EventDetails } from '../pages/Events/EventDetails';
import { EmployeesList } from '../pages/Employees/EmployeesList';
import { EmployeeDetails } from '../pages/Employees/EmployeeDetails';
import { NotFound } from '../pages/NotFound';

const routes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/events',
    element: (
      <ProtectedRoute>
        <EventsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/events/:eventId',
    element: (
      <ProtectedRoute>
        <EventDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employees',
    element: (
      <ProtectedRoute>
        <EmployeesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employees/:employeeId',
    element: (
      <ProtectedRoute>
        <EmployeeDetails />
      </ProtectedRoute>
    ),
  },

  // Not found route
  {
    path: '*',
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes); 