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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  NetworkCheck as CheckIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface MikroTikDevice {
  id: number;
  name: string;
  region?: string;
  ipAddress: string;
  vpnIp?: string;
  publicIp?: string;
  username: string;
  password?: string;
  apiPort: number;
  radiusSecret?: string;
  isEnabled: boolean;
  isOnline: boolean;
  status?: string;
  lastCheckedAt?: string;
  lastError?: string;
  location?: string;
  notes?: string;
}

const emptyForm = {
  name: '',
  region: '',
  ipAddress: '',
  vpnIp: '',
  publicIp: '',
  username: 'admin',
  password: '',
  apiPort: 8728,
  radiusSecret: '',
  isEnabled: true,
  location: '',
  notes: '',
};

export default function MikroTikDevices() {
  const [devices, setDevices] = useState<MikroTikDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedDevice, setSelectedDevice] = useState<MikroTikDevice | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/mikrotik-devices');
      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setDevices(list);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'فشل تحميل أجهزة MikroTik — تحقق من الـ API وقاعدة البيانات'
      );
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAll = async () => {
    setChecking(true);
    setError('');
    try {
      const res = await api.post('/mikrotik-devices/check-all');
      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload) ? payload : [];
      if (list.length) setDevices(list);
      else await fetchDevices();
      setSuccess('تم فحص اتصال جميع الأجهزة');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل فحص الأجهزة');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOne = async (id: number) => {
    try {
      const res = await api.post(`/mikrotik-devices/${id}/check`);
      const data = res.data?.data ?? res.data;
      setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (device: MikroTikDevice) => {
    setEditingId(device.id);
    setForm({
      name: device.name || '',
      region: device.region || '',
      ipAddress: device.ipAddress || '',
      vpnIp: device.vpnIp || '',
      publicIp: device.publicIp || '',
      username: device.username || 'admin',
      password: '',
      apiPort: device.apiPort || 8728,
      radiusSecret: device.radiusSecret || '',
      isEnabled: device.isEnabled,
      location: device.location || '',
      notes: device.notes || '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.ipAddress) {
      setError('الاسم وعنوان IP مطلوبان');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        ...form,
        vpnIp: form.vpnIp || form.ipAddress,
        apiPort: Number(form.apiPort) || 8728,
      };
      if (editingId) {
        await api.put(`/mikrotik-devices/${editingId}`, body);
        setSuccess('تم تحديث الجهاز بنجاح');
      } else {
        await api.post('/mikrotik-devices', body);
        setSuccess('تم إضافة الجهاز بنجاح');
      }
      setTimeout(() => setSuccess(''), 3000);
      setDialogOpen(false);
      await fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (device: MikroTikDevice) => {
    setSelectedDevice(device);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDevice) return;
    setSubmitting(true);
    try {
      await api.delete(`/mikrotik-devices/${selectedDevice.id}`);
      setDeleteDialogOpen(false);
      setSuccess('تم حذف الجهاز');
      setTimeout(() => setSuccess(''), 3000);
      await fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل الحذف');
      setDeleteDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const statusChip = (d: MikroTikDevice) => {
    const online = d.isOnline || d.status === 'Online';
    return online ? (
      <Chip icon={<WifiIcon />} label="متصل" color="success" size="small" />
    ) : (
      <Chip icon={<WifiOffIcon />} label="غير متصل" color="default" size="small" />
    );
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>
          أجهزة MikroTik
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={checking ? <CircularProgress size={18} /> : <CheckIcon />}
            onClick={handleCheckAll}
            disabled={checking}
          >
            فحص الكل
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchDevices}>
            تحديث
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            إضافة جهاز
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>المنطقة</TableCell>
              <TableCell>IP / VPN</TableCell>
              <TableCell>المنفذ</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>مفعّل</TableCell>
              <TableCell>آخر فحص</TableCell>
              <TableCell align="center">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  لا توجد أجهزة — أضف سيرفر MikroTik من الزر أعلاه
                </TableCell>
              </TableRow>
            ) : (
              devices.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.region || d.location || '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{d.ipAddress}</Typography>
                    {d.vpnIp && d.vpnIp !== d.ipAddress && (
                      <Typography variant="caption" color="text.secondary">
                        VPN: {d.vpnIp}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{d.apiPort}</TableCell>
                  <TableCell>
                    {statusChip(d)}
                    {d.lastError && (
                      <Tooltip title={d.lastError}>
                        <Typography variant="caption" color="error" display="block" noWrap sx={{ maxWidth: 120 }}>
                          {d.lastError}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={d.isEnabled ? 'نعم' : 'لا'}
                      size="small"
                      color={d.isEnabled ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {d.lastCheckedAt
                      ? new Date(d.lastCheckedAt).toLocaleString('ar-SY')
                      : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="فحص الاتصال">
                      <IconButton size="small" onClick={() => handleCheckOne(d.id)}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="تعديل">
                      <IconButton size="small" onClick={() => openEdit(d)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton size="small" color="error" onClick={() => confirmDelete(d)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* إضافة / تعديل */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'تعديل جهاز MikroTik' : 'إضافة جهاز MikroTik'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="الاسم"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Damascus-MT-01"
            />
            <TextField
              label="المنطقة"
              fullWidth
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              placeholder="Damascus"
            />
            <TextField
              label="IP للاتصال (VPN أو LAN)"
              fullWidth
              value={form.ipAddress}
              onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
              placeholder="10.50.0.2"
            />
            <TextField
              label="VpnIp (اختياري إن اختلف)"
              fullWidth
              value={form.vpnIp}
              onChange={(e) => setForm({ ...form, vpnIp: e.target.value })}
            />
            <TextField
              label="IP عام (اختياري)"
              fullWidth
              value={form.publicIp}
              onChange={(e) => setForm({ ...form, publicIp: e.target.value })}
            />
            <TextField
              label="اسم مستخدم API"
              fullWidth
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <TextField
              label={editingId ? 'كلمة المرور (اتركها فارغة إن لم تتغير)' : 'كلمة المرور'}
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <TextField
              label="منفذ API"
              type="number"
              fullWidth
              value={form.apiPort}
              onChange={(e) => setForm({ ...form, apiPort: Number(e.target.value) })}
            />
            <TextField
              label="Radius Secret (لهذا الراوتر)"
              fullWidth
              value={form.radiusSecret}
              onChange={(e) => setForm({ ...form, radiusSecret: e.target.value })}
            />
            <TextField
              label="ملاحظات"
              fullWidth
              multiline
              minRows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isEnabled}
                  onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                />
              }
              label="مفعّل"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleSave} disabled={submitting}>
            {submitting ? <CircularProgress size={22} /> : 'حفظ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حذف */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          هل تريد حذف الجهاز «{selectedDevice?.name}»؟
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={submitting}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
