import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Alert, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, TextField, Button,
} from '@mui/material';
import { AccountBalanceWallet, TrendingUp, TrendingDown } from '@mui/icons-material';
import api from '../services/api';

export default function CashFlow() {
  const [summary, setSummary] = useState<any>(null);
  const [daily, setDaily] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        api.get('/cash-flow/summary'),
        api.get('/cash-flow/daily', { params: { date } }),
      ]);
      setSummary(s.data?.data ?? s.data);
      setDaily(d.data?.data ?? d.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل تحميل التقرير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !summary) {
    return <Box p={6} textAlign="center"><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Typography variant="h4" fontWeight={700}>حركة الصناديق</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <TextField size="small" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button variant="outlined" onClick={load}>تحديث</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} mb={3}>
        {(summary?.boxes || []).map((b: any) => (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountBalanceWallet color="primary" />
                  <Typography fontWeight={700}>{b.name}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{b.code}</Typography>
                <Typography variant="h5" fontWeight={800} mt={1}>
                  {Number(b.balance).toLocaleString()} ل.س
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, bgcolor: 'primary.main', color: '#fff' }}>
            <CardContent>
              <Typography fontWeight={700}>إجمالي الأرصدة</Typography>
              <Typography variant="h5" fontWeight={800} mt={1}>
                {Number(summary?.totalBalance || 0).toLocaleString()} ل.س
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUp color="success" />
              <Typography>وارد اليوم</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {Number(daily?.incoming || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingDown color="error" />
              <Typography>صادر اليوم</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="error.main">
              {Number(daily?.outgoing || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography>صافي اليوم</Typography>
            <Typography variant="h5" fontWeight={700}>
              {Number(daily?.net || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3 }}>
        <Box p={2}><Typography fontWeight={700}>حركات اليوم</Typography></Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>الوقت</TableCell>
              <TableCell>الصندوق</TableCell>
              <TableCell>الاتجاه</TableCell>
              <TableCell align="right">المبلغ</TableCell>
              <TableCell>المرجع</TableCell>
              <TableCell>ملاحظات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(daily?.transactions || []).length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">لا توجد حركات</TableCell></TableRow>
            ) : (daily.transactions as any[]).map((t) => (
              <TableRow key={t.id}>
                <TableCell>{new Date(t.date).toLocaleTimeString('ar-EG')}</TableCell>
                <TableCell>{t.cashBoxName}</TableCell>
                <TableCell>
                  <Chip size="small" color={t.direction === 'In' ? 'success' : 'error'}
                    label={t.direction === 'In' ? 'وارد' : 'صادر'} />
                </TableCell>
                <TableCell align="right">{Number(t.amount).toLocaleString()}</TableCell>
                <TableCell>{t.referenceType || '—'}</TableCell>
                <TableCell>{t.notes || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
