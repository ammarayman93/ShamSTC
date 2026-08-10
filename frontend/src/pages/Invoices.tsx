import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Chip,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Paid as PaidIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Client {
  id: number;
  username: string;
  fullName: string;
  phone: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName: string;
  total: number;
  date: string;
  dueDate: string;
  isPaid: boolean;
  status: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
      } else if (Array.isArray(response.data)) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      if (response.data && response.data.success) {
        setClients(response.data.data.data || []);
      }
    } catch (error) {
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    if (window.confirm('هل أنت متأكد من تحديد هذه الفاتورة كمدفوعة؟')) {
      try {
        await api.put(`/invoices/${id}/pay`);
        setSuccess('تم تحديث حالة الفاتورة');
        fetchInvoices();
      } catch (error) {
        setError('حدث خطأ');
      }
    }
  };

  const totalUnpaid = invoices.filter(i => !i.isPaid).reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.filter(i => i.isPaid).reduce((sum, i) => sum + i.total, 0);
  const overdueInvoices = invoices.filter(i => !i.isPaid && new Date(i.dueDate) < new Date()).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">الفواتير</Typography>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchInvoices} sx={{ mr: 1 }}>
            تحديث
          </Button>
          <Button variant="contained" startIcon={<ReceiptIcon />} onClick={() => setDialogOpen(true)}>
            فاتورة جديدة
          </Button>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#4caf50', color: 'white' }}>
            <Typography variant="body2">المدفوع</Typography>
            <Typography variant="h5">{totalPaid.toLocaleString()} ل.س</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f44336', color: 'white' }}>
            <Typography variant="body2">غير المدفوع</Typography>
            <Typography variant="h5">{totalUnpaid.toLocaleString()} ل.س</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ff9800', color: 'white' }}>
            <Typography variant="body2">فواتير متأخرة</Typography>
            <Typography variant="h5">{overdueInvoices}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#2196f3', color: 'white' }}>
            <Typography variant="body2">إجمالي الفواتير</Typography>
            <Typography variant="h5">{invoices.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>رقم الفاتورة</TableCell>
              <TableCell>العميل</TableCell>
              <TableCell>المبلغ</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
              <TableCell>تاريخ الاستحقاق</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice, idx) => (
              <TableRow key={invoice.id} hover sx={{ bgcolor: !invoice.isPaid && new Date(invoice.dueDate) < new Date() ? '#ffebee' : 'inherit' }}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>{invoice.total.toLocaleString()} ل.س</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString('ar-EG')}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.isPaid ? 'مدفوعة' : (new Date(invoice.dueDate) < new Date() ? 'متأخرة' : 'غير مدفوعة')}
                    color={invoice.isPaid ? 'success' : (new Date(invoice.dueDate) < new Date() ? 'error' : 'warning')}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => { setSelectedInvoice(invoice); setViewDialogOpen(true); }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {!invoice.isPaid && (
                    <IconButton size="small" color="success" onClick={() => handleMarkAsPaid(invoice.id)}>
                      <PaidIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* نافذة إنشاء فاتورة */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>فاتورة جديدة</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>العميل</InputLabel>
                <Select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} label="العميل">
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.fullName} - {c.username}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="المبلغ" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">ل.س</InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="تاريخ الاستحقاق" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'إنشاء الفاتورة'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة عرض الفاتورة */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل الفاتورة</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">رقم الفاتورة</Typography>
                  <Typography variant="h6">{selectedInvoice.invoiceNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">التاريخ</Typography>
                  <Typography variant="h6">{new Date(selectedInvoice.date).toLocaleDateString('ar-EG')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">العميل</Typography>
                  <Typography>{selectedInvoice.clientName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">تاريخ الاستحقاق</Typography>
                  <Typography>{new Date(selectedInvoice.dueDate).toLocaleDateString('ar-EG')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">المبلغ</Typography>
                  <Typography variant="h4" color="primary">{selectedInvoice.total.toLocaleString()} ل.س</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">الحالة</Typography>
                  <Chip label={selectedInvoice.isPaid ? 'مدفوعة' : 'غير مدفوعة'} color={selectedInvoice.isPaid ? 'success' : 'warning'} />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>إغلاق</Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>طباعة</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}