import { createBrowserRouter } from 'react-router-dom';

import AdminRoutes from './AdminRoutes';
import AccountantRoutes from './AccountantRoutes';

import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Login';
import ErrorPage from '../pages/ErrorPage';
import HomePage from '../pages/HomePage';

const Router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/',
        element: <AuthLayout />, 
        children: [
            { path: 'login', element: <Login /> },
        ]
    },
    {
        path: '/admin/*',
        element: <AdminRoutes />,
    },
    {
        path: '/accountant/*',
        element: <AccountantRoutes/>
    },
    {
        path: '*',
        element: <ErrorPage />,
    },
]);

export default Router;
