import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Tab, Tabs, } from '@mui/material';
import { AccountCircle as AccountIcon, Receipt as ReceiptIcon, Wifi as WifiIcon, } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
export default function ClientPortal() {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [subscription, setSubscription] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ticketDialog, setTicketDialog] = useState(false);
    const [ticketForm, setTicketForm] = useState({ title: '', description: '', priority: 'Medium', category: 'General' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, invRes, tickRes] = await Promise.all([
                api.get('/subscriptions/client'),
                api.get('/invoices/client'),
                api.get('/tickets/client'),
            ]);
            if (subRes.data.success)
                setSubscription(subRes.data.data);
            if (invRes.data.success)
                setInvoices(invRes.data.data);
            if (tickRes.data.success)
                setTickets(tickRes.data.data);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateTicket = async () => {
        try {
            await api.post('/tickets', { ...ticketForm, clientId: user?.id });
            setSuccess('تم إنشاء التذكرة بنجاح');
            setTicketDialog(false);
            fetchData();
        }
        catch (err) {
            setError('حدث خطأ');
        }
    };
    const daysRemaining = subscription
        ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    if (loading)
        return _jsx(CircularProgress, {});
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "\u0644\u0648\u062D\u0629 \u0627\u0644\u0639\u0645\u064A\u0644" }), _jsxs(Grid, { container: true, spacing: 3, mb: 4, children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(WifiIcon, { sx: { fontSize: 50, color: '#1976d2' } }), _jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629" }), _jsx(Typography, { variant: "h5", children: subscription?.planName || 'لا يوجد' }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: subscription?.speed })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(ReceiptIcon, { sx: { fontSize: 50, color: '#4caf50' } }), _jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0639\u0644\u0649 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643" }), _jsx(Typography, { variant: "h5", color: daysRemaining <= 3 ? 'error' : 'success', children: daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي' }), _jsxs(Typography, { variant: "body2", children: ["\u064A\u0646\u062A\u0647\u064A \u0641\u064A ", subscription ? new Date(subscription.endDate).toLocaleDateString('ar-EG') : '-'] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(AccountIcon, { sx: { fontSize: 50, color: '#ff9800' } }), _jsx(Typography, { variant: "h6", children: "\u0645\u0631\u062D\u0628\u0627\u064B" }), _jsx(Typography, { variant: "h5", children: user?.fullName }), _jsx(Typography, { variant: "body2", children: user?.username })] }) }) })] }), _jsxs(Paper, { sx: { width: '100%' }, children: [_jsxs(Tabs, { value: tabValue, onChange: (_, v) => setTabValue(v), children: [_jsx(Tab, { label: "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643" }), _jsx(Tab, { label: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631" }), _jsx(Tab, { label: "\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u062F\u0639\u0645" })] }), tabValue === 0 && subscription && (_jsx(Box, { p: 3, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "body2", children: "\u0627\u0633\u0645 \u0627\u0644\u0628\u0627\u0642\u0629:" }), _jsx(Typography, { variant: "h6", children: subscription.planName })] }), _jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "body2", children: "\u0627\u0644\u0633\u0631\u0639\u0629:" }), _jsx(Typography, { variant: "h6", children: subscription.speed })] }), _jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "body2", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0621:" }), _jsx(Typography, { children: new Date(subscription.startDate).toLocaleDateString('ar-EG') })] }), _jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "body2", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621:" }), _jsx(Typography, { children: new Date(subscription.endDate).toLocaleDateString('ar-EG') })] })] }) })), tabValue === 1 && (_jsx(Box, { p: 3, children: _jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsx(TableCell, { children: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }), _jsx(TableCell, { children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642" }), _jsx(TableCell, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" })] }) }), _jsx(TableBody, { children: invoices.map(inv => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: inv.invoiceNumber }), _jsxs(TableCell, { children: [inv.total.toLocaleString(), " \u0644.\u0633"] }), _jsx(TableCell, { children: new Date(inv.date).toLocaleDateString('ar-EG') }), _jsx(TableCell, { children: new Date(inv.dueDate).toLocaleDateString('ar-EG') }), _jsx(TableCell, { children: _jsx(Chip, { label: inv.isPaid ? 'مدفوعة' : 'غير مدفوعة', color: inv.isPaid ? 'success' : 'error', size: "small" }) })] }, inv.id))) })] }) }) })), tabValue === 2 && (_jsxs(Box, { p: 3, children: [_jsx(Button, { variant: "contained", onClick: () => setTicketDialog(true), sx: { mb: 2 }, children: "\u062A\u0630\u0643\u0631\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "#" }), _jsx(TableCell, { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx(TableCell, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" })] }) }), _jsx(TableBody, { children: tickets.map((t, idx) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: idx + 1 }), _jsx(TableCell, { children: t.title }), _jsx(TableCell, { children: _jsx(Chip, { label: t.status, color: t.status === 'Open' ? 'warning' : 'success', size: "small" }) }), _jsx(TableCell, { children: new Date(t.createdAt).toLocaleDateString('ar-EG') })] }, t.id))) })] }) })] }))] }), _jsxs(Dialog, { open: ticketDialog, onClose: () => setTicketDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u062A\u0630\u0643\u0631\u0629 \u062F\u0639\u0645 \u062C\u062F\u064A\u062F\u0629" }), _jsxs(DialogContent, { children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", value: ticketForm.title, onChange: (e) => setTicketForm({ ...ticketForm, title: e.target.value }), margin: "normal" }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0648\u0635\u0641", multiline: true, rows: 4, value: ticketForm.description, onChange: (e) => setTicketForm({ ...ticketForm, description: e.target.value }), margin: "normal" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setTicketDialog(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleCreateTicket, variant: "contained", children: "\u0625\u0631\u0633\u0627\u0644" })] })] })] }));
}
