import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Alert, Chip, CircularProgress, MenuItem, FormControl, InputLabel, Select, InputAdornment, Divider, } from '@mui/material';
import { Receipt as ReceiptIcon, Print as PrintIcon, Visibility as VisibilityIcon, Paid as PaidIcon, Refresh as RefreshIcon, } from '@mui/icons-material';
import api from '../services/api';
export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '',
        amount: '',
        dueDate: '',
    });
    useEffect(() => {
        fetchInvoices();
        fetchClients();
    }, []);
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/invoices');
            if (response.data && response.data.success) {
                setInvoices(response.data.data || []);
            }
            else if (Array.isArray(response.data)) {
                setInvoices(response.data);
            }
        }
        catch (error) {
            console.error('Error fetching invoices:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            if (response.data && response.data.success) {
                setClients(response.data.data.data || []);
            }
        }
        catch (error) {
            console.error('Error fetching clients:', error);
        }
    };
    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const data = {
                clientId: parseInt(formData.clientId),
                total: parseFloat(formData.amount),
                dueDate: formData.dueDate,
            };
            await api.post('/invoices', data);
            setSuccess('تم إنشاء الفاتورة بنجاح');
            setDialogOpen(false);
            fetchInvoices();
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleMarkAsPaid = async (id) => {
        if (window.confirm('هل أنت متأكد من تحديد هذه الفاتورة كمدفوعة؟')) {
            try {
                await api.put(`/invoices/${id}/pay`);
                setSuccess('تم تحديث حالة الفاتورة');
                fetchInvoices();
            }
            catch (error) {
                setError('حدث خطأ');
            }
        }
    };
    const totalUnpaid = invoices.filter(i => !i.isPaid).reduce((sum, i) => sum + i.total, 0);
    const totalPaid = invoices.filter(i => i.isPaid).reduce((sum, i) => sum + i.total, 0);
    const overdueInvoices = invoices.filter(i => !i.isPaid && new Date(i.dueDate) < new Date()).length;
    return (_jsxs(Box, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h4", children: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631" }), _jsxs(Box, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: fetchInvoices, sx: { mr: 1 }, children: "\u062A\u062D\u062F\u064A\u062B" }), _jsx(Button, { variant: "contained", startIcon: _jsx(ReceiptIcon, {}), onClick: () => setDialogOpen(true), children: "\u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629" })] })] }), success && _jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 2, textAlign: 'center', bgcolor: '#4caf50', color: 'white' }, children: [_jsx(Typography, { variant: "body2", children: "\u0627\u0644\u0645\u062F\u0641\u0648\u0639" }), _jsxs(Typography, { variant: "h5", children: [totalPaid.toLocaleString(), " \u0644.\u0633"] })] }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 2, textAlign: 'center', bgcolor: '#f44336', color: 'white' }, children: [_jsx(Typography, { variant: "body2", children: "\u063A\u064A\u0631 \u0627\u0644\u0645\u062F\u0641\u0648\u0639" }), _jsxs(Typography, { variant: "h5", children: [totalUnpaid.toLocaleString(), " \u0644.\u0633"] })] }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 2, textAlign: 'center', bgcolor: '#ff9800', color: 'white' }, children: [_jsx(Typography, { variant: "body2", children: "\u0641\u0648\u0627\u062A\u064A\u0631 \u0645\u062A\u0623\u062E\u0631\u0629" }), _jsx(Typography, { variant: "h5", children: overdueInvoices })] }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 2, textAlign: 'center', bgcolor: '#2196f3', color: 'white' }, children: [_jsx(Typography, { variant: "body2", children: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631" }), _jsx(Typography, { variant: "h5", children: invoices.length })] }) })] }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { sx: { bgcolor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "#" }), _jsx(TableCell, { children: "\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0639\u0645\u064A\u0644" }), _jsx(TableCell, { children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsx(TableCell, { children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621" }), _jsx(TableCell, { children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642" }), _jsx(TableCell, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: invoices.map((invoice, idx) => (_jsxs(TableRow, { hover: true, sx: { bgcolor: !invoice.isPaid && new Date(invoice.dueDate) < new Date() ? '#ffebee' : 'inherit' }, children: [_jsx(TableCell, { children: idx + 1 }), _jsx(TableCell, { children: invoice.invoiceNumber }), _jsx(TableCell, { children: invoice.clientName }), _jsxs(TableCell, { children: [invoice.total.toLocaleString(), " \u0644.\u0633"] }), _jsx(TableCell, { children: new Date(invoice.date).toLocaleDateString('ar-EG') }), _jsx(TableCell, { children: new Date(invoice.dueDate).toLocaleDateString('ar-EG') }), _jsx(TableCell, { children: _jsx(Chip, { label: invoice.isPaid ? 'مدفوعة' : (new Date(invoice.dueDate) < new Date() ? 'متأخرة' : 'غير مدفوعة'), color: invoice.isPaid ? 'success' : (new Date(invoice.dueDate) < new Date() ? 'error' : 'warning'), size: "small" }) }), _jsxs(TableCell, { children: [_jsx(IconButton, { size: "small", onClick: () => { setSelectedInvoice(invoice); setViewDialogOpen(true); }, children: _jsx(VisibilityIcon, { fontSize: "small" }) }), !invoice.isPaid && (_jsx(IconButton, { size: "small", color: "success", onClick: () => handleMarkAsPaid(invoice.id), children: _jsx(PaidIcon, { fontSize: "small" }) })), _jsx(IconButton, { size: "small", children: _jsx(PrintIcon, { fontSize: "small" }) })] })] }, invoice.id))) })] }) }), _jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsx(DialogContent, { children: _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0639\u0645\u064A\u0644" }), _jsx(Select, { value: formData.clientId, onChange: (e) => setFormData({ ...formData, clientId: e.target.value }), label: "\u0627\u0644\u0639\u0645\u064A\u0644", children: clients.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.fullName, " - ", c.username] }, c.id))) })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0645\u0628\u0644\u063A", type: "number", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), InputProps: { startAdornment: _jsx(InputAdornment, { position: "start", children: "\u0644.\u0633" }) } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642", type: "date", value: formData.dueDate, onChange: (e) => setFormData({ ...formData, dueDate: e.target.value }), InputLabelProps: { shrink: true } }) })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDialogOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting, children: submitting ? _jsx(CircularProgress, { size: 24 }) : 'إنشاء الفاتورة' })] })] }), _jsxs(Dialog, { open: viewDialogOpen, onClose: () => setViewDialogOpen(false), maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629" }), _jsx(DialogContent, { children: selectedInvoice && (_jsx(Box, { children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629" }), _jsx(Typography, { variant: "h6", children: selectedInvoice.invoiceNumber })] }), _jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }), _jsx(Typography, { variant: "h6", children: new Date(selectedInvoice.date).toLocaleDateString('ar-EG') })] }), _jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0627\u0644\u0639\u0645\u064A\u0644" }), _jsx(Typography, { children: selectedInvoice.clientName })] }), _jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642" }), _jsx(Typography, { children: new Date(selectedInvoice.dueDate).toLocaleDateString('ar-EG') })] }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsxs(Typography, { variant: "h4", color: "primary", children: [selectedInvoice.total.toLocaleString(), " \u0644.\u0633"] })] }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(Chip, { label: selectedInvoice.isPaid ? 'مدفوعة' : 'غير مدفوعة', color: selectedInvoice.isPaid ? 'success' : 'warning' })] })] }) })) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setViewDialogOpen(false), children: "\u0625\u063A\u0644\u0627\u0642" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(PrintIcon, {}), children: "\u0637\u0628\u0627\u0639\u0629" })] })] })] }));
}
