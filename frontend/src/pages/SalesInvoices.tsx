import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Grid, Alert, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Divider,
} from '@mui/material';
import { Add, Refresh, Delete, Visibility } from '@mui/icons-material';
import api from '../services/api';

interface Line {
  productId: string;
  quantity: string;
  unitPrice: string;
}

export default function SalesInvoices() {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [cashBoxes, setCashBoxes] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  const [form, setForm] = useState({
    invoiceNumber: '',
    clientId: '',
    clientName: '',
    clientPhone: '',
    tax: '0',
    discount: '0',
    paymentStatus: 'Paid',
    paidAmount: '',
    cashBoxId: '',
    notes: '',
  });
  const [lines, setLines] = useState<Line[]>([{ productId: '', quantity: '1', unitPrice: '0' }]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales-invoices', { params: { page, pageSize: 20 } });
      const p = res.data?.data ?? res.data;
      setList(p?.data ?? []);
      setTotal(p?.total ?? 0);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [m, c, b] = await Promise.all([
        api.get('/materials', { params: { pageSize: 200 } }),
        api.get('/clients', { params: { page: 1, pageSize: 200 } }),
        api.get('/cash-boxes'),
      ]);
      const md = m.data?.data?.data ?? m.data?.data ?? [];
      setMaterials(Array.isArray(md) ? md : []);
      const cd = c.data?.data?.data ?? c.data?.data ?? c.data ?? [];
      setClients(Array.isArray(cd) ? cd : []);
      const bd = b.data?.data ?? b.data ?? [];
      setCashBoxes(Array.isArray(bd) ? bd : []);
      const sales = (Array.isArray(bd) ? bd : []).find((x: any) => x.code === 'SALES');
      if (sales) setForm((f) => ({ ...f, cashBoxId: String(sales.id) }));
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); loadLookups(); }, [page]);

  const subTotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const grand = Math.max(0, subTotal + (Number(form.tax) || 0) - (Number(form.discount) || 0));

  const save = async () => {
    try {
      await api.post('/sales-invoices', {
        invoiceNumber: form.invoiceNumber || null,
        clientId: form.clientId ? Number(form.clientId) : null,
        clientName: form.clientName || null,
        clientPhone: form.clientPhone || null,
        tax: Number(form.tax) || 0,
        discount: Number(form.discount) || 0,
        paymentStatus: form.paymentStatus,
        paidAmount: form.paymentStatus === 'Partial' ? Number(form.paidAmount) || 0 : null,
        cashBoxId: form.cashBoxId ? Number(form.cashBoxId) : null,
        notes: form.notes || null,
        items: lines.filter((l) => l.productId).map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      });
      setSuccess('تم حفظ فاتورة المبيعات');
      setCreateOpen(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل الحفظ');
    }
  };

  const view = async (id: number) => {
    try {
      const res = await api.get(`/sales-invoices/${id}`);
      setDetail(res.data?.data ?? res.data);
      setViewOpen(true);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل العرض');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف الفاتورة وإرجاع الكميات للمخزون؟')) return;
    try {
      await api.delete(`/sales-invoices/${id}`);
      setSuccess('تم الحذف');
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل الحذف');
    }
  };

  const statusColor = (s: string) =>
    s === 'Paid' ? 'success' : s === 'Partial' ? 'warning' : 'default';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>فواتير المبيعات</Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={load}><Refresh /></IconButton>
          <Button variant="contained" startIcon={<Add />} onClick={() => {
            setLines([{ productId: '', quantity: '1', unitPrice: '0' }]);
            setCreateOpen(true);
          }}>فاتورة جديدة</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ borderRadius: 3 }}>
        {loading ? <Box p={4} textAlign="center"><CircularProgress /></Box> : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>الرقم</TableCell>
                <TableCell>العميل</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell align="right">الإجمالي</TableCell>
                <TableCell>الدفع</TableCell>
                <TableCell>الصندوق</TableCell>
                <TableCell>بنود</TableCell>
                <TableCell align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">لا توجد فواتير</TableCell></TableRow>
              ) : list.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.invoiceNumber}</TableCell>
                  <TableCell>{r.clientName || '—'}</TableCell>
                  <TableCell>{new Date(r.date).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell align="right">{Number(r.total).toLocaleString()}</TableCell>
                  <TableCell><Chip size="small" color={statusColor(r.paymentStatus) as any} label={r.paymentStatus} /></TableCell>
                  <TableCell>{r.cashBoxName || '—'}</TableCell>
                  <TableCell>{r.itemsCount}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => view(r.id)}><Visibility fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(r.id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Box p={2} display="flex" justifyContent="space-between">
          <Typography variant="body2">الإجمالي: {total}</Typography>
          <Box>
            <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>السابق</Button>
            <Button disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>التالي</Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>فاتورة مبيعات جديدة</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={4}>
              <TextField fullWidth label="رقم الفاتورة" value={form.invoiceNumber}
                onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} helperText="فارغ = تلقائي" />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="عميل من النظام" value={form.clientId}
                onChange={(e) => {
                  const id = e.target.value;
                  const cl = clients.find((c: any) => String(c.id) === id);
                  setForm({
                    ...form,
                    clientId: id,
                    clientName: cl?.fullName || cl?.name || form.clientName,
                    clientPhone: cl?.phone || form.clientPhone,
                  });
                }}>
                <MenuItem value="">— يدوي —</MenuItem>
                {clients.map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>{c.fullName || c.name || c.username}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="اسم العميل" value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="هاتف العميل" value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
            </Grid>

            {lines.map((line, idx) => (
              <Grid item xs={12} key={idx} container spacing={1}>
                <Grid item xs={5}>
                  <TextField fullWidth select label="المادة" value={line.productId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const mat = materials.find((m) => String(m.id) === v);
                      const next = [...lines];
                      next[idx] = {
                        ...next[idx],
                        productId: v,
                        unitPrice: mat ? String(mat.sellPrice ?? 0) : next[idx].unitPrice,
                      };
                      setLines(next);
                    }}>
                    {materials.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.code ? `${m.code} — ` : ''}{m.name} (متوفر: {m.quantity})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={2}>
                  <TextField fullWidth type="number" label="الكمية" value={line.quantity}
                    onChange={(e) => { const n = [...lines]; n[idx].quantity = e.target.value; setLines(n); }} />
                </Grid>
                <Grid item xs={2}>
                  <TextField fullWidth type="number" label="سعر البيع" value={line.unitPrice}
                    onChange={(e) => { const n = [...lines]; n[idx].unitPrice = e.target.value; setLines(n); }} />
                </Grid>
                <Grid item xs={2}>
                  <TextField fullWidth label="الإجمالي"
                    value={((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0)).toFixed(2)}
                    InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={1}>
                  <Button color="error" disabled={lines.length <= 1}
                    onClick={() => setLines(lines.filter((_, i) => i !== idx))}>حذف</Button>
                </Grid>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button onClick={() => setLines([...lines, { productId: '', quantity: '1', unitPrice: '0' }])}>+ بند</Button>
            </Grid>

            <Grid item xs={12}><Divider /></Grid>
            <Grid item xs={3}><TextField fullWidth type="number" label="ضريبة" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField fullWidth type="number" label="خصم" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField fullWidth label="المجموع" value={grand.toFixed(2)} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={3}>
              <TextField fullWidth select label="حالة الدفع" value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                <MenuItem value="Paid">مدفوع</MenuItem>
                <MenuItem value="Partial">جزئي</MenuItem>
                <MenuItem value="Unpaid">غير مدفوع</MenuItem>
              </TextField>
            </Grid>
            {form.paymentStatus === 'Partial' && (
              <Grid item xs={4}>
                <TextField fullWidth type="number" label="المبلغ المدفوع" value={form.paidAmount}
                  onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} />
              </Grid>
            )}
            <Grid item xs={4}>
              <TextField fullWidth select label="الصندوق" value={form.cashBoxId}
                onChange={(e) => setForm({ ...form, cashBoxId: e.target.value })}>
                {cashBoxes.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="ملاحظات" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={save}>حفظ الفاتورة</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>فاتورة {detail?.invoiceNumber}</DialogTitle>
        <DialogContent>
          {detail && (
            <Box>
              <Typography>العميل: {detail.clientName || '—'}</Typography>
              <Typography>التاريخ: {new Date(detail.date).toLocaleString('ar-EG')}</Typography>
              <Typography>الإجمالي: {Number(detail.total).toLocaleString()}</Typography>
              <Typography>الدفع: {detail.paymentStatus} ({Number(detail.paidAmount).toLocaleString()})</Typography>
              <Typography>الصندوق: {detail.cashBoxName || '—'}</Typography>
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>المادة</TableCell>
                    <TableCell align="right">كمية</TableCell>
                    <TableCell align="right">سعر</TableCell>
                    <TableCell align="right">إجمالي</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(detail.items || []).map((it: any) => (
                    <TableRow key={it.id}>
                      <TableCell>{it.productCode ? `${it.productCode} — ` : ''}{it.productName}</TableCell>
                      <TableCell align="right">{it.quantity}</TableCell>
                      <TableCell align="right">{Number(it.unitPrice).toLocaleString()}</TableCell>
                      <TableCell align="right">{Number(it.lineTotal).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
