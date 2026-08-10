import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Alert, CircularProgress, } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, } from '@mui/icons-material';
import api from '../services/api';
export default function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        speed: '',
        price: '',
        durationDays: '30',
    });
    useEffect(() => {
        fetchPlans();
    }, []);
    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await api.get('/plans');
            if (response.data) {
                setPlans(
                    Array.isArray(response.data?.data)
                        ? response.data.data
                        : []
                );
            }
        }
        catch (error) {
            console.error('Error fetching plans:', error);
            setError('فشل في تحميل الباقات');
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenDialog = (plan) => {
        if (plan) {
            // للتعديل - تعبئة الحقول بالبيانات الموجودة
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                speed: plan.speed,
                price: plan.price.toString(),
                durationDays: plan.durationDays.toString(),
            });
        }
        else {
            // للإضافة - تعبئة حقول فارغة
            setEditingPlan(null);
            setFormData({
                name: '',
                speed: '',
                price: '',
                durationDays: '30',
            });
        }
        setDialogOpen(true);
    };
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingPlan(null);
        setFormData({
            name: '',
            speed: '',
            price: '',
            durationDays: '30',
        });
        setError('');
    };
    const handleSubmit = async () => {
        // التحقق من صحة البيانات
        if (!formData.name.trim()) {
            setError('اسم الباقة مطلوب');
            return;
        }
        if (!formData.speed.trim()) {
            setError('السرعة مطلوبة');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('السعر يجب أن يكون أكبر من صفر');
            return;
        }
        if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
            setError('المدة يجب أن تكون أكبر من صفر');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const data = {
                name: formData.name,
                speed: formData.speed,
                price: parseFloat(formData.price),
                durationDays: parseInt(formData.durationDays),
                isActive: true,
                sortOrder: plans.length + 1,
            };
            if (editingPlan) {
                // تعديل
                await api.put(`/plans/${editingPlan.id}`, data);
                setSuccess('تم تعديل الباقة بنجاح');
            }
            else {
                // إضافة جديدة
                await api.post('/plans', data);
                setSuccess('تم إضافة الباقة بنجاح');
            }
            handleCloseDialog();
            fetchPlans();
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الباقة');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleDelete = async (id, name) => {
        if (window.confirm(`هل أنت متأكد من حذف الباقة "${name}"؟`)) {
            try {
                await api.delete(`/plans/${id}`);
                setSuccess('تم حذف الباقة بنجاح');
                fetchPlans();
                setTimeout(() => setSuccess(''), 3000);
            }
            catch (err) {
                setError(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
                setTimeout(() => setError(''), 3000);
            }
        }
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Box, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h4", children: "\u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A" }), _jsxs(Box, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: fetchPlans, sx: { mr: 1 }, children: "\u062A\u062D\u062F\u064A\u062B" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenDialog(), children: "\u0628\u0627\u0642\u0629 \u062C\u062F\u064A\u062F\u0629" })] })] }), success && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(''), children: success })), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(''), children: error })), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { sx: { bgcolor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "#" }), _jsx(TableCell, { children: "\u0627\u0633\u0645 \u0627\u0644\u0628\u0627\u0642\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0633\u0631\u0639\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0633\u0639\u0631 (\u0644.\u0633)" }), _jsx(TableCell, { children: "\u0627\u0644\u0645\u062F\u0629 (\u064A\u0648\u0645)" }), _jsx(TableCell, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: plans.map((plan, idx) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: idx + 1 }), _jsx(TableCell, { children: plan.name }), _jsx(TableCell, { children: plan.speed }), _jsx(TableCell, { children: plan.price.toLocaleString() }), _jsx(TableCell, { children: plan.durationDays }), _jsx(TableCell, { children: _jsx(Chip, { label: plan.isActive ? 'نشطة' : 'غير نشطة', color: plan.isActive ? 'success' : 'default', size: "small" }) }), _jsxs(TableCell, { children: [_jsx(IconButton, { size: "small", onClick: () => handleOpenDialog(plan), title: "\u062A\u0639\u062F\u064A\u0644", children: _jsx(EditIcon, { fontSize: "small" }) }), _jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(plan.id, plan.name), title: "\u062D\u0630\u0641", children: _jsx(DeleteIcon, { fontSize: "small" }) })] })] }, plan.id))) })] }) }), _jsxs(Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingPlan ? 'تعديل باقة' : 'إضافة باقة جديدة' }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { mt: 2 }, children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0628\u0627\u0642\u0629", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), margin: "normal", required: true, placeholder: "\u0645\u062B\u0627\u0644: 4Mb/s (Damascus) 2025" }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0633\u0631\u0639\u0629", value: formData.speed, onChange: (e) => setFormData({ ...formData, speed: e.target.value }), margin: "normal", required: true, placeholder: "\u0645\u062B\u0627\u0644: 4Mb/s" }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0633\u0639\u0631 (\u0644.\u0633)", type: "number", value: formData.price, onChange: (e) => setFormData({ ...formData, price: e.target.value }), margin: "normal", required: true, InputProps: { inputProps: { min: 0 } } }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0645\u062F\u0629 (\u064A\u0648\u0645)", type: "number", value: formData.durationDays, onChange: (e) => setFormData({ ...formData, durationDays: e.target.value }), margin: "normal", required: true, InputProps: { inputProps: { min: 1 } } })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseDialog, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting, children: submitting ? _jsx(CircularProgress, { size: 24 }) : (editingPlan ? 'تحديث' : 'إضافة') })] })] })] }));
}
