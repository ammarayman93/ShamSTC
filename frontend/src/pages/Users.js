import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Button, Chip, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Grid, Alert, CircularProgress, } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, } from '@mui/icons-material';
import api from '../services/api';
const rolePermissions = {
    Admin: ['all'],
    Accountant: ['financial', 'reports', 'invoices'],
    Employee: ['clients', 'subscriptions'],
    Support: ['clients', 'tickets'],
};
export default function Users() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        phone: '',
        email: '',
        role: 'Employee',
    });
    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage, search]);
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users', {
                params: { page: page + 1, pageSize: rowsPerPage, search },
            });
            if (response.data.success) {
                setUsers(response.data.data.data);
                setTotal(response.data.data.total);
            }
        }
        catch (error) {
            console.error('Error fetching users:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenDialog = (user) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                fullName: user.fullName,
                phone: user.phone,
                email: user.email || '',
                role: user.role,
            });
        }
        else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                fullName: '',
                phone: '',
                email: '',
                role: 'Employee',
            });
        }
        setDialogOpen(true);
    };
    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    role: formData.role,
                });
                setSuccess('تم تحديث المستخدم بنجاح');
            }
            else {
                await api.post('/users', formData);
                setSuccess('تم إضافة المستخدم بنجاح');
            }
            setTimeout(() => setSuccess(''), 3000);
            setDialogOpen(false);
            fetchUsers();
        }
        catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            try {
                await api.delete(`/users/${id}`);
                setSuccess('تم حذف المستخدم بنجاح');
                fetchUsers();
            }
            catch (error) {
                setError('حدث خطأ أثناء الحذف');
            }
        }
    };
    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return 'error';
            case 'Accountant': return 'warning';
            case 'Employee': return 'info';
            case 'Support': return 'success';
            default: return 'default';
        }
    };
    const getRoleName = (role) => {
        switch (role) {
            case 'Admin': return 'مدير';
            case 'Accountant': return 'محاسب';
            case 'Employee': return 'موظف';
            case 'Support': return 'دعم فني';
            default: return role;
        }
    };
    return (_jsxs(Box, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h4", children: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenDialog(), children: "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u062F\u064A\u062F" })] }), success && _jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsx(Paper, { sx: { p: 2, mb: 2 }, children: _jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "\u0628\u062D\u062B \u0628\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u060C \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644...", value: search, onChange: (e) => setSearch(e.target.value), InputProps: { startAdornment: _jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) }) } }) }), _jsxs(TableContainer, { component: Paper, children: [_jsxs(Table, { children: [_jsx(TableHead, { sx: { bgcolor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "#" }), _jsx(TableCell, { children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" }), _jsx(TableCell, { children: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644" }), _jsx(TableCell, { children: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" }), _jsx(TableCell, { children: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(TableCell, { children: "\u0622\u062E\u0631 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644" }), _jsx(TableCell, { children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: users.map((user, idx) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: idx + 1 + page * rowsPerPage }), _jsx(TableCell, { children: user.username }), _jsx(TableCell, { children: user.fullName }), _jsx(TableCell, { children: user.phone }), _jsx(TableCell, { children: _jsx(Chip, { label: getRoleName(user.role), color: getRoleColor(user.role), size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: user.status === 'Active' ? 'نشط' : 'غير نشط', color: user.status === 'Active' ? 'success' : 'default', size: "small" }) }), _jsx(TableCell, { children: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-' }), _jsxs(TableCell, { children: [_jsx(IconButton, { size: "small", onClick: () => handleOpenDialog(user), children: _jsx(EditIcon, { fontSize: "small" }) }), _jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(user.id), children: _jsx(DeleteIcon, { fontSize: "small" }) })] })] }, user.id))) })] }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: total, rowsPerPage: rowsPerPage, page: page, onPageChange: (_, newPage) => setPage(newPage), onRowsPerPageChange: (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); } })] }), _jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد' }), _jsx(DialogContent, { children: _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645", value: formData.username, onChange: (e) => setFormData({ ...formData, username: e.target.value }), disabled: !!editingUser, required: true }) }), !editingUser && (_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), required: true }) })), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", value: formData.fullName, onChange: (e) => setFormData({ ...formData, fullName: e.target.value }), required: true }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" }), _jsxs(Select, { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), label: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629", children: [_jsx(MenuItem, { value: "Admin", children: "\u0645\u062F\u064A\u0631 (\u0643\u0644 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A)" }), _jsx(MenuItem, { value: "Accountant", children: "\u0645\u062D\u0627\u0633\u0628 (\u0645\u0627\u0644\u064A\u0629\u060C \u062A\u0642\u0627\u0631\u064A\u0631\u060C \u0641\u0648\u0627\u062A\u064A\u0631)" }), _jsx(MenuItem, { value: "Employee", children: "\u0645\u0648\u0638\u0641 (\u0639\u0645\u0644\u0627\u0621\u060C \u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A)" }), _jsx(MenuItem, { value: "Support", children: "\u062F\u0639\u0645 \u0641\u0646\u064A (\u0639\u0645\u0644\u0627\u0621\u060C \u062A\u0630\u0627\u0643\u0631)" })] })] }) })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDialogOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting, children: submitting ? _jsx(CircularProgress, { size: 24 }) : (editingUser ? 'تحديث' : 'إضافة') })] })] })] }));
}
