import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Grid, Alert, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment,
} from '@mui/material';
import {
  Add, Refresh, Search, Edit, Inventory2, WarningAmber,
} from '@mui/icons-material';
import api from '../services/api';

interface Material {
  id: number;
  code?: string;
  name: string;
  unit?: string;
  category?: string;
  modelNumber?: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  minStockAlert?: number;
  isLowStock?: boolean;
  isActive: boolean;
  barcode?: string;
  description?: string;
}

const emptyForm = {
  code: '', name: '', unit: 'قطعة', category: '', modelNumber: '',
  barcode: '', costPrice: '', sellPrice: '', quantity: '0',
  minStockAlert: '5', description: '',
};

export default function Materials() {
  const [items, setItems] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [stockForm, setStockForm] = useState({ mode: 'Add', quantity: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/materials', { params: { search, page, pageSize: 20 } });
      const payload = res.data?.data ?? res.data;
      setItems(payload?.data ?? []);
      setTotal(payload?.total ?? 0);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل تحميل المواد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (m: Material) => {
    setEditing(m);
    setForm({
      code: m.code || '',
      name: m.name,
      unit: m.unit || 'قطعة',
      category: m.category || '',
      modelNumber: m.modelNumber || '',
      barcode: m.barcode || '',
      costPrice: String(m.costPrice ?? 0),
      sellPrice: String(m.sellPrice ?? 0),
      quantity: String(m.quantity ?? 0),
      minStockAlert: String(m.minStockAlert ?? 5),
      description: m.description || '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    try {
      const body = {
        code: form.code || null,
        name: form.name,
        unit: form.unit,
        category: form.category || null,
        modelNumber: form.modelNumber || null,
        barcode: form.barcode || null,
        costPrice: Number(form.costPrice) || 0,
        sellPrice: Number(form.sellPrice) || 0,
        quantity: Number(form.quantity) || 0,
        minStockAlert: Number(form.minStockAlert) || 5,
        description: form.description || null,
      };
      if (editing) {
        await api.put(`/materials/${editing.id}`, body);
        setSuccess('تم تحديث بطاقة المادة');
      } else {
        await api.post('/materials', body);
        setSuccess('تم إنشاء بطاقة المادة');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل الحفظ');
    }
  };

  const adjustStock = async () => {
    if (!editing) return;
    try {
      await api.post(`/materials/${editing.id}/adjust-stock`, {
        mode: stockForm.mode,
        quantity: Number(stockForm.quantity),
        notes: stockForm.notes || null,
      });
      setSuccess('تم تعديل الكمية');
      setStockOpen(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل تعديل الكمية');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Typography variant="h4" fontWeight={700}>بطاقة المادة</Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={load}><Refresh /></IconButton>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>مادة جديدة</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <TextField
          size="small"
          placeholder="بحث بالاسم / الرمز / الموديل / الباركود"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ minWidth: 320 }}
        />
        <Button sx={{ ml: 1 }} onClick={() => { setPage(1); load(); }}>بحث</Button>
      </Paper>

      <Paper sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box p={6} textAlign="center"><CircularProgress /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>الرمز</TableCell>
                <TableCell>الاسم</TableCell>
                <TableCell>الفئة</TableCell>
                <TableCell>الوحدة</TableCell>
                <TableCell align="right">تكلفة</TableCell>
                <TableCell align="right">بيع</TableCell>
                <TableCell align="right">الكمية</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center">لا توجد مواد</TableCell></TableRow>
              ) : items.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell><Typography fontFamily="monospace">{m.code || '—'}</Typography></TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Inventory2 fontSize="small" color="action" />
                      {m.name}
                    </Box>
                  </TableCell>
                  <TableCell>{m.category || '—'}</TableCell>
                  <TableCell>{m.unit || 'قطعة'}</TableCell>
                  <TableCell align="right">{Number(m.costPrice).toLocaleString()}</TableCell>
                  <TableCell align="right">{Number(m.sellPrice).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                      {m.isLowStock && <WarningAmber color="warning" fontSize="small" />}
                      {m.quantity}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={m.isActive ? 'نشط' : 'معطل'} color={m.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(m)}><Edit fontSize="small" /></IconButton>
                    <Button size="small" onClick={() => {
                      setEditing(m);
                      setStockForm({ mode: 'Add', quantity: '', notes: '' });
                      setStockOpen(true);
                    }}>كمية</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Box p={2} display="flex" justifyContent="space-between">
          <Typography variant="body2">الإجمالي: {total}</Typography>
          <Box>
            <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
            <Button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>التالي</Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'تعديل بطاقة مادة' : 'بطاقة مادة جديدة'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={4}><TextField fullWidth label="الرمز" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} helperText="فارغ = توليد تلقائي" /></Grid>
            <Grid item xs={8}><TextField fullWidth required label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="الوحدة" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="الفئة" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="الموديل" value={form.modelNumber} onChange={(e) => setForm({ ...form, modelNumber: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="الباركود" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth type="number" label="سعر التكلفة" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth type="number" label="سعر البيع" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} /></Grid>
            {!editing && (
              <Grid item xs={4}><TextField fullWidth type="number" label="الكمية الافتتاحية" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Grid>
            )}
            <Grid item xs={4}><TextField fullWidth type="number" label="حد التنبيه" value={form.minStockAlert} onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={save}>حفظ</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>تعديل كمية — {editing?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth select label="العملية" value={stockForm.mode} onChange={(e) => setStockForm({ ...stockForm, mode: e.target.value })}>
                <MenuItem value="Add">إضافة</MenuItem>
                <MenuItem value="Subtract">طرح</MenuItem>
                <MenuItem value="Set">تعيين قيمة</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="number" label="الكمية" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="ملاحظات" value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={adjustStock}>تطبيق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
