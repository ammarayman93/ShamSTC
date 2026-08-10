import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Alert,
  CircularProgress, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, IconButton,
} from '@mui/material';
import {
  AccountBalanceWallet, Refresh as RefreshIcon, SwapHoriz, Add,
} from '@mui/icons-material';
import api from '../services/api';

interface CashBox {
  id: number;
  code: string;
  name: string;
  balance: number;
  isActive: boolean;
  accountName?: string;
}

interface Tx {
  id: number;
  direction: string;
  amount: number;
  balanceAfter: number;
  date: string;
  notes?: string;
  referenceType?: string;
}

export default function CashBoxes() {
  const [boxes, setBoxes] = useState<CashBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState<CashBox | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [moveOpen, setMoveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [moveForm, setMoveForm] = useState({ cashBoxId: '', direction: 'In', amount: '', notes: '' });
  const [transferForm, setTransferForm] = useState({ fromCashBoxId: '', toCashBoxId: '', amount: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cash-boxes');
      const data = res.data?.data ?? res.data ?? [];
      setBoxes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل تحميل الصناديق');
    } finally {
      setLoading(false);
    }
  };

  const loadTx = async (id: number) => {
    try {
      const res = await api.get(`/cash-boxes/${id}/transactions`);
      const data = res.data?.data ?? res.data ?? [];
      setTxs(Array.isArray(data) ? data : []);
    } catch {
      setTxs([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectBox = (b: CashBox) => {
    setSelected(b);
    loadTx(b.id);
  };

  const submitMove = async () => {
    try {
      await api.post('/cash-boxes/movement', {
        cashBoxId: Number(moveForm.cashBoxId),
        direction: moveForm.direction,
        amount: Number(moveForm.amount),
        notes: moveForm.notes || null,
      });
      setSuccess('تمت الحركة');
      setMoveOpen(false);
      load();
      if (selected) loadTx(selected.id);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشلت الحركة');
    }
  };

  const submitTransfer = async () => {
    try {
      await api.post('/cash-boxes/transfer', {
        fromCashBoxId: Number(transferForm.fromCashBoxId),
        toCashBoxId: Number(transferForm.toCashBoxId),
        amount: Number(transferForm.amount),
        notes: transferForm.notes || null,
      });
      setSuccess('تم التحويل');
      setTransferOpen(false);
      load();
      if (selected) loadTx(selected.id);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل التحويل');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>الصناديق</Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={load}><RefreshIcon /></IconButton>
          <Button variant="outlined" startIcon={<SwapHoriz />} onClick={() => setTransferOpen(true)}>تحويل</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setMoveOpen(true)}>حركة يدوية</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box textAlign="center" p={4}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2} mb={3}>
          {boxes.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: selected?.id === b.id ? 2 : 0,
                  borderColor: 'primary.main',
                }}
                onClick={() => selectBox(b)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AccountBalanceWallet color="primary" />
                    <Typography fontWeight={700}>{b.name}</Typography>
                    {!b.isActive && <Chip size="small" label="معطل" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">{b.code}</Typography>
                  <Typography variant="h5" fontWeight={800} mt={1}>
                    {Number(b.balance).toLocaleString()} ل.س
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selected && (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" mb={2}>حركات: {selected.name}</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>التاريخ</TableCell>
                <TableCell>الاتجاه</TableCell>
                <TableCell align="right">المبلغ</TableCell>
                <TableCell align="right">الرصيد بعد</TableCell>
                <TableCell>المرجع</TableCell>
                <TableCell>ملاحظات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {txs.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">لا توجد حركات</TableCell></TableRow>
              ) : txs.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleString('ar-EG')}</TableCell>
                  <TableCell>
                    <Chip size="small" color={t.direction === 'In' ? 'success' : 'error'}
                      label={t.direction === 'In' ? 'وارد' : 'صادر'} />
                  </TableCell>
                  <TableCell align="right">{Number(t.amount).toLocaleString()}</TableCell>
                  <TableCell align="right">{Number(t.balanceAfter).toLocaleString()}</TableCell>
                  <TableCell>{t.referenceType || '—'}</TableCell>
                  <TableCell>{t.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={moveOpen} onClose={() => setMoveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>حركة يدوية</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth select label="الصندوق" value={moveForm.cashBoxId}
                onChange={(e) => setMoveForm({ ...moveForm, cashBoxId: e.target.value })}>
                {boxes.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="الاتجاه" value={moveForm.direction}
                onChange={(e) => setMoveForm({ ...moveForm, direction: e.target.value })}>
                <MenuItem value="In">وارد</MenuItem>
                <MenuItem value="Out">صادر</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="المبلغ" value={moveForm.amount}
                onChange={(e) => setMoveForm({ ...moveForm, amount: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="ملاحظات" value={moveForm.notes}
                onChange={(e) => setMoveForm({ ...moveForm, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={submitMove}>حفظ</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تحويل بين الصناديق</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth select label="من صندوق" value={transferForm.fromCashBoxId}
                onChange={(e) => setTransferForm({ ...transferForm, fromCashBoxId: e.target.value })}>
                {boxes.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="إلى صندوق" value={transferForm.toCashBoxId}
                onChange={(e) => setTransferForm({ ...transferForm, toCashBoxId: e.target.value })}>
                {boxes.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="number" label="المبلغ" value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="ملاحظات" value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={submitTransfer}>تحويل</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
