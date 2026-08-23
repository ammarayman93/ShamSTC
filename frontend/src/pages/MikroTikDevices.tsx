import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Switch, FormControlLabel,
    Alert, CircularProgress, Tooltip, Stack, MenuItem, Select,
    FormControl, InputLabel, Avatar,
} from '@mui/material';
import {
    Add as AddIcon, Refresh as RefreshIcon, Edit as EditIcon,
    Delete as DeleteIcon, Wifi as WifiIcon, WifiOff as WifiOffIcon,
    NetworkCheck as CheckIcon, Router as RouterIcon,
    VpnKey as VpnIcon, Security as RadiusIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface MikroTikDevice {
    id: number;
    name: string;
    region?: string;
    ipAddress: string;
    vpnIp?: string;
    publicIp?: string;
    connectionType?: string; // L2TP | WireGuard | Direct
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
    clientsCount?: number; // من الـ backend إن وُجد
    clients?: any[];
}

const emptyForm = {
    name: '',
    region: '',
    ipAddress: '',
    vpnIp: '',
    publicIp: '',
    connectionType: 'WireGuard',
    username: 'admin',
    password: '',
    apiPort: 8728,
    radiusSecret: '',
    isEnabled: true,
    location: '',
    notes: '',
};

const vpnColors: Record<string, 'primary' | 'warning' | 'default' | 'info'> = {
    WireGuard: 'primary',
    L2TP: 'warning',
    Direct: 'default',
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
            // ترتيب حسب المنطقة ثم الاسم
            list.sort((a: MikroTikDevice, b: MikroTikDevice) => {
                const r = (a.region || '').localeCompare(b.region || '', 'ar');
                return r !== 0 ? r : (a.name || '').localeCompare(b.name || '');
            });
            setDevices(list);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'فشل تحميل أجهزة MikroTik');
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
            if (list.length) {
                list.sort((a: MikroTikDevice, b: MikroTikDevice) =>
                    (a.region || '').localeCompare(b.region || '', 'ar')
                );
                setDevices(list);
            } else await fetchDevices();
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
            connectionType: device.connectionType || 'WireGuard',
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
                connectionType: form.connectionType || 'WireGuard',
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

    const getClientCount = (d: MikroTikDevice) =>
        d.clientsCount ?? d.clients?.length ?? '—';

    const statusChip = (d: MikroTikDevice) => {
        const online = d.isOnline || d.status === 'Online';
        return online ? (
            <Chip
                icon={<WifiIcon />}
                label="متصل"
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
            />
        ) : (
                <Chip
                    icon={<WifiOffIcon />}
                    label="غير متصل"
                    color="error"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
            );
    };

    const vpnChip = (type?: string) => {
        const t = type || 'L2TP';
        return (
            <Chip
                icon={<VpnIcon sx={{ fontSize: 16 }} />}
                label={t}
                color={vpnColors[t] || 'default'}
                size="small"
                variant="outlined"
            />
        );
    };

    return (
        <Box>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                flexWrap="wrap"
                gap={1}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <RouterIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            أجهزة MikroTik / VPN
            </Typography>
                        <Typography variant="body2" color="text.secondary">
                            إدارة الفروع والاتصالات عبر WireGuard و L2TP
            </Typography>
                    </Box>
                </Stack>

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

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Table size="medium">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 700 }}>المنطقة</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>MikroTik</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>VPN</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>API</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>RADIUS</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">
                                العملاء
              </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">
                                إجراءات
              </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : devices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">
                                        لا توجد أجهزة — أضف سيرفر MikroTik من الزر أعلاه
                  </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                                    devices.map((d) => (
                                        <TableRow key={d.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell>
                                                <Typography fontWeight={600}>{d.region || d.location || '—'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <RouterIcon fontSize="small" color="action" />
                                                    <Typography fontWeight={500}>{d.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{vpnChip(d.connectionType)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace">
                                                    {d.vpnIp || d.ipAddress}
                                                </Typography>
                                                {d.publicIp && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        عام: {d.publicIp}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={d.apiPort || 8728} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                {d.radiusSecret ? (
                                                    <Chip
                                                        icon={<RadiusIcon sx={{ fontSize: 16 }} />}
                                                        label="OK"
                                                        color="success"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                        <Chip label="—" size="small" variant="outlined" color="default" />
                                                    )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography fontWeight={600}>{getClientCount(d)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {statusChip(d)}
                                                {d.lastError && (
                                                    <Tooltip title={d.lastError}>
                                                        <Typography
                                                            variant="caption"
                                                            color="error"
                                                            display="block"
                                                            noWrap
                                                            sx={{ maxWidth: 140, mt: 0.5 }}
                                                        >
                                                            {d.lastError}
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                                {d.lastCheckedAt && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {new Date(d.lastCheckedAt).toLocaleString('ar-SY')}
                                                    </Typography>
                                                )}
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

            {/* حوار الإضافة / التعديل */}
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
                            placeholder="Homs-MT-01"
                        />
                        <TextField
                            label="المنطقة"
                            fullWidth
                            value={form.region}
                            onChange={(e) => setForm({ ...form, region: e.target.value })}
                            placeholder="حمص / دمشق / درعا"
                        />
                        <FormControl fullWidth>
                            <InputLabel>نوع VPN</InputLabel>
                            <Select
                                value={form.connectionType}
                                label="نوع VPN"
                                onChange={(e) => setForm({ ...form, connectionType: e.target.value })}
                            >
                                <MenuItem value="WireGuard">WireGuard</MenuItem>
                                <MenuItem value="L2TP">L2TP / IPsec</MenuItem>
                                <MenuItem value="Direct">Direct (بدون VPN)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="IP للاتصال (داخل النفق)"
                            fullWidth
                            value={form.ipAddress}
                            onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                            placeholder="10.77.60.15"
                            helperText="يفضّل استخدام IP داخل WireGuard أو L2TP"
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

            {/* حوار الحذف */}
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