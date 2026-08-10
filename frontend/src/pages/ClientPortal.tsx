import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Receipt as ReceiptIcon,
  Wifi as WifiIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Subscription {
  id: number;
  planName: string;
  speed: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  total: number;
  date: string;
  dueDate: string;
  isPaid: boolean;
}

interface Ticket {
  id: number;
  title: string;
  status: string;
  createdAt: string;
}

export default function ClientPortal() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
      if (subRes.data.success) setSubscription(subRes.data.data);
      if (invRes.data.success) setInvoices(invRes.data.data);
      if (tickRes.data.success) setTickets(tickRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      await api.post('/tickets', { ...ticketForm, clientId: user?.id });
      setSuccess('تم إنشاء التذكرة بنجاح');
      setTicketDialog(false);
      fetchData();
    } catch (err) {
      setError('حدث خطأ');
    }
  };

  const daysRemaining = subscription 
    ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>لوحة العميل</Typography>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WifiIcon sx={{ fontSize: 50, color: '#1976d2' }} />
              <Typography variant="h6">الباقة الحالية</Typography>
              <Typography variant="h5">{subscription?.planName || 'لا يوجد'}</Typography>
              <Typography variant="body2" color="textSecondary">{subscription?.speed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 50, color: '#4caf50' }} />
              <Typography variant="h6">المتبقي على الاشتراك</Typography>
              <Typography variant="h5" color={daysRemaining <= 3 ? 'error' : 'success'}>
                {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
              </Typography>
              <Typography variant="body2">ينتهي في {subscription ? new Date(subscription.endDate).toLocaleDateString('ar-EG') : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountIcon sx={{ fontSize: 50, color: '#ff9800' }} />
              <Typography variant="h6">مرحباً</Typography>
              <Typography variant="h5">{user?.fullName}</Typography>
              <Typography variant="body2">{user?.username}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="الاشتراك" />
          <Tab label="الفواتير" />
          <Tab label="تذاكر الدعم" />
        </Tabs>

        {tabValue === 0 && subscription && (
          <Box p={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Typography variant="body2">اسم الباقة:</Typography><Typography variant="h6">{subscription.planName}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography variant="body2">السرعة:</Typography><Typography variant="h6">{subscription.speed}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography variant="body2">تاريخ البدء:</Typography><Typography>{new Date(subscription.startDate).toLocaleDateString('ar-EG')}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography variant="body2">تاريخ الانتهاء:</Typography><Typography>{new Date(subscription.endDate).toLocaleDateString('ar-EG')}</Typography></Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box p={3}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow><TableCell>رقم الفاتورة</TableCell><TableCell>المبلغ</TableCell><TableCell>التاريخ</TableCell><TableCell>تاريخ الاستحقاق</TableCell><TableCell>الحالة</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.total.toLocaleString()} ل.س</TableCell>
                      <TableCell>{new Date(inv.date).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell>{new Date(inv.dueDate).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell><Chip label={inv.isPaid ? 'مدفوعة' : 'غير مدفوعة'} color={inv.isPaid ? 'success' : 'error'} size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && (
          <Box p={3}>
            <Button variant="contained" onClick={() => setTicketDialog(true)} sx={{ mb: 2 }}>تذكرة جديدة</Button>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow><TableCell>#</TableCell><TableCell>العنوان</TableCell><TableCell>الحالة</TableCell><TableCell>التاريخ</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((t, idx) => (
                    <TableRow key={t.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{t.title}</TableCell>
                      <TableCell><Chip label={t.status} color={t.status === 'Open' ? 'warning' : 'success'} size="small" /></TableCell>
                      <TableCell>{new Date(t.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      <Dialog open={ticketDialog} onClose={() => setTicketDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تذكرة دعم جديدة</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="العنوان" value={ticketForm.title} onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })} margin="normal" />
          <TextField fullWidth label="الوصف" multiline rows={4} value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialog(false)}>إلغاء</Button>
          <Button onClick={handleCreateTicket} variant="contained">إرسال</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}