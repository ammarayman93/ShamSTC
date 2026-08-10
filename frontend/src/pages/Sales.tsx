import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Grid, Alert, CircularProgress, MenuItem, FormControl, InputLabel, Select, InputAdornment,
    TablePagination, Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../services/api';

interface Product {
    id: number;
    name: string;
    modelNumber?: string;
    sellPrice: number;
    quantity: number;
}

interface ClientOption {
    id: number;
    fullName: string;
    username: string;
}

interface Sale {
    id: number;
    productId: number;
    productName: string;
    modelNumber?: string;
    quantity: number;
    unitSellPrice: number;
    total: number;
    clientId?: number;
    clientName?: string;
    serialNumber?: string;
    date: string;
    notes?: string;
}

export default function Sales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        unitSellPrice: '',
        clientId: null as number | null,
        clientName: '',
        serialNumber: '',
        notes: '',
    });

    useEffect(() => {
        fetchSales();
        fetchProducts();
        fetchClients();
    }, [page, rowsPerPage]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sales', { params: { page: page + 1, pageSize: rowsPerPage } });
            if (res.data?.success) {
                setSales(res.data.data.data || []);
                setTotal(res.data.data.total || 0);
            } else if (Array.isArray(res.data)) {
                setSales(res.data);
                setTotal(res.data.length);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products', { params: { pageSize: 500 } });
            const list = res.data?.success ? res.data.data.data : res.data;
            setProducts(Array.isArray(list) ? list : []);
        } catch {
            setProducts([]);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients', { params: { pageSize: 500 } });
            const list = res.data?.success ? res.data.data.data : res.data;
            setClients(Array.isArray(list) ? list : []);
        } catch {
            setClients([]);
        }
    };

    const handleProductChange = (productId: string) => {
        const p = products.find((x) => x.id === parseInt(productId));
        setFormData({
            ...formData,
            productId,
            unitSellPrice: p ? p.sellPrice.toString() : formData.unitSellPrice,
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const productId = parseInt(formData.productId);
            const quantity = parseInt(formData.quantity);
            if (!productId) throw new Error('اختر منتجاً');
            if (!quantity || quantity <= 0) throw new Error('الكمية غير صالحة');

            const selected = products.find((p) => p.id === productId);
            if (selected && quantity > selected.quantity) {
                throw new Error(`الكمية المتوفرة فقط ${selected.quantity}`);
            }

            const data = {
                productId,
                quantity,
                unitSellPrice: formData.unitSellPrice ? parseFloat(formData.unitSellPrice) : null,
                clientId: formData.clientId || null,
                clientName: formData.clientName || null,
                serialNumber: formData.serialNumber || null,
                notes: formData.notes || null,
            };

            await api.post('/sales/sell', data);
            setSuccess('تم تسجيل عملية البيع بنجاح');
            setDialogOpen(false);
            fetchSales();
            fetchProducts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    const totalAmount = sales.reduce((s, x) => s + x.total, 0);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">المبيعات</Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSales} sx={{ mr: 1 }}>تحديث</Button>
                    <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => {
                        setFormData({
                            productId: '', quantity: '', unitSellPrice: '',
                            clientId: null, clientName: '', serialNumber: '', notes: '',
                        });
                        setDialogOpen(true);
                    }}>
                        عملية بيع جديدة
          </Button>
                </Box>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#4caf50', color: 'white' }}>
                        <Typography variant="body2">إجمالي المبيعات</Typography>
                        <Typography variant="h5">{totalAmount.toLocaleString()} ل.س</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#2196f3', color: 'white' }}>
                        <Typography variant="body2">عدد العمليات</Typography>
                        <Typography variant="h5">{total}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>اسم المنتج</TableCell>
                            <TableCell>الموديل</TableCell>
                            <TableCell>الكمية</TableCell>
                            <TableCell>سعر المبيع</TableCell>
                            <TableCell>الإجمالي</TableCell>
                            <TableCell>اسم العميل</TableCell>
                            <TableCell>السيريال</TableCell>
                            <TableCell>التاريخ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={9} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : sales.length === 0 ? (
                            <TableRow><TableCell colSpan={9} align="center">لا توجد مبيعات</TableCell></TableRow>
                        ) : (
                                    sales.map((s, idx) => (
                                        <TableRow key={s.id} hover>
                                            <TableCell>{idx + 1 + page * rowsPerPage}</TableCell>
                                            <TableCell>{s.productName}</TableCell>
                                            <TableCell>{s.modelNumber || '-'}</TableCell>
                                            <TableCell>{s.quantity}</TableCell>
                                            <TableCell>{(s.unitSellPrice ?? s.total / s.quantity).toLocaleString()} ل.س</TableCell>
                                            <TableCell>{s.total.toLocaleString()} ل.س</TableCell>
                                            <TableCell>{s.clientName || '-'}</TableCell>
                                            <TableCell>{s.serialNumber || '-'}</TableCell>
                                            <TableCell>{new Date(s.date).toLocaleDateString('ar-EG')}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div" count={total} page={page} rowsPerPage={rowsPerPage}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                    labelRowsPerPage="صفوف:"
                />
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>عملية بيع جديدة</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>المنتج *</InputLabel>
                        <Select value={formData.productId} label="المنتج *" onChange={(e) => handleProductChange(e.target.value as string)}>
                            {products.filter((p) => p.quantity > 0).map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name} {p.modelNumber ? `(${p.modelNumber})` : ''} — {p.sellPrice.toLocaleString()} ل.س — متوفر: {p.quantity}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField fullWidth label="الكمية *" type="number" margin="normal" value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="سعر المبيع للوحدة" type="number" margin="normal" value={formData.unitSellPrice}
                                onChange={(e) => setFormData({ ...formData, unitSellPrice: e.target.value })}
                                InputProps={{ endAdornment: <InputAdornment position="end">ل.س</InputAdornment> }}
                                helperText="اتركه فارغاً لاستخدام سعر المنتج" />
                        </Grid>
                    </Grid>

                    <Autocomplete
                        options={clients}
                        getOptionLabel={(c) => `${c.fullName} (${c.username})`}
                        onChange={(_, value) => setFormData({
                            ...formData,
                            clientId: value?.id || null,
                            clientName: value?.fullName || formData.clientName,
                        })}
                        renderInput={(params) => (
                            <TextField {...params} label="اختر عميلاً (اختياري)" margin="normal" />
                        )}
                    />

                    <TextField fullWidth label="اسم العميل (يدوي)" margin="normal" value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        helperText="إذا لم تختر عميلاً من القائمة" />

                    <TextField fullWidth label="سيريال نمبر (إن وجد)" margin="normal" value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />

                    <TextField fullWidth label="ملاحظات" margin="normal" multiline rows={2} value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleSubmit} variant="contained" color="success" disabled={submitting}>
                        {submitting ? <CircularProgress size={22} /> : 'تأكيد البيع'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}