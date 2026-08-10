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
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Product {
  id: number;
  name: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  modelNumber?: string;
}

interface Purchase {
  id: number;
  productId: number;
  productName: string;
  modelNumber?: string;
  quantity: number;
  costPerUnit: number;
  total: number;
  supplier: string;
  invoiceNumber?: string;
  date: string;
  notes?: string;
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    costPerUnit: '',
    supplier: '',
    invoiceNumber: '',
    notes: '',
    updateProductCostPrice: true,
  });

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
  }, [page, rowsPerPage]);

  const fetchPurchases = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/purchases', {
        params: { page: page + 1, pageSize: rowsPerPage },
      });

      // يدعم الشكلين: ApiResponse أو البيانات المباشرة
      const payload = response.data?.data ?? response.data;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      const totalCount = payload?.total ?? list.length;

      setPurchases(list);
      setTotal(totalCount);
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setError(err.response?.data?.message || 'فشل جلب المشتريات');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: { page: 1, pageSize: 200 },
      });
      const payload = response.data?.data ?? response.data;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setProducts(list);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      productId: '',
      quantity: '',
      costPerUnit: '',
      supplier: '',
      invoiceNumber: '',
      notes: '',
      updateProductCostPrice: true,
    });
    setError('');
    setDialogOpen(true);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === Number(productId));
    setFormData((prev) => ({
      ...prev,
      productId,
      costPerUnit: product ? String(product.costPrice || '') : prev.costPerUnit,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.quantity || !formData.costPerUnit) {
      setError('يرجى تعبئة المنتج والكمية وسعر الوحدة');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        productId: Number(formData.productId),
        quantity: Number(formData.quantity),
        costPerUnit: Number(formData.costPerUnit),
        supplier: formData.supplier || null,
        invoiceNumber: formData.invoiceNumber || null,
        notes: formData.notes || null,
        updateProductCostPrice: formData.updateProductCostPrice,
      };

      const response = await api.post('/purchases', payload);

      if (response.data?.success === false) {
        throw new Error(response.data.message || 'فشل إنشاء عملية الشراء');
      }

      setSuccess('تم تسجيل عملية الشراء بنجاح');
      setTimeout(() => setSuccess(''), 3000);
      setDialogOpen(false);
      fetchPurchases();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟ سيتم خصم الكمية من المخزون.')) {
      return;
    }
    try {
      const response = await api.delete(`/purchases/${id}`);
      if (response.data?.success === false) {
        throw new Error(response.data.message);
      }
      setSuccess('تم حذف عملية الشراء بنجاح');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchases();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل حذف العملية');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          المشتريات
        </Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={fetchPurchases} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            عملية شراء جديدة
          </Button>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المنتج</TableCell>
              <TableCell>الموديل</TableCell>
              <TableCell align="center">الكمية</TableCell>
              <TableCell align="right">سعر الوحدة</TableCell>
              <TableCell align="right">الإجمالي</TableCell>
              <TableCell>المورد</TableCell>
              <TableCell>رقم الفاتورة</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell align="center">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  لا توجد عمليات شراء
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <TableRow key={purchase.id} hover>
                  <TableCell>{purchase.productName}</TableCell>
                  <TableCell>{purchase.modelNumber || '—'}</TableCell>
                  <TableCell align="center">{purchase.quantity}</TableCell>
                  <TableCell align="right">
                    {Number(purchase.costPerUnit).toLocaleString()} ل.س
                  </TableCell>
                  <TableCell align="right">
                    {Number(purchase.total).toLocaleString()} ل.س
                  </TableCell>
                  <TableCell>{purchase.supplier || '—'}</TableCell>
                  <TableCell>{purchase.invoiceNumber || '—'}</TableCell>
                  <TableCell>
                    {purchase.date
                      ? new Date(purchase.date).toLocaleDateString('ar-EG')
                      : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(purchase.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="عدد الصفوف"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
          }
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>عملية شراء جديدة</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>المنتج</InputLabel>
                <Select
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  label="المنتج"
                >
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} — المخزون: {p.quantity}
                      {p.modelNumber ? ` (${p.modelNumber})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                required
                label="الكمية"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                required
                label="سعر الوحدة"
                type="number"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">ل.س</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="المورد"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="رقم فاتورة المورد"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ملاحظات"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'حفظ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
