// frontend/src/pages/Clients.tsx
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
    TablePagination,
    TextField,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    MoreVert as MoreVertIcon,
    PlayArrow as ActivateIcon,
    Pause as SuspendIcon,
    DeleteForever as DeleteForeverIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Autorenew as RenewIcon,
    Speed as SpeedIcon,
    VpnKey as PasswordIcon,
    Visibility as VisibilityIcon,
    Wifi as WifiIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Plan {
    id: number;
    name: string;
    speed: string;
    price: number;
    durationDays: number;
}

interface Subscription {
    id: number;
    planId?: number;
    planName: string;
    planSpeed?: string;
    endDate: string;
    isActive: boolean;
    daysRemaining?: number;
}

interface Client {
    id: number;
    username: string;
    fullName: string;
    phone: string;
    email: string;
    status: string;
    nationalId: string;
    macAddress: string;
    ipAddress: string;
    address?: string;
    city?: string;
    area?: string;
    paymentStatus?: string;
    dataUsed?: string;
    createdAt?: string;
    isOnline?: boolean;
    onlineIp?: string;
    onlineMac?: string;
    onlineSince?: string;
    activeSubscription?: Subscription;
}

export default function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Dialogs
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [activateDialogOpen, setActivateDialogOpen] = useState(false);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
    const [renewDialogOpen, setRenewDialogOpen] = useState(false);
    const [speedDialogOpen, setSpeedDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

    // Forms / state
    const [editFormData, setEditFormData] = useState<any>({});
    const [detailLoading, setDetailLoading] = useState(false);
    const [liveStats, setLiveStats] = useState<any>(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [pingResult, setPingResult] = useState<any>(null);
    const [pingLoading, setPingLoading] = useState(false);
    const [subDates, setSubDates] = useState({ startDate: '', endDate: '' });
    const [savingDates, setSavingDates] = useState(false);
    const [detailMode, setDetailMode] = useState<'view' | 'edit'>('view');
    const [newSpeed, setNewSpeed] = useState('10M/10M');
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
        const interval = setInterval(() => {
            fetchClients();
        }, 15000);
        return () => clearInterval(interval);
    }, [page, rowsPerPage, search]);

    const fetchClients = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/clients', {
                params: { page: page + 1, pageSize: rowsPerPage, search },
            });

            // يدعم success أو Success
            const body = response.data;
            const ok = body?.success === true || body?.Success === true;
            const payload = body?.data ?? body?.Data;

            if (ok && payload) {
                const list = payload.data ?? payload.Data ?? [];
                const totalCount = payload.total ?? payload.Total ?? 0;
                // توحيد حقول الاتصال مهما كان شكل الـ JSON
                const normalized = (Array.isArray(list) ? list : []).map((c: any) => ({
                    ...c,
                    isOnline: c.isOnline === true || c.IsOnline === true,
                    onlineIp: c.onlineIp ?? c.OnlineIp ?? null,
                    onlineMac: c.onlineMac ?? c.OnlineMac ?? null,
                    onlineSince: c.onlineSince ?? c.OnlineSince ?? null,
                    paymentStatus: c.paymentStatus ?? c.PaymentStatus ?? 'Pending',
                    createdAt: c.createdAt ?? c.CreatedAt,
                    activeSubscription: c.activeSubscription ?? c.ActiveSubscription
                        ? {
                            ...(c.activeSubscription ?? c.ActiveSubscription),
                            planName: (c.activeSubscription ?? c.ActiveSubscription).planName
                                ?? (c.activeSubscription ?? c.ActiveSubscription).PlanName,
                            planSpeed: (c.activeSubscription ?? c.ActiveSubscription).planSpeed
                                ?? (c.activeSubscription ?? c.ActiveSubscription).PlanSpeed,
                            endDate: (c.activeSubscription ?? c.ActiveSubscription).endDate
                                ?? (c.activeSubscription ?? c.ActiveSubscription).EndDate,
                            isActive: (c.activeSubscription ?? c.ActiveSubscription).isActive
                                ?? (c.activeSubscription ?? c.ActiveSubscription).IsActive,
                        }
                        : null,
                }));
                setClients(normalized);
                setTotal(totalCount);
            } else {
                setClients([]);
                setTotal(0);
                setError(body?.message || body?.Message || 'فشل تحميل العملاء');
            }
        } catch (err: any) {
            console.error('fetchClients error:', err);
            setClients([]);
            setTotal(0);
            setError(
                err.response?.data?.message ||
                err.response?.data?.Message ||
                err.message ||
                'خطأ في الاتصال بالخادم'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
        setAnchorEl(event.currentTarget);
        setSelectedClient(client);
    };

    const handleMenuClose = () => setAnchorEl(null);

    // ========== Edit ==========
    const openClientDetail = async (mode: 'view' | 'edit') => {
        if (!selectedClient) return;
        handleMenuClose();
        setDetailMode(mode);
        setDetailLoading(true);
        setEditDialogOpen(true);
        setError('');
        try {
            const res = await api.get(`/clients/${selectedClient.id}`);
            const body = res.data;
            const d = body?.data ?? body?.Data ?? body;
            setEditFormData({
                id: d.id ?? d.Id,
                username: d.username ?? d.Username ?? '',
                fullName: d.fullName ?? d.FullName ?? '',
                firstName: d.firstName ?? d.FirstName ?? '',
                lastName: d.lastName ?? d.LastName ?? '',
                displayName: d.displayName ?? d.DisplayName ?? '',
                title: d.title ?? d.Title ?? '',
                phone: d.phone ?? d.Phone ?? '',
                secondaryPhone: d.secondaryPhone ?? d.SecondaryPhone ?? '',
                email: d.email ?? d.Email ?? '',
                nationalId: d.nationalId ?? d.NationalId ?? '',
                status: d.status ?? d.Status ?? '',
                address: d.address ?? d.Address ?? '',
                city: d.city ?? d.City ?? '',
                area: d.area ?? d.Area ?? '',
                street: d.street ?? d.Street ?? '',
                apartment: d.apartment ?? d.Apartment ?? '',
                fatherName: d.fatherName ?? d.FatherName ?? '',
                motherName: d.motherName ?? d.MotherName ?? '',
                gender: d.gender ?? d.Gender ?? '',
                birthDate: (d.birthDate ?? d.BirthDate ?? '').toString().slice(0, 10),
                birthPlace: d.birthPlace ?? d.BirthPlace ?? '',
                contractNumber: d.contractNumber ?? d.ContractNumber ?? '',
                notes: d.notes ?? d.Notes ?? '',
                paymentStatus: d.paymentStatus ?? d.PaymentStatus ?? 'Pending',
                macAddress: d.macAddress ?? d.MacAddress ?? '',
                ipAddress: d.ipAddress ?? d.IpAddress ?? '',
                idFrontImage: d.idFrontImage ?? d.IdFrontImage ?? '',
                idBackImage: d.idBackImage ?? d.IdBackImage ?? '',
                contractFrontImage: d.contractFrontImage ?? d.ContractFrontImage ?? '',
                contractBackImage: d.contractBackImage ?? d.ContractBackImage ?? '',
                isOnline: d.isOnline ?? d.IsOnline ?? false,
                onlineIp: d.onlineIp ?? d.OnlineIp ?? '',
                activeSubscription: d.activeSubscription ?? d.ActiveSubscription ?? null,
                hasFreeSubscription: d.hasFreeSubscription ?? d.HasFreeSubscription ?? false,
                freeSpeed: d.freeSpeed ?? d.FreeSpeed ?? '',
                createdAt: d.createdAt ?? d.CreatedAt ?? '',
            });
            // تواريخ الاشتراك
            const sub = d.activeSubscription ?? d.ActiveSubscription;
            if (sub) {
                const sd = (sub.startDate ?? sub.StartDate ?? '').toString().slice(0, 10);
                const ed = (sub.endDate ?? sub.EndDate ?? '').toString().slice(0, 10);
                setSubDates({ startDate: sd, endDate: ed });
            } else {
                setSubDates({ startDate: '', endDate: '' });
            }

            // إحصاءات حية
            try {
                const ls = await api.get(`/clients/${selectedClient.id}/live-stats`);
                const body2 = ls.data;
                setLiveStats(body2?.data ?? body2?.Data ?? body2);
            } catch {
                setLiveStats(null);
            }
            setPingResult(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تحميل بيانات العميل');
        } finally {
            setDetailLoading(false);
        }
    };

    const handlePing = async () => {
        const id = selectedClient?.id ?? editFormData?.id;
        if (!id) return;
        setPingLoading(true);
        setPingResult(null);
        try {
            const res = await api.post(`/clients/${id}/ping?count=4`);
            const body = res.data;
            setPingResult(body?.data ?? body?.Data ?? body);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.Message || 'فشل الـ Ping');
        } finally {
            setPingLoading(false);
        }
    };

    const handleSaveSubDates = async () => {
        const id = selectedClient?.id ?? editFormData?.id;
        if (!id) return;
        if (!subDates.startDate || !subDates.endDate) {
            setError('أدخل تاريخ البداية والنهاية');
            return;
        }
        setSavingDates(true);
        setError('');
        try {
            await api.put(`/clients/${id}/subscription-dates`, {
                startDate: subDates.startDate,
                endDate: subDates.endDate,
            });
            setSuccess('تم تحديث تواريخ الاشتراك');
            setTimeout(() => setSuccess(''), 3000);
            // أعد تحميل الإحصاءات
            const ls = await api.get(`/clients/${id}/live-stats`);
            setLiveStats(ls.data?.data ?? ls.data?.Data ?? ls.data);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.Message || 'فشل تحديث التواريخ');
        } finally {
            setSavingDates(false);
        }
    };

    const handleEditClick = () => openClientDetail('edit');
    const handleViewClick = () => openClientDetail('view');

    const handleClientStatusClick = async () => {
        if (!selectedClient) return;
        handleMenuClose();
        setStatusDialogOpen(true);
        setStatusLoading(true);
        setLiveStats(null);
        setPingResult(null);
        setError('');
        try {
            const ls = await api.get(`/clients/${selectedClient.id}/live-stats`);
            const body = ls.data;
            setLiveStats(body?.data ?? body?.Data ?? body);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.Message || 'فشل تحميل حالة العميل');
        } finally {
            setStatusLoading(false);
        }
    };



    const handleSaveEdit = async () => {
        if (!selectedClient && !editFormData?.id) return;
        const id = selectedClient?.id ?? editFormData.id;
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                fullName: editFormData.fullName,
                firstName: editFormData.firstName,
                lastName: editFormData.lastName,
                displayName: editFormData.displayName,
                title: editFormData.title,
                phone: editFormData.phone,
                secondaryPhone: editFormData.secondaryPhone,
                email: editFormData.email,
                address: editFormData.address,
                city: editFormData.city,
                area: editFormData.area,
                street: editFormData.street,
                apartment: editFormData.apartment,
                fatherName: editFormData.fatherName,
                motherName: editFormData.motherName,
                gender: editFormData.gender,
                birthDate: editFormData.birthDate || null,
                birthPlace: editFormData.birthPlace,
                contractNumber: editFormData.contractNumber,
                notes: editFormData.notes,
                paymentStatus: editFormData.paymentStatus,
                nationalId: editFormData.nationalId,
                macAddress: editFormData.macAddress,
                ipAddress: editFormData.ipAddress,
                status: editFormData.status,
                idFrontImage: editFormData.idFrontImage || null,
                idBackImage: editFormData.idBackImage || null,
                contractFrontImage: editFormData.contractFrontImage || null,
                contractBackImage: editFormData.contractBackImage || null,
            };
            await api.put(`/clients/${id}`, payload);
            setSuccess('تم تحديث بيانات العميل بنجاح');
            setTimeout(() => setSuccess(''), 3000);
            setEditDialogOpen(false);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.Message || 'حدث خطأ أثناء التحديث');
        } finally {
            setSubmitting(false);
        }
    };

    const setEditField = (key: string, value: any) =>
        setEditFormData((prev: any) => ({ ...prev, [key]: value }));

    // ========== Suspend ==========
    const handleSuspendClick = () => {
        setSuspendDialogOpen(true);
        handleMenuClose();
    };

    const handleSuspendConfirm = async () => {
        if (!selectedClient) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post(`/clients/${selectedClient.id}/suspend`);
            setSuccess('تم إيقاف العميل وتعطيله في RADIUS بنجاح');
            setTimeout(() => setSuccess(''), 3000);
            setSuspendDialogOpen(false);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل إيقاف العميل');
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Activate ==========
    const handleActivateClick = () => {
        setActivateDialogOpen(true);
        handleMenuClose();
    };

    const handleActivateConfirm = async () => {
        if (!selectedClient) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post(`/clients/${selectedClient.id}/activate`);
            setSuccess('تم تفعيل العميل في النظام وRADIUS بنجاح');
            setTimeout(() => setSuccess(''), 3000);
            setActivateDialogOpen(false);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تفعيل العميل');
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Renew ==========
    const handleRenewClick = () => {
        setRenewDialogOpen(true);
        handleMenuClose();
    };

    const handleRenewConfirm = async () => {
        if (!selectedClient) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post(`/clients/${selectedClient.id}/renew`);
            setSuccess('تم تجديد الاشتراك وتحديث RADIUS بنجاح');
            setTimeout(() => setSuccess(''), 3000);
            setRenewDialogOpen(false);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تجديد الاشتراك');
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Speed ==========
    const handleSpeedClick = () => {
        const currentSpeed =
            selectedClient?.activeSubscription?.planSpeed || '10M/10M';
        setNewSpeed(currentSpeed);
        setSpeedDialogOpen(true);
        handleMenuClose();
    };

    const handleSpeedConfirm = async () => {
        if (!selectedClient || !newSpeed.trim()) return;
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/clients/${selectedClient.id}/speed`, {
                speed: newSpeed.trim(),
            });
            setSuccess('تم تحديث السرعة في RADIUS بنجاح');
            setTimeout(() => setSuccess(''), 3000);
            setSpeedDialogOpen(false);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تحديث السرعة');
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Reset Password ==========
    const handleResetPasswordClick = () => {
        setGeneratedPassword(null);
        setResetPasswordDialogOpen(true);
        handleMenuClose();
    };

    
    const handleViewPassword = async () => {
        if (!selectedClient) return;
        handleMenuClose();
        setError('');
        try {
            const res = await api.get(`/clients/${selectedClient.id}/password`);
            const body = res.data;
            const payload = body?.data ?? body?.Data ?? body;
            const pass = payload?.password ?? payload?.Password;
            if (pass) {
                setGeneratedPassword(String(pass));
                setResetPasswordDialogOpen(true);
                setSuccess(`كلمة مرور العميل: ${selectedClient.username}`);
            } else {
                setError('لم يتم العثور على كلمة المرور في RADIUS');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.Message || 'فشل جلب كلمة المرور');
        }
    };

const handleResetPasswordConfirm = async () => {
        if (!selectedClient) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await api.post(`/clients/${selectedClient.id}/reset-password`);
            const data = res.data?.data || res.data;
            setGeneratedPassword(data.password);
            setSuccess('تم إعادة تعيين كلمة المرور بنجاح');
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل إعادة تعيين كلمة المرور');
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Delete (soft) ==========
    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedClient) return;
        setSubmitting(true);
        setError('');
        try {
            await api.delete(`/clients/${selectedClient.id}`);
            setSuccess('تم حذف العميل بنجاح');
            setTimeout(() => setSuccess(''), 3000);
            setDeleteDialogOpen(false);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل الحذف');
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Permanent Delete ==========
    const handlePermanentDeleteClick = () => {
        setPermanentDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handlePermanentDeleteConfirm = async () => {
        if (!selectedClient) return;
        setSubmitting(true);
        setError('');
        try {
            await api.delete(`/clients/${selectedClient.id}/permanent`);
            setSuccess('تم حذف العميل نهائياً من النظام وRADIUS');
            setTimeout(() => setSuccess(''), 3000);
            setPermanentDeleteDialogOpen(false);
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل الحذف النهائي');
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Helpers ==========
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG');
    };

    const getDaysRemaining = (endDate?: string) => {
        if (!endDate) return null;
        const diff = new Date(endDate).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Active':
                return <Chip label="نشط" color="success" size="small" />;
            case 'Suspended':
                return <Chip label="موقوف" color="warning" size="small" />;
            case 'Expired':
                return <Chip label="منتهي" color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">العملاء</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchClients}
                        sx={{ mr: 1 }}
                    >
                        تحديث
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/clients/new')}
                    >
                        عميل جديد
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

            {/* Search */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="بحث باسم المستخدم، الاسم، الهاتف، أو الرقم الوطني..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell>اسم المستخدم</TableCell>
                            <TableCell>الاسم الكامل</TableCell>
                            <TableCell>الحالة</TableCell>
                            <TableCell>اسم الباقة</TableCell>
                            <TableCell>تاريخ انتهاء الباقة</TableCell>
                            <TableCell>تاريخ الإنشاء</TableCell>
                            <TableCell>البيانات المستهلكة</TableCell>
                            <TableCell>حالة الدفع</TableCell>
                            <TableCell align="center">الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    لا يوجد عملاء
                                </TableCell>
                            </TableRow>
                        ) : (
                                    clients.map((client) => {
                                        const days = getDaysRemaining(
                                            client.activeSubscription?.endDate
                                        );
                                        const payStatus = client.paymentStatus || 'Pending';
                                        const payLabel =
                                            payStatus === 'Paid' ? 'مدفوع' :
                                            payStatus === 'Overdue' ? 'متأخر' : 'قيد الانتظار';
                                        const payColor =
                                            payStatus === 'Paid' ? 'success' :
                                            payStatus === 'Overdue' ? 'error' : 'warning';
                                        return (
                                            <TableRow key={client.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600} dir="ltr">
                                                        {client.username}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{client.fullName}</TableCell>
                                                <TableCell>
                                                    <Box display="flex" gap={0.5} flexWrap="wrap">
                                                        {getStatusChip(client.status)}
                                                        {client.isOnline ? (
                                                            <Chip label="متصل" color="success" size="small" title={client.onlineIp || ''} />
                                                        ) : (
                                                            <Chip label="غير متصل" size="small" variant="outlined" />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {client.activeSubscription ? (
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {client.activeSubscription.planName}
                                                            </Typography>
                                                            {client.activeSubscription.planSpeed && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {client.activeSubscription.planSpeed}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">—</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {client.activeSubscription?.endDate ? (
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {formatDate(client.activeSubscription.endDate)}
                                                            </Typography>
                                                            {days !== null && days > 0 && (
                                                                <Chip
                                                                    label={`${days} يوم`}
                                                                    size="small"
                                                                    color={days <= 3 ? 'warning' : 'info'}
                                                                    sx={{ mt: 0.5 }}
                                                                />
                                                            )}
                                                            {days !== null && days <= 0 && (
                                                                <Chip label="منتهي" size="small" color="error" sx={{ mt: 0.5 }} />
                                                            )}
                                                        </Box>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {client.createdAt ? formatDate(client.createdAt) : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {client.dataUsed || 'Bytes 0'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={payLabel} color={payColor as any} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, client)}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                    </TableBody>
                </Table>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="عدد الصفوف:"
                />
            </TableContainer>

            {/* ========== Menu ========== */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleClientStatusClick}>
                    <ListItemIcon>
                        <WifiIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText>حالة العميل</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleEditClick}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>تعديل البيانات</ListItemText>
                </MenuItem>
                    <MenuItem onClick={handleViewPassword}>
                        <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>عرض كلمة المرور</ListItemText>
                    </MenuItem>

                <MenuItem onClick={handleRenewClick}>
                    <ListItemIcon>
                        <RenewIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText>تجديد الاشتراك</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleSpeedClick}>
                    <ListItemIcon>
                        <SpeedIcon fontSize="small" color="info" />
                    </ListItemIcon>
                    <ListItemText>تغيير السرعة</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleResetPasswordClick}>
                    <ListItemIcon>
                        <PasswordIcon fontSize="small" color="secondary" />
                    </ListItemIcon>
                    <ListItemText>إعادة تعيين كلمة المرور</ListItemText>
                </MenuItem>

                <Divider />

                {selectedClient?.status !== 'Active' && (
                    <MenuItem onClick={handleActivateClick}>
                        <ListItemIcon>
                            <ActivateIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText>تفعيل العميل</ListItemText>
                    </MenuItem>
                )}

                {selectedClient?.status === 'Active' && (
                    <MenuItem onClick={handleSuspendClick}>
                        <ListItemIcon>
                            <SuspendIcon fontSize="small" color="warning" />
                        </ListItemIcon>
                        <ListItemText>إيقاف العميل</ListItemText>
                    </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>حذف</ListItemText>
                </MenuItem>

                <MenuItem onClick={handlePermanentDeleteClick}>
                    <ListItemIcon>
                        <DeleteForeverIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>حذف نهائي (من RADIUS أيضاً)</ListItemText>
                </MenuItem>
            </Menu>

            {/* ========== عرض / تعديل بيانات العميل ========== */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {detailMode === 'edit' ? 'تعديل بيانات العميل' : 'عرض بيانات العميل'}
                    {editFormData?.username && (
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ mr: 2 }}>
                            {' — '}{editFormData.username}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {detailLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ direction: 'rtl' }}>
                            {/* حالة سريعة */}
                            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                <Chip
                                    size="small"
                                    label={editFormData.status === 'Active' ? 'نشط' : editFormData.status || '—'}
                                    color={editFormData.status === 'Active' ? 'success' : 'default'}
                                />
                                <Chip
                                    size="small"
                                    label={editFormData.isOnline ? `متصل ${editFormData.onlineIp || ''}` : 'غير متصل'}
                                    color={editFormData.isOnline ? 'success' : 'default'}
                                    variant="outlined"
                                />
                                {editFormData.activeSubscription && (
                                    <Chip
                                        size="small"
                                        label={`الباقة: ${editFormData.activeSubscription.planName || editFormData.activeSubscription.PlanName || '—'} | ينتهي: ${formatDate(editFormData.activeSubscription.endDate || editFormData.activeSubscription.EndDate)}`}
                                        color="info"
                                        variant="outlined"
                                    />
                                )}
                                {editFormData.hasFreeSubscription && (
                                    <Chip size="small" label={`مجاني ${editFormData.freeSpeed || ''}`} color="warning" />
                                )}
                            </Box>

                            {/* تواريخ الاشتراك */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>تواريخ الاشتراك</Typography>
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2} alignItems="center">
                                    <TextField
                                        fullWidth size="small" type="date" label="تاريخ البداية"
                                        value={subDates.startDate}
                                        onChange={(e) => setSubDates((p) => ({ ...p, startDate: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{ readOnly: detailMode === 'view' }}
                                    />
                                    <TextField
                                        fullWidth size="small" type="date" label="تاريخ النهاية"
                                        value={subDates.endDate}
                                        onChange={(e) => setSubDates((p) => ({ ...p, endDate: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{ readOnly: detailMode === 'view' }}
                                    />
                                    {detailMode === 'edit' && (
                                        <Button variant="contained" size="small" onClick={handleSaveSubDates} disabled={savingDates}>
                                            {savingDates ? <CircularProgress size={18} /> : 'حفظ التواريخ'}
                                        </Button>
                                    )}
                                </Box>
                            </Paper>

                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>الحساب</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                                <TextField fullWidth size="small" label="اسم المستخدم" value={editFormData.username || ''} InputProps={{ readOnly: true }} />
                                <TextField fullWidth size="small" label="الرقم الوطني" value={editFormData.nationalId || ''}
                                    onChange={(e) => setEditField('nationalId', e.target.value)}
                                    InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" select label="الحالة" value={editFormData.status || 'Active'}
                                    onChange={(e) => setEditField('status', e.target.value)}
                                    disabled={detailMode === 'view'}>
                                    <MenuItem value="Active">نشط</MenuItem>
                                    <MenuItem value="Suspended">موقوف</MenuItem>
                                </TextField>
                                <TextField fullWidth size="small" select label="حالة الدفع" value={editFormData.paymentStatus || 'Pending'}
                                    onChange={(e) => setEditField('paymentStatus', e.target.value)}
                                    disabled={detailMode === 'view'}>
                                    <MenuItem value="Pending">قيد الانتظار</MenuItem>
                                    <MenuItem value="Paid">مدفوع</MenuItem>
                                    <MenuItem value="Overdue">متأخر</MenuItem>
                                </TextField>
                            </Box>

                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>البيانات الشخصية</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                                <TextField fullWidth size="small" label="الاسم الأول" value={editFormData.firstName || ''}
                                    onChange={(e) => setEditField('firstName', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="الاسم الأخير" value={editFormData.lastName || ''}
                                    onChange={(e) => setEditField('lastName', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="الاسم الكامل" value={editFormData.fullName || ''}
                                    onChange={(e) => setEditField('fullName', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="الاسم الظاهر" value={editFormData.displayName || ''}
                                    onChange={(e) => setEditField('displayName', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="اللقب" value={editFormData.title || ''}
                                    onChange={(e) => setEditField('title', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" select label="الجنس" value={editFormData.gender || ''}
                                    onChange={(e) => setEditField('gender', e.target.value)} disabled={detailMode === 'view'}>
                                    <MenuItem value="">—</MenuItem>
                                    <MenuItem value="ذكر">ذكر</MenuItem>
                                    <MenuItem value="أنثى">أنثى</MenuItem>
                                </TextField>
                                <TextField fullWidth size="small" label="اسم الأب" value={editFormData.fatherName || ''}
                                    onChange={(e) => setEditField('fatherName', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="اسم الأم" value={editFormData.motherName || ''}
                                    onChange={(e) => setEditField('motherName', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" type="date" label="تاريخ الولادة" value={editFormData.birthDate || ''}
                                    onChange={(e) => setEditField('birthDate', e.target.value)} InputLabelProps={{ shrink: true }}
                                    InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="محل الولادة" value={editFormData.birthPlace || ''}
                                    onChange={(e) => setEditField('birthPlace', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="الهاتف" value={editFormData.phone || ''}
                                    onChange={(e) => setEditField('phone', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="هاتف ثانوي" value={editFormData.secondaryPhone || ''}
                                    onChange={(e) => setEditField('secondaryPhone', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="البريد" value={editFormData.email || ''}
                                    onChange={(e) => setEditField('email', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="رقم العقد" value={editFormData.contractNumber || ''}
                                    onChange={(e) => setEditField('contractNumber', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                            </Box>

                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>العنوان</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                                <TextField fullWidth size="small" label="المدينة" value={editFormData.city || ''}
                                    onChange={(e) => setEditField('city', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="المنطقة" value={editFormData.area || editFormData.apartment || ''}
                                    onChange={(e) => { setEditField('area', e.target.value); setEditField('apartment', e.target.value); }}
                                    InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="الشارع" value={editFormData.street || ''}
                                    onChange={(e) => setEditField('street', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="العنوان الكامل" value={editFormData.address || ''}
                                    onChange={(e) => setEditField('address', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="MAC" value={editFormData.macAddress || ''}
                                    onChange={(e) => setEditField('macAddress', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                                <TextField fullWidth size="small" label="IP" value={editFormData.ipAddress || ''}
                                    onChange={(e) => setEditField('ipAddress', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }} />
                            </Box>

                            <TextField fullWidth size="small" label="ملاحظات" multiline minRows={2} value={editFormData.notes || ''}
                                onChange={(e) => setEditField('notes', e.target.value)} InputProps={{ readOnly: detailMode === 'view' }}
                                sx={{ mb: 2 }} />

                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>صور الهوية والعقد</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                                {[
                                    ['idFrontImage', 'هوية أمامي'],
                                    ['idBackImage', 'هوية خلفي'],
                                    ['contractFrontImage', 'عقد أمامي'],
                                    ['contractBackImage', 'عقد خلفي'],
                                ].map(([key, label]) => (
                                    <Paper key={key} variant="outlined" sx={{ p: 1, minHeight: 120, textAlign: 'center' }}>
                                        <Typography variant="caption" display="block" mb={0.5}>{label}</Typography>
                                        {editFormData[key] ? (
                                            <Box component="img" src={editFormData[key]} alt={label}
                                                sx={{ maxHeight: 140, maxWidth: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">لا توجد صورة</Typography>
                                        )}
                                        {detailMode === 'edit' && (
                                            <Button size="small" component="label" sx={{ mt: 1 }}>
                                                رفع / استبدال
                                                <input type="file" accept="image/*" hidden onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const reader = new FileReader();
                                                    reader.onload = () => setEditField(key, String(reader.result || ''));
                                                    reader.readAsDataURL(file);
                                                }} />
                                            </Button>
                                        )}
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} startIcon={<CloseIcon />}>
                        إغلاق
                    </Button>
                    {detailMode === 'view' ? (
                        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setDetailMode('edit')}>
                            تعديل
                        </Button>
                    ) : (
                        <Button onClick={handleSaveEdit} variant="contained" disabled={submitting || detailLoading} startIcon={<SaveIcon />}>
                            {submitting ? <CircularProgress size={20} /> : 'حفظ التعديلات'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>


            {/* ========== حالة العميل (شبكة واستهلاك) ========== */}
            <Dialog
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    حالة العميل
                    {selectedClient && (
                        <Typography variant="body2" color="text.secondary">
                            {selectedClient.fullName} — <span dir="ltr">{selectedClient.username}</span>
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {statusLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ direction: 'rtl' }}>
                            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                                <Chip
                                    size="small"
                                    label={liveStats?.isOnline ? 'متصل' : 'غير متصل'}
                                    color={liveStats?.isOnline ? 'success' : 'default'}
                                />
                                {liveStats?.configuredRate && (
                                    <Chip size="small" label={`الحد: ${liveStats.configuredRate}`} variant="outlined" />
                                )}
                            </Box>
                            <Box
                                display="grid"
                                gridTemplateColumns={{ xs: '1fr 1fr', sm: '1fr 1fr 1fr' }}
                                gap={2}
                            >
                                <Box>
                                    <Typography variant="caption" color="text.secondary">IP المتصل</Typography>
                                    <Typography fontWeight={700} dir="ltr" color="primary.main">
                                        {liveStats?.onlineIp || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">استهلاك الجلسة</Typography>
                                    <Typography fontWeight={700}>
                                        {liveStats?.sessionUsageHuman || liveStats?.usage?.sessionTotalHuman || '0 B'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        ↓ {liveStats?.sessionDownloadHuman || '—'} / ↑ {liveStats?.sessionUploadHuman || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">الاستهلاك الكلي</Typography>
                                    <Typography fontWeight={700}>
                                        {liveStats?.totalUsageHuman || liveStats?.usage?.totalHuman || liveStats?.sessionUsageHuman || '0 B'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        ↓ {liveStats?.totalDownloadHuman || '—'} / ↑ {liveStats?.totalUploadHuman || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">السرعة اللحظية تحميل</Typography>
                                    <Typography fontWeight={700}>
                                        {liveStats?.downloadSpeed || '0 bps'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">السرعة اللحظية رفع</Typography>
                                    <Typography fontWeight={700} color="secondary.main">
                                        {liveStats?.uploadSpeed || '0 bps'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">السرعة المُعدّة (الحد)</Typography>
                                    <Typography fontWeight={700}>
                                        {liveStats?.configuredRate || liveStats?.planSpeed || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">أجهزة متصلة (تقديري)</Typography>
                                    <Typography fontWeight={700}>
                                        {liveStats?.connectedDevicesEstimate ?? '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">مدة الاتصال</Typography>
                                    <Typography fontWeight={700} dir="ltr">
                                        {liveStats?.uptime || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">MAC / Caller-ID</Typography>
                                    <Typography fontWeight={700} dir="ltr" fontSize={13}>
                                        {liveStats?.callerId || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                            {pingResult && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Ping {pingResult.address}: {pingResult.received}/{pingResult.sent}
                                    {' '}— فقد {pingResult.packetLossPercent}%
                                    {' '}— متوسط {pingResult.avgMs ?? '—'} ms
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={async () => {
                            if (!selectedClient) return;
                            setStatusLoading(true);
                            try {
                                const ls = await api.get(`/clients/${selectedClient.id}/live-stats`);
                                setLiveStats(ls.data?.data ?? ls.data?.Data ?? ls.data);
                            } finally {
                                setStatusLoading(false);
                            }
                        }}
                    >
                        تحديث الإحصاءات
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handlePing}
                        disabled={pingLoading || !liveStats?.isOnline}
                    >
                        {pingLoading ? <CircularProgress size={18} /> : 'Ping لراوتر العميل'}
                    </Button>
                    <Button onClick={() => setStatusDialogOpen(false)}>إغلاق</Button>
                </DialogActions>
            </Dialog>

{/* ========== Renew Dialog ========== */}
            <Dialog
                open={renewDialogOpen}
                onClose={() => setRenewDialogOpen(false)}
            >
                <DialogTitle>تجديد الاشتراك</DialogTitle>
                <DialogContent>
                    <Typography>
                        هل تريد تجديد اشتراك العميل{' '}
                        <strong>{selectedClient?.fullName}</strong>؟
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        سيتم تمديد التاريخ حسب مدة الباقة الحالية وتفعيله في
                        RADIUS.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenewDialogOpen(false)}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleRenewConfirm}
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <CircularProgress size={20} />
                        ) : (
                                'تأكيد التجديد'
                            )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== Speed Dialog ========== */}
            <Dialog
                open={speedDialogOpen}
                onClose={() => setSpeedDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>تغيير سرعة العميل</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        العميل: <strong>{selectedClient?.fullName}</strong>
                    </Typography>
                    <TextField
                        fullWidth
                        label="السرعة (مثال: 10M/10M أو 20M/5M)"
                        value={newSpeed}
                        onChange={(e) => setNewSpeed(e.target.value)}
                        helperText="الصيغة: تحميل/رفع  مثل 10M/10M"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSpeedDialogOpen(false)}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSpeedConfirm}
                        variant="contained"
                        color="info"
                        disabled={submitting || !newSpeed.trim()}
                    >
                        {submitting ? (
                            <CircularProgress size={20} />
                        ) : (
                                'حفظ السرعة'
                            )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== Reset Password Dialog ========== */}
            <Dialog
                open={resetPasswordDialogOpen}
                onClose={() => {
                    setResetPasswordDialogOpen(false);
                    setGeneratedPassword(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
                <DialogContent>
                    {!generatedPassword ? (
                        <Typography>
                            سيتم إنشاء كلمة مرور جديدة للعميل{' '}
                            <strong>{selectedClient?.fullName}</strong> وتحديثها
                            في RADIUS. هل تريد المتابعة؟
                        </Typography>
                    ) : (
                            <Alert severity="success" sx={{ mt: 1 }}>
                                <Typography variant="body1">
                                    <strong>اسم المستخدم:</strong>{' '}
                                    {selectedClient?.username}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    <strong>كلمة المرور الجديدة:</strong>{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '1.3rem',
                                            fontWeight: 'bold',
                                            letterSpacing: 1,
                                        }}
                                    >
                                        {generatedPassword}
                                    </Box>
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 1.5, display: 'block' }}
                                >
                                    انسخ كلمة المرور الآن، لن تظهر مرة أخرى.
                            </Typography>
                            </Alert>
                        )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setResetPasswordDialogOpen(false);
                            setGeneratedPassword(null);
                        }}
                    >
                        إغلاق
                    </Button>
                    {!generatedPassword && (
                        <Button
                            onClick={handleResetPasswordConfirm}
                            variant="contained"
                            color="secondary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <CircularProgress size={20} />
                            ) : (
                                    'إعادة التعيين'
                                )}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* ========== Suspend Dialog ========== */}
            <Dialog
                open={suspendDialogOpen}
                onClose={() => setSuspendDialogOpen(false)}
            >
                <DialogTitle>تأكيد إيقاف العميل</DialogTitle>
                <DialogContent>
                    هل تريد إيقاف العميل{' '}
                    <strong>{selectedClient?.fullName}</strong>؟
                    <br />
                    سيتم تعطيله في RADIUS ولن يتمكن من الاتصال.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSuspendDialogOpen(false)}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSuspendConfirm}
                        color="warning"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={20} /> : 'إيقاف'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== Activate Dialog ========== */}
            <Dialog
                open={activateDialogOpen}
                onClose={() => setActivateDialogOpen(false)}
            >
                <DialogTitle>تأكيد تفعيل العميل</DialogTitle>
                <DialogContent>
                    هل تريد تفعيل العميل{' '}
                    <strong>{selectedClient?.fullName}</strong>؟
                    <br />
                    يجب أن يكون لديه اشتراك نشط.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActivateDialogOpen(false)}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleActivateConfirm}
                        color="success"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={20} /> : 'تفعيل'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== Delete Dialog ========== */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent>
                    هل تريد حذف العميل{' '}
                    <strong>{selectedClient?.fullName}</strong>؟
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={20} /> : 'حذف'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== Permanent Delete Dialog ========== */}
            <Dialog
                open={permanentDeleteDialogOpen}
                onClose={() => setPermanentDeleteDialogOpen(false)}
            >
                <DialogTitle sx={{ color: 'error.main' }}>
                    حذف نهائي
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        هذا الإجراء لا يمكن التراجع عنه!
                    </Alert>
                    سيتم حذف العميل{' '}
                    <strong>{selectedClient?.fullName}</strong> نهائياً من:
                    <ul>
                        <li>قاعدة بيانات النظام</li>
                        <li>خادم RADIUS</li>
                        <li>كل الاشتراكات والفواتير والمدفوعات المرتبطة</li>
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setPermanentDeleteDialogOpen(false)}
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={handlePermanentDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <CircularProgress size={20} />
                        ) : (
                                'حذف نهائي'
                            )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}