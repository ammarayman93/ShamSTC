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
  Chip,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
}

const rolePermissions: Record<string, string[]> = {
  Admin: ['كل الصلاحيات'],
  Accountant: ['المالية', 'التقارير', 'الفواتير', 'المشتريات'],
  Employee: ['العملاء', 'الاشتراكات', 'المبيعات'],
  Support: ['العملاء', 'تذاكر الدعم'],
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
    role: 'Employee',
    status: 'Active',
  });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users', {
        params: { page: page + 1, pageSize: rowsPerPage, search: search || undefined },
      });

      if (response.data?.success) {
        const payload = response.data.data;
        setUsers(payload?.data ?? []);
        setTotal(payload?.total ?? 0);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'فشل جلب المستخدمين (تأكد أنك Admin)');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'Employee',
        status: user.status || 'Active',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        phone: '',
        email: '',
        role: 'Employee',
        status: 'Active',
      });
    }
    setError('');
    setDialogOpen(true);
  };

  /** يحول أخطاء ValidationProblemDetails إلى نص مقروء */
  const extractErrorMessage = (err: any): string => {
    const data = err.response?.data;
    if (!data) return err.message || 'حدث خطأ';

    // ValidationProblemDetails من ASP.NET
    if (data.errors && typeof data.errors === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(data.errors)) {
        const arr = data.errors[key];
        if (Array.isArray(arr)) messages.push(...arr);
        else messages.push(String(arr));
      }
      if (messages.length) return messages.join(' — ');
    }

    return data.message || data.title || 'حدث خطأ أثناء الحفظ';
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }
    if (!editingUser && (!formData.username.trim() || !formData.password)) {
      setError('اسم المستخدم وكلمة المرور مطلوبان');
      return;
    }
    if (!editingUser && formData.password.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (editingUser) {
        const payload: any = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          role: formData.role,
          status: formData.status,
        };
        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        await api.put(`/users/${editingUser.id}`, payload);
        setSuccess('تم تحديث المستخدم بنجاح');
      } else {
        // مهم: أرسل null بدل "" حتى لا يفشل [Phone]/[EmailAddress]
        await api.post('/users', {
          username: formData.username.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          role: formData.role,
          status: formData.status || 'Active',
        });
        setSuccess('تم إضافة المستخدم بنجاح');
      }
      setTimeout(() => setSuccess(''), 3000);
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await api.delete(`/users/${id}`);
      setSuccess('تم حذف المستخدم بنجاح');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err: any) {
      setError(extractErrorMessage(err));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Accountant': return 'warning';
      case 'Employee': return 'info';
      case 'Support': return 'success';
      default: return 'default';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'Admin': return 'مدير';
      case 'Accountant': return 'محاسب';
      case 'Employee': return 'موظف';
      case 'Support': return 'دعم فني';
      default: return role;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          المستخدمين والصلاحيات
        </Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={fetchUsers} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            مستخدم جديد
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

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="بحث بالاسم أو اسم المستخدم..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>اسم المستخدم</TableCell>
              <TableCell>الاسم الكامل</TableCell>
              <TableCell>الهاتف</TableCell>
              <TableCell>الصلاحية</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>آخر دخول</TableCell>
              <TableCell align="center">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  لا يوجد مستخدمين
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{user.username}</Typography>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>
                    <Tooltip title={(rolePermissions[user.role] || []).join(' • ')}>
                      <Chip
                        icon={<SecurityIcon />}
                        label={getRoleName(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status === 'Active' ? 'نشط' : user.status || '—'}
                      color={user.status === 'Active' ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString('ar-EG')
                      : 'لم يسجل دخول'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
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
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم المستخدم"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!!editingUser}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                helperText={editingUser ? 'اتركها فارغة إذا لم ترد تغييرها' : '4 أحرف على الأقل'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="الاسم الكامل"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="اختياري"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="اختياري"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>الصلاحية</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="الصلاحية"
                >
                  <MenuItem value="Admin">مدير (كل الصلاحيات)</MenuItem>
                  <MenuItem value="Accountant">محاسب (مالية، تقارير، فواتير)</MenuItem>
                  <MenuItem value="Employee">موظف (عملاء، اشتراكات)</MenuItem>
                  <MenuItem value="Support">دعم فني (عملاء، تذاكر)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="الحالة"
                >
                  <MenuItem value="Active">نشط</MenuItem>
                  <MenuItem value="Inactive">معطل</MenuItem>
                  <MenuItem value="Suspended">موقوف</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.role && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<SecurityIcon />}>
                  الصلاحيات: {(rolePermissions[formData.role] || []).join(' • ')}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : editingUser ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
