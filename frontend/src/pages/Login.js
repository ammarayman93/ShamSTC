import { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError((err && err.message) || 'فشل تسجيل الدخول');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Container, { maxWidth: "sm", children: _jsx(Box, { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", children: _jsxs(Paper, { elevation: 3, sx: { p: 4, width: '100%', borderRadius: 3 }, children: [_jsx(Typography, { variant: "h4", align: "center", fontWeight: 800, gutterBottom: true, children: "\u0634\u0631\u0643\u0629 \u0634\u0627\u0645" }), _jsx(Typography, { variant: "h5", align: "center", color: "text.secondary", gutterBottom: true, children: "STC" }), error && (_jsx(Alert, { severity: "error", sx: { mt: 2, mb: 2 }, children: error })), _jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [_jsx(TextField, { margin: "normal", required: true, fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645", autoComplete: "username", autoFocus: true, value: username, onChange: (e) => setUsername(e.target.value) }), _jsx(TextField, { margin: "normal", required: true, fullWidth: true, label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", type: "password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", sx: { mt: 3, mb: 1, py: 1.2 }, disabled: loading, children: loading ? _jsx(CircularProgress, { size: 24, color: "inherit" }) : "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" })] })] }) }) }));
}
