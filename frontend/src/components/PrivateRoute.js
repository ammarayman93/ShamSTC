import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
export default function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", children: _jsx(CircularProgress, {}) }));
    }
    return isAuthenticated ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/login" });
}
