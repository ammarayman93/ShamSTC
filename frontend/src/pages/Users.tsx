import { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  FormControlLabel,
  Collapse,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlaylistAddCheck as TemplateIcon,
  Tune as TuneIcon,
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

interface PermRow {
  code: string;
  name: string;
  group: string;
  description?: string;
  fromRole: boolean;
  hasOverride: boolean;
  overrideGranted: boolean | null;
  effective: boolean;
}

const GROUP_LABELS: Record<string, string> = {
  clients: 'العملاء',
  plans: 'الباقات',
  mikrotik: 'أجهزة MikroTik',
  accounting: 'المحاسبة',
  support: 'الدعم الفني',
  system: 'النظام',
};

const GROUP_ORDER = ['clients', 'plans', 'mikrotik', 'accounting', 'support', 'system'];

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

  // صلاحيات داخل نفس الحوار
  const [permRows, setPermRows] = useState<PermRow[]>([]);
  const [permIsAdmin, setPermIsAdmin] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'template' | 'custom'>('custom');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [permLoading, setPermLoading] = useState(false);
  const [showPerms, setShowPerms] = useState(true);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users', {
        params: { page: page + 1, pageSize: rowsPerPage, search: search || undefined },
      });
      const body = response.data;
      const ok = body?.success === true || body?.Success === true;
      const payload = body?.data ?? body?.Data;
      if (ok && payload) {
        setUsers(payload?.data ?? payload?.Data ?? []);
        setTotal(payload?.total ?? payload?.Total ?? 0);
      } else if (Array.isArray(body)) {
        setUsers(body);
        setTotal(body.length);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.Message || 'فشل جلب المستخدمين');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissionsFor = async (userId: number | null, role: string) => {
    setPermLoading(true);
    try {
      if (userId) {
        const res = await api.get(`/permissions/user/${userId}`);
        const data = res.data?.data ?? res.data?.Data ?? res.data;
        setPermIsAdmin(!!data?.isAdmin);
        const list: PermRow[] = data?.permissions ?? [];
        setPermRows(list);
        const init: Record<string, boolean> = {};
        const exp: Record<string, boolean> = {};
        list.forEach((p) => {
          init[p.code] = !!p.effective;
          exp[p.group] = true;
        });
        setChecked(init);
        setExpanded(exp);
      } else {
        // مستخدم جديد — حمّل قالب الدور
        setPermIsAdmin(role === 'Admin');
        const [allRes, roleRes] = await Promise.all([
          api.get('/permissions'),
          api.get(`/permissions/roles/${role}`),
        ]);
        const groups = allRes.data?.data ?? allRes.data?.Data ?? allRes.data ?? [];
        const roleCodes: string[] =
          (roleRes.data?.data ?? roleRes.data?.Data ?? roleRes.data)?.permissions ?? [];
        const roleSet = new Set(roleCodes.map((c: string) => c.toLowerCase()));

        const flat: PermRow[] = [];
        const init: Record<string, boolean> = {};
        const exp: Record<string, boolean> = {};

        // groups may be { group, permissions: [...] }
        const list = Array.isArray(groups) ? groups : [];
        list.forEach((g: any) => {
          const gName = g.group || g.Group || 'other';
          const perms = g.permissions || g.Permissions || [];
          exp[gName] = true;
          perms.forEach((p: any) => {
            const code = p.code || p.Code;
            const name = p.name || p.Name;
            const fromRole = role === 'Admin' || roleSet.has(String(code).toLowerCase());
            flat.push({
              code,
              name,
              group: gName,
              fromRole,
              hasOverride: false,
              overrideGranted: null,
              effective: fromRole,
            });
            init[code] = fromRole;
          });
        });
        setPermRows(flat);
        setChecked(init);
        setExpanded(exp);
      }
    } catch (err: any) {
      console.error(err);
      // لا نمنع فتح الحوار
      setPermRows([]);
    } finally {
      setPermLoading(false);
    }
  };

  const handleOpenDialog = async (user?: User) => {
    setMode('custom');
    setShowPerms(true);
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
      setDialogOpen(true);
      await loadPermissionsFor(user.id, user.role || 'Employee');
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
      setDialogOpen(true);
      await loadPermissionsFor(null, 'Employee');
    }
  };

  const onRoleChange = async (role: string) => {
    setFormData((f) => ({ ...f, role }));
    setMode('template');
    if (editingUser) {
      // أعد تطبيق قالب الدور الجديد على الشجرة
      try {
        const res = await api.get(`/permissions/roles/${role}`);
        const codes: string[] =
          (res.data?.data ?? res.data?.Data ?? res.data)?.permissions ?? [];
        const set = new Set(codes.map((c) => c.toLowerCase()));
        setPermIsAdmin(role === 'Admin');
        setChecked((prev) => {
          const next: Record<string, boolean> = {};
          Object.keys(prev).forEach((code) => {
            next[code] = role === 'Admin' || set.has(code.toLowerCase());
          });
          codes.forEach((c) => {
            next[c] = true;
          });
          return next;
        });
      } catch {
        /* ignore */
      }
    } else {
      await loadPermissionsFor(null, role);
    }
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
    setSubmitting(true);
    setError('');
    try {
      let userId = editingUser?.id;

      if (editingUser) {
        const payload: any = {
          fullName: formData.fullName,
          phone: formData.phone || null,
          email: formData.email || null,
          role: formData.role,
          status: formData.status,
        };
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        const res = await api.post('/users', {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone || null,
          email: formData.email || null,
          role: formData.role,
          status: formData.status,
        });
        const created = res.data?.data ?? res.data?.Data ?? res.data;
        userId = created?.id ?? created?.Id;
      }

      // حفظ الصلاحيات التفصيلية (لغير الأدمن)
      if (userId && formData.role !== 'Admin' && permRows.length > 0) {
        const roleRes = await api.get(`/permissions/roles/${formData.role}`);
        const roleData = roleRes.data?.data ?? roleRes.data?.Data ?? roleRes.data;
        const roleSet = new Set(
          ((roleData?.permissions as string[]) || []).map((c) => c.toLowerCase())
        );
        const permissions: { code: string; isGranted: boolean }[] = [];
        permRows.forEach((p) => {
          const want = !!checked[p.code];
          const fromRole = roleSet.has(p.code.toLowerCase());
          if (want && !fromRole) permissions.push({ code: p.code, isGranted: true });
          else if (!want && fromRole) permissions.push({ code: p.code, isGranted: false });
        });
        await api.put(`/permissions/user/${userId}`, { permissions });
      }

      setSuccess(editingUser ? 'تم تحديث المستخدم والصلاحيات' : 'تم إضافة المستخدم مع الصلاحيات');
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.Message || 'فشل الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await api.delete(`/users/${id}`);
      setSuccess('تم حذف المستخدم');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل الحذف');
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, PermRow[]> = {};
    permRows.forEach((p) => {
      const g = p.group || 'other';
      if (!map[g]) map[g] = [];
      map[g].push(p);
    });
    return map;
  }, [permRows]);

  const orderedGroups = useMemo(() => {
    const keys = Object.keys(grouped);
    return [...GROUP_ORDER.filter((g) => keys.includes(g)), ...keys.filter((g) => !GROUP_ORDER.includes(g))];
  }, [grouped]);

  const togglePerm = (code: string) => {
    if (permIsAdmin || mode === 'template') return;
    setChecked((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleGroup = (group: string) => {
    if (permIsAdmin || mode === 'template') return;
    const items = grouped[group] || [];
    const allOn = items.every((p) => checked[p.code]);
    setChecked((prev) => {
      const next = { ...prev };
      items.forEach((p) => {
        next[p.code] = !allOn;
      });
      return next;
    });
  };

  const applyRoleTemplate = async () => {
    setMode('template');
    try {
      const res = await api.get(`/permissions/roles/${formData.role}`);
      const codes: string[] =
        (res.data?.data ?? res.data?.Data ?? res.data)?.permissions ?? [];
      const set = new Set(codes.map((c) => c.toLowerCase()));
      setChecked((prev) => {
        const next: Record<string, boolean> = {};
        Object.keys(prev).forEach((code) => {
          next[code] = formData.role === 'Admin' || set.has(code.toLowerCase());
        });
        codes.forEach((c) => {
          next[c] = true;
        });
        return next;
      });
    } catch {
      /* ignore */
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'error';
      case 'Accountant':
        return 'warning';
      case 'Support':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'مدير';
      case 'Accountant':
        return 'محاسب';
      case 'Employee':
        return 'موظف';
      case 'Support':
        return 'دعم فني';
      default:
        return role;
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
              <TableCell>#</TableCell>
              <TableCell>اسم المستخدم</TableCell>
              <TableCell>الاسم الكامل</TableCell>
              <TableCell>الهاتف</TableCell>
              <TableCell>الدور</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>آخر تسجيل دخول</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  لا يوجد مستخدمين
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, idx) => (
                <TableRow key={user.id} hover>
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{user.username}</Typography>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<SecurityIcon />}
                      label={getRoleName(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status === 'Active' ? 'نشط' : user.status || '—'}
                      color={user.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-EG') : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<SecurityIcon />}
                      onClick={() => handleOpenDialog(user)}
                      sx={{ ml: 0.5 }}
                    >
                      الصلاحيات
                    </Button>
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="عدد الصفوف"
        />
      </TableContainer>

      {/* حوار إضافة/تعديل + صلاحيات تفصيلية */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? `تعديل: ${editingUser.fullName || editingUser.username}` : 'إضافة مستخدم جديد'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.2 }}>
            {!editingUser && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="اسم المستخدم *"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={editingUser ? 12 : 6}>
              <TextField
                fullWidth
                label={editingUser ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور *'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="الاسم الكامل *"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>الدور (قالب)</InputLabel>
                <Select
                  value={formData.role}
                  label="الدور (قالب)"
                  onChange={(e) => onRoleChange(e.target.value)}
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
                  label="الحالة"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">نشط</MenuItem>
                  <MenuItem value="Inactive">معطل</MenuItem>
                  <MenuItem value="Suspended">موقوف</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* ===== شجرة الصلاحيات ===== */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" fontWeight={800}>
              الصلاحيات التفصيلية
            </Typography>
            <Button size="small" onClick={() => setShowPerms((s) => !s)}>
              {showPerms ? 'إخفاء' : 'إظهار'}
            </Button>
          </Box>

          <Collapse in={showPerms}>
            {permLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={28} />
              </Box>
            ) : formData.role === 'Admin' || permIsAdmin ? (
              <Alert severity="success" icon={<SecurityIcon />}>
                المدير يملك <strong>كل الصلاحيات</strong> تلقائياً — لا حاجة للتخصيص.
              </Alert>
            ) : permRows.length === 0 ? (
              <Alert severity="warning">
                لم تُحمَّل الصلاحيات من الخادم. تأكد أن جداول Permissions موجودة وأنك أعدت تشغيل الـ API.
              </Alert>
            ) : (
              <>
                <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body2">
                    المستخدم: <strong>{formData.fullName || formData.username || '—'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    الدور: {getRoleName(formData.role)} [{formData.role}] — قالب
                  </Typography>
                </Paper>

                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={mode}
                  sx={{ mb: 1.5 }}
                  onChange={(_, v) => {
                    if (v === 'template') applyRoleTemplate();
                    else if (v === 'custom') setMode('custom');
                  }}
                >
                  <ToggleButton value="template">
                    <TemplateIcon fontSize="small" sx={{ mr: 1 }} />
                    تطبيق قالب الدور
                  </ToggleButton>
                  <ToggleButton value="custom">
                    <TuneIcon fontSize="small" sx={{ mr: 1 }} />
                    تخصيص يدوي
                  </ToggleButton>
                </ToggleButtonGroup>

                <Alert severity="warning" sx={{ mb: 1.5 }}>
                  الخيار الذي <strong>لا تحدده</strong> لن يظهر أبداً لهذا المستخدم في القائمة ولن يعمل في النظام.
                </Alert>

                {orderedGroups.map((group) => {
                  const items = grouped[group] || [];
                  const allOn = items.length > 0 && items.every((p) => checked[p.code]);
                  const someOn = items.some((p) => checked[p.code]);
                  const open = expanded[group] !== false;

                  return (
                    <Box
                      key={group}
                      sx={{
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{ px: 1, py: 0.25, cursor: 'pointer', bgcolor: someOn ? 'action.selected' : 'transparent' }}
                        onClick={() => setExpanded((e) => ({ ...e, [group]: !open }))}
                      >
                        <Checkbox
                          checked={allOn}
                          indeterminate={someOn && !allOn}
                          disabled={mode === 'template'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleGroup(group)}
                        />
                        <Typography fontWeight={700} flex={1}>
                          {GROUP_LABELS[group] || group}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${items.filter((p) => checked[p.code]).length}/${items.length}`}
                          sx={{ mr: 1 }}
                        />
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Box>
                      <Collapse in={open}>
                        <Divider />
                        <Box sx={{ pl: 4, pr: 1, py: 0.5 }}>
                          {items.map((p) => (
                            <FormControlLabel
                              key={p.code}
                              sx={{ display: 'flex', width: '100%', mr: 0, my: 0.15, opacity: checked[p.code] ? 1 : 0.5 }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={!!checked[p.code]}
                                  disabled={mode === 'template'}
                                  onChange={() => togglePerm(p.code)}
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {p.name}{' '}
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    ({p.code})
                                  </Typography>
                                </Typography>
                              }
                            />
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
              </>
            )}
          </Collapse>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={22} /> : editingUser ? 'حفظ المستخدم والصلاحيات' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
