import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Grid, Alert, Chip, CircularProgress, InputAdornment, TablePagination,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';

interface Product {
    id: number;
    name: string;
    modelNumber?: string;
    serialNumber?: string;
    costPrice: number;
    sellPrice: number;
    quantity: number;
    description?: string;
    minStockAlert?: number;
    isActive?: boolean;
    isLowStock?: boolean;
}

export default function Inventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        modelNumber: '',
        serialNumber: '',
        costPrice: '',
        sellPrice: '',
        quantity: '',
        description: '',
        minStockAlert: '5',
    });

    useEffect(() => {
        fetchProducts();
    }, [page, rowsPerPage, search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products', {
                params: { page: page + 1, pageSize: rowsPerPage, search },
            });
            if (res.data?.success) {
                setProducts(res.data.data.data || []);
                setTotal(res.data.data.total || 0);
            } else if (Array.isArray(res.data)) {
                setProducts(res.data);
                setTotal(res.data.length);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingProduct(null);
        setFormData({
            name: '', modelNumber: '', serialNumber: '',
            costPrice: '', sellPrice: '', quantity: '', description: '', minStockAlert: '5',
        });
        setDialogOpen(true);
    };

    const openEdit = (p: Product) => {
        setEditingProduct(p);
        setFormData({
            name: p.name,
            modelNumber: p.modelNumber || '',
            serialNumber: p.serialNumber || '',
            costPrice: p.costPrice.toString(),
            sellPrice: p.sellPrice.toString(),
            quantity: p.quantity.toString(),
            description: p.description || '',
            minStockAlert: (p.minStockAlert ?? 5).toString(),
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('اسم المنتج مطلوب');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const data = {
                name: formData.name.trim(),
                modelNumber: formData.modelNumber.trim() || null,
                serialNumber: formData.serialNumber.trim() || null,
                costPrice: parseFloat(formData.costPrice) || 0,
                sellPrice: parseFloat(formData.sellPrice) || 0,
                quantity: parseInt(formData.quantity) || 0,
                description: formData.description || null,
                minStockAlert: parseInt(formData.minStockAlert) || 5,
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, data);
                setSuccess('تم تحديث المنتج بنجاح');
            } else {
                await api.post('/products', data);
                setSuccess('تم إضافة المنتج بنجاح');
            }
            setDialogOpen(false);
            fetchProducts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف/تعطيل هذا المنتج؟')) return;
        try {
            await api.delete(`/products/${id}`);
            setSuccess('تم حذف/تعطيل المنتج');
            fetchProducts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل الحذف');
        }
    };

    const totalValue = products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0);
    const lowStock = products.filter((p) => p.quantity <= (p.minStockAlert ?? 5));

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">المخزون</Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchProducts} sx={{ mr: 1 }}>تحديث</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>منتج جديد</Button>
                </Box>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#1976d2', color: 'white' }}>
                        <Typography variant="body2">قيمة المخزون</Typography>
                        <Typography variant="h5">{totalValue.toLocaleString()} ل.س</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: lowStock.length > 0 ? '#f44336' : '#4caf50', color: 'white' }}>
                        <Typography variant="body2">منخفض المخزون</Typography>
                        <Typography variant="h5">{lowStock.length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ff9800', color: 'white' }}>
                        <Typography variant="body2">إجمالي المنتجات</Typography>
                        <Typography variant="h5">{total}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    placeholder="بحث بالاسم أو الموديل أو السيريال..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>اسم المنتج</TableCell>
                            <TableCell>الموديل</TableCell>
                            <TableCell>السيريال</TableCell>
                            <TableCell>سعر الشراء</TableCell>
                            <TableCell>سعر المبيع</TableCell>
                            <TableCell>الكمية</TableCell>
                            <TableCell>الحالة</TableCell>
                            <TableCell>إجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={9} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : products.length === 0 ? (
                            <TableRow><TableCell colSpan={9} align="center">لا توجد منتجات</TableCell></TableRow>
                        ) : (
                                    products.map((p, idx) => (
                                        <TableRow key={p.id} hover>
                                            <TableCell>{idx + 1 + page * rowsPerPage}</TableCell>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.modelNumber || '-'}</TableCell>
                                            <TableCell>{p.serialNumber || '-'}</TableCell>
                                            <TableCell>{p.costPrice.toLocaleString()} ل.س</TableCell>
                                            <TableCell>{p.sellPrice.toLocaleString()} ل.س</TableCell>
                                            <TableCell>{p.quantity}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={p.quantity <= (p.minStockAlert ?? 5) ? 'منخفض' : 'متوفر'}
                                                    color={p.quantity <= (p.minStockAlert ?? 5) ? 'error' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                    labelRowsPerPage="صفوف:"
                />
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingProduct ? 'تعديل منتج' : 'منتج جديد'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="اسم المنتج *" margin="normal" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <TextField fullWidth label="رقم الموديل" margin="normal" value={formData.modelNumber}
                        onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })} />
                    <TextField fullWidth label="سيريال نمبر" margin="normal" value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField fullWidth label="سعر الشراء" type="number" margin="normal" value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                InputProps={{ endAdornment: <InputAdornment position="end">ل.س</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="سعر المبيع" type="number" margin="normal" value={formData.sellPrice}
                                onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                                InputProps={{ endAdornment: <InputAdornment position="end">ل.س</InputAdornment> }} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField fullWidth label="الكمية" type="number" margin="normal" value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="تنبيه عند انخفاض الكمية" type="number" margin="normal" value={formData.minStockAlert}
                                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })} />
                        </Grid>
                    </Grid>
                    <TextField fullWidth label="وصف" margin="normal" multiline rows={2} value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
                        {submitting ? <CircularProgress size={22} /> : 'حفظ'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}