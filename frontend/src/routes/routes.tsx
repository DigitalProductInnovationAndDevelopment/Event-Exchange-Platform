import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppContainer } from '../components/AppContainer';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { EventsList } from '../pages/Events/EventsList';
import { EventDetails } from '../pages/Events/EventDetails';
import { EventEdit } from '../pages/Events/EventEdit';
import { EventCreate } from '../pages/Events/EventCreate';
import { EmployeesList } from '../pages/Employees/EmployeesList';
import { LoginSuccess } from '../pages/LoginSuccess.tsx';
import { EmployeeDetails } from '../pages/Employees/EmployeeDetails';
import { NotFound } from '../pages/NotFound';

const routes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login_success',
    element: <LoginSuccess />,
  },

  // Protected routes with layout
  {
    path: '/',
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
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'events',
        element: <EventsList />,
      },
      {
        path: 'events/create',
        element: <EventCreate />,
      },
      {
        path: 'events/:eventId',
        element: <EventDetails />,
      },
      {
        path: 'events/:eventId/edit',
        element: <EventEdit />,
      },
      {
        path: 'employees',
        element: <EmployeesList />,
      },
      {
        path: 'employees/:employeeId',
        element: <EmployeeDetails />,
      },
    ],
  },

  // Not found route
  {
    path: '*',
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
