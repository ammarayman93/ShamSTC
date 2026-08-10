import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, Alert, IconButton,
    MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import api from '../services/api';

interface Ticket {
    id: number;
    clientId: number;
    clientName: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
}

interface Client {
    id: number;
    fullName: string;
}

export default function Tickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        description: '',
        priority: 'Medium',
        category: 'General',
    });

    useEffect(() => {
        fetchTickets();
        fetchClients();
    }, [statusFilter]);

    const fetchTickets = async () => {
        try {
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            const response = await api.get('/tickets', { params });
            if (response.data.success) setTickets(response.data.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            if (response.data.success) setClients(response.data.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleCreateTicket = async () => {
        try {
            await api.post('/tickets', formData);
            setSuccess('تم إنشاء التذكرة بنجاح');
            setDialogOpen(false);
            setFormData({ clientId: '', title: '', description: '', priority: 'Medium', category: 'General' });
            fetchTickets();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('حدث خطأ أثناء إنشاء التذكرة');
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">تذاكر الدعم</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                    تذكرة جديدة
                </Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>العنوان</TableCell>
                            <TableCell>العميل</TableCell>
                            <TableCell>الحالة</TableCell>
                            <TableCell>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map((ticket, idx) => (
                            <TableRow key={ticket.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{ticket.title}</TableCell>
                                <TableCell>{ticket.clientName}</TableCell>
                                <TableCell>{ticket.status}</TableCell>
                                <TableCell>
                                    <IconButton size="small"><VisibilityIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>تذكرة جديدة</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>اختر العميل</InputLabel>
                                <Select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value as string })}
                                    label="اختر العميل"
                                >
                                    {clients.map((client) => (
                                        <MenuItem key={client.id} value={client.id}>
                                            {client.fullName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="العنوان" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="الوصف" multiline rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleCreateTicket} variant="contained">إنشاء</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}