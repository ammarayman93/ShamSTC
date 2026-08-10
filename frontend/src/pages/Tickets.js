import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Alert, IconButton, MenuItem, FormControl, InputLabel, Select, } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, } from '@mui/icons-material';
import api from '../services/api';
export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        description: '',
        priority: 'Medium',
        category: 'General',
    });
    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);
    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all')
                params.status = statusFilter;
            const response = await api.get('/tickets', { params });
            if (response.data.success) {
                setTickets(response.data.data);
            }
        }
        catch (error) {
            console.error('Error fetching tickets:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchTicketDetails = async (id) => {
        try {
            const response = await api.get(`/tickets/${id}`);
            if (response.data.success) {
                setSelectedTicket(response.data.data);
                setReplies(response.data.data.replies || []);
            }
        }
        catch (error) {
            console.error('Error fetching ticket details:', error);
        }
    };
    const handleCreateTicket = async () => {
        try {
            await api.post('/tickets', formData);
            setSuccess('Êã ÅäÔÇÁ ÇáÊÐßÑÉ ÈäÌÇÍ');
            setDialogOpen(false);
            fetchTickets();
            setFormData({ clientId: '', title: '', description: '', priority: 'Medium', category: 'General' });
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError('ÍÏË ÎØÃ');
        }
    };
    const handleAddReply = async () => {
        if (!replyMessage.trim()) {
            setError('ÇáÑÌÇÁ ÅÏÎÇá ÇáÑÏ');
            return;
        }
        try {
            await api.post(`/tickets/${selectedTicket?.id}/reply`, {
                userId: 1, // ãÄÞÊ
                message: replyMessage,
                isClient: false,
            });
            setSuccess('Êã ÅÖÇÝÉ ÇáÑÏ');
            setReplyDialogOpen(false);
            setReplyMessage('');
            fetchTicketDetails(selectedTicket.id);
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError('ÍÏË ÎØÃ');
        }
    };
    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/tickets/${id}/status`, { status });
            setSuccess('Êã ÊÍÏíË ÇáÍÇáÉ');
            fetchTickets();
            if (selectedTicket)
                fetchTicketDetails(selectedTicket.id);
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError('ÍÏË ÎØÃ');
        }
    };
    const handleViewTicket = async (ticket) => {
        setSelectedTicket(ticket);
        await fetchTicketDetails(ticket.id);
        setViewDialogOpen(true);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'warning';
            case 'InProgress': return 'info';
            case 'Resolved': return 'success';
            case 'Closed': return 'default';
            default: return 'default';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'Open': return 'ãÝÊæÍÉ';
            case 'InProgress': return 'ÞíÏ ÇáãÚÇáÌÉ';
            case 'Resolved': return 'Êã ÇáÍá';
            case 'Closed': return 'ãÛáÞÉ';
            default: return status;
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low': return 'success';
            case 'Medium': return 'info';
            case 'High': return 'warning';
            case 'Urgent': return 'error';
            default: return 'default';
        }
    };
    return (_jsxs(Box, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h4", children: "\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u062F\u0639\u0645" }), _jsxs(Box, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: fetchTickets, sx: { mr: 1 }, children: "\u062A\u062D\u062F\u064A\u062B" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => setDialogOpen(true), children: "\u062A\u0630\u0643\u0631\u0629 \u062C\u062F\u064A\u062F\u0629" })] })] }), success && _jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsx(Paper, { sx: { p: 2, mb: 2 }, children: _jsx(Grid, { container: true, spacing: 2, alignItems: "center", children: _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsxs(Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), label: "\u0627\u0644\u062D\u0627\u0644\u0629", children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), _jsx(MenuItem, { value: "Open", children: "\u0645\u0641\u062A\u0648\u062D\u0629" }), _jsx(MenuItem, { value: "InProgress", children: "\u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629" }), _jsx(MenuItem, { value: "Resolved", children: "\u062A\u0645 \u0627\u0644\u062D\u0644" }), _jsx(MenuItem, { value: "Closed", children: "\u0645\u063A\u0644\u0642\u0629" })] })] }) }) }) }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { sx: { bgcolor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "#" }), _jsx(TableCell, { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx(TableCell, { children: "\u0627\u0644\u0639\u0645\u064A\u0644" }), _jsx(TableCell, { children: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }), _jsx(TableCell, { children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: tickets.map((ticket, idx) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: idx + 1 }), _jsx(TableCell, { children: ticket.title }), _jsx(TableCell, { children: ticket.clientName }), _jsx(TableCell, { children: _jsx(Chip, { label: ticket.priority, color: getPriorityColor(ticket.priority), size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: getStatusText(ticket.status), color: getStatusColor(ticket.status), size: "small" }) }), _jsx(TableCell, { children: new Date(ticket.createdAt).toLocaleDateString('ar-EG') }), _jsx(TableCell, { children: _jsx(IconButton, { size: "small", onClick: () => handleViewTicket(ticket), children: _jsx(VisibilityIcon, { fontSize: "small" }) }) })] }, ticket.id))) })] }) }), _jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u062A\u0630\u0643\u0631\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsx(DialogContent, { children: _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0648\u0635\u0641", multiline: true, rows: 4, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }) }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629" }), _jsxs(Select, { value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), label: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", children: [_jsx(MenuItem, { value: "Low", children: "\u0645\u0646\u062E\u0641\u0636\u0629" }), _jsx(MenuItem, { value: "Medium", children: "\u0645\u062A\u0648\u0633\u0637\u0629" }), _jsx(MenuItem, { value: "High", children: "\u0639\u0627\u0644\u064A\u0629" }), _jsx(MenuItem, { value: "Urgent", children: "\u0637\u0627\u0631\u0626\u0629" })] })] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641" }), _jsxs(Select, { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), label: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641", children: [_jsx(MenuItem, { value: "Technical", children: "\u062A\u0642\u0646\u064A" }), _jsx(MenuItem, { value: "Billing", children: "\u0645\u0627\u0644\u064A" }), _jsx(MenuItem, { value: "General", children: "\u0639\u0627\u0645" })] })] }) })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDialogOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleCreateTicket, variant: "contained", children: "\u0625\u0646\u0634\u0627\u0621" })] })] }), _jsxs(Dialog, { open: viewDialogOpen, onClose: () => setViewDialogOpen(false), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { children: [selectedTicket?.title, _jsxs(Box, { sx: { mt: 1 }, children: [_jsx(Chip, { label: getStatusText(selectedTicket?.status || ''), color: getStatusColor(selectedTicket?.status || ''), size: "small", sx: { mr: 1 } }), _jsx(Chip, { label: selectedTicket?.priority, color: getPriorityColor(selectedTicket?.priority || ''), size: "small" })] })] }), _jsxs(DialogContent, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0627\u0644\u0648\u0635\u0641:" }), _jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: selectedTicket?.description }), _jsx(Typography, { variant: "subtitle2", sx: { mt: 2, mb: 1 }, children: "\u0627\u0644\u0631\u062F\u0648\u062F:" }), replies.map((reply) => (_jsxs(Paper, { sx: { p: 2, mb: 1, bgcolor: reply.isClient ? '#e3f2fd' : '#f5f5f5' }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", children: [_jsx(Typography, { variant: "body2", fontWeight: "bold", children: reply.userName }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: new Date(reply.createdAt).toLocaleString('ar-EG') })] }), _jsx(Typography, { variant: "body2", children: reply.message })] }, reply.id))), _jsxs(Box, { display: "flex", gap: 1, mt: 2, children: [_jsx(TextField, { fullWidth: true, size: "small", placeholder: "\u0627\u0643\u062A\u0628 \u0631\u062F\u0643...", value: replyMessage, onChange: (e) => setReplyMessage(e.target.value) }), _jsx(Button, { variant: "contained", onClick: handleAddReply, children: "\u0625\u0631\u0633\u0627\u0644" })] })] }), _jsxs(DialogActions, { children: [_jsx(FormControl, { size: "small", sx: { minWidth: 120 }, children: _jsxs(Select, { value: selectedTicket?.status || 'Open', onChange: (e) => handleUpdateStatus(selectedTicket.id, e.target.value), children: [_jsx(MenuItem, { value: "Open", children: "\u0645\u0641\u062A\u0648\u062D\u0629" }), _jsx(MenuItem, { value: "InProgress", children: "\u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629" }), _jsx(MenuItem, { value: "Resolved", children: "\u062A\u0645 \u0627\u0644\u062D\u0644" }), _jsx(MenuItem, { value: "Closed", children: "\u0645\u063A\u0644\u0642\u0629" })] }) }), _jsx(Button, { onClick: () => setViewDialogOpen(false), children: "\u0625\u063A\u0644\u0627\u0642" })] })] })] }));
}
