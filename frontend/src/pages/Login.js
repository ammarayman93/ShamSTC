import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Box, TextField, Button, Typography, Paper, Alert, CircularProgress, } from '@mui/material';
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.message || 'فشل تسجيل الدخول. تحقق من اسم المستخدم وكلمة المرور');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Container, { component: "main", maxWidth: "xs", children: _jsx(Box, { sx: {
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }, children: _jsxs(Paper, { elevation: 3, sx: { p: 4, width: '100%' }, children: [_jsx(Typography, { variant: "h2", align: "center", gutterBottom: true, children: "\u0634\u0631\u0643\u0629 \u0634\u0627\u0645" }), _jsx(Typography, { variant: "h1", align: "center", color: "textSecondary", gutterBottom: true, children: "S  T C" }), error && (_jsx(Alert, { severity: "error", sx: { mt: 2, mb: 2 }, children: error })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(TextField, { margin: "normal", required: true, fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645", autoComplete: "username", autoFocus: true, value: username, onChange: (e) => setUsername(e.target.value) }), _jsx(TextField, { margin: "normal", required: true, fullWidth: true, label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", type: "password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", sx: { mt: 3, mb: 2 }, disabled: loading, children: loading ? _jsx(CircularProgress, { size: 24 }) : 'تسجيل الدخول' })] }), _jsx(Typography, { variant: "body2", align: "center", color: "textSecondary", children: "demo: admin / admin123" })] }) }) }));
}
