import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel,
  Divider, Alert, Tab, Tabs, CircularProgress, InputAdornment, Card, CardContent,
  List, ListItem, ListItemText, ListItemIcon, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip,
} from '@mui/material';
import {
  Save as SaveIcon, Business as BusinessIcon, Email as EmailIcon,
  Payment as PaymentIcon, Backup as BackupIcon, Security as SecurityIcon,
  Delete as DeleteIcon, Download as DownloadIcon, Restore as RestoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Setting {
  key: string;
  value: string;
  group: string;
}

interface BackupFile {
  name: string;
  size: number;
  createdAt: string;
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.success) setSettings(response.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchBackups = async () => {
    try {
      const response = await api.get('/backup/list');
      if (response.data.success) setBackups(response.data.data);
    } catch (error) { console.error(error); }
  };

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      await api.put(`/settings/${key}`, { value, group: 'general' });
      setSuccess('تم حفظ الإعدادات');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  const handleCreateBackup = async () => {
    try {
      const response = await api.post('/backup/create', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('تم إنشاء النسخة الاحتياطية');
      fetchBackups();
    } catch (error) {
      setError('فشل إنشاء النسخة الاحتياطية');
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) return;
    const formData = new FormData();
    formData.append('file', restoreFile);
    try {
      await api.post('/backup/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('تم استعادة النسخة الاحتياطية بنجاح');
      setRestoreDialogOpen(false);
      setRestoreFile(null);
    } catch (error) {
      setError('فشل استعادة النسخة الاحتياطية');
    }
  };

  const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value || '';

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>إعدادات النظام</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<BusinessIcon />} label="عام" />
          <Tab icon={<EmailIcon />} label="الإشعارات" />
          <Tab icon={<PaymentIcon />} label="الدفع" />
          <Tab icon={<BackupIcon />} label="النسخ الاحتياطي" />
          <Tab icon={<SecurityIcon />} label="الأمان" />
        </Tabs>

        {/* علامة التبويب العامة */}
        {tabValue === 0 && (
          <Box p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="اسم الشركة" value={getSettingValue('company_name')} onChange={(e) => updateSetting('company_name', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="الشعار (URL)" value={getSettingValue('company_logo')} onChange={(e) => updateSetting('company_logo', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="البريد الإلكتروني" value={getSettingValue('company_email')} onChange={(e) => updateSetting('company_email', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="رقم الهاتف" value={getSettingValue('company_phone')} onChange={(e) => updateSetting('company_phone', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="العنوان" multiline rows={2} value={getSettingValue('company_address')} onChange={(e) => updateSetting('company_address', e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* علامة التبويب الإشعارات */}
        {tabValue === 1 && (
          <Box p={3}>
            <FormControlLabel control={<Switch checked={getSettingValue('notify_expiring') === 'true'} onChange={(e) => updateSetting('notify_expiring', String(e.target.checked))} />} label="إشعار عند اقتراب انتهاء الاشتراك" />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel control={<Switch checked={getSettingValue('notify_overdue') === 'true'} onChange={(e) => updateSetting('notify_overdue', String(e.target.checked))} />} label="إشعار عند تأخر الفواتير" />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel control={<Switch checked={getSettingValue('notify_low_stock') === 'true'} onChange={(e) => updateSetting('notify_low_stock', String(e.target.checked))} />} label="إشعار عند انخفاض المخزون" />
            <Divider sx={{ my: 2 }} />
            <TextField fullWidth label="أيام الإشعار قبل الانتهاء" type="number" value={getSettingValue('expiry_days') || '3'} onChange={(e) => updateSetting('expiry_days', e.target.value)} sx={{ mt: 2 }} />
          </Box>
        )}

        {/* علامة التبويب الدفع */}
        {tabValue === 2 && (
          <Box p={3}>
            <TextField fullWidth label="رقم الحساب البنكي" value={getSettingValue('bank_account')} onChange={(e) => updateSetting('bank_account', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="اسم البنك" value={getSettingValue('bank_name')} onChange={(e) => updateSetting('bank_name', e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="IBAN" value={getSettingValue('iban')} onChange={(e) => updateSetting('iban', e.target.value)} sx={{ mb: 2 }} />
          </Box>
        )}

        {/* علامة التبويب النسخ الاحتياطي */}
        {tabValue === 3 && (
          <Box p={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button variant="contained" startIcon={<BackupIcon />} onClick={handleCreateBackup}>
                  إنشاء نسخة احتياطية
                </Button>
                <Button variant="outlined" startIcon={<RestoreIcon />} onClick={() => setRestoreDialogOpen(true)} sx={{ ml: 2 }}>
                  استعادة نسخة
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>النسخ الاحتياطية السابقة</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>اسم الملف</TableCell>
                        <TableCell>الحجم</TableCell>
                        <TableCell>التاريخ</TableCell>
                        <TableCell>الإجراءات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.name}>
                          <TableCell>{backup.name}</TableCell>
                          <TableCell>{(backup.size / 1024).toFixed(2)} KB</TableCell>
                          <TableCell>{new Date(backup.createdAt).toLocaleString('ar-EG')}</TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary" onClick={() => window.open(`/backups/${backup.name}`)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* علامة التبويب الأمان */}
        {tabValue === 4 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>إعدادات الأمان</Typography>
            <FormControlLabel control={<Switch checked={getSettingValue('two_factor_auth') === 'true'} onChange={(e) => updateSetting('two_factor_auth', String(e.target.checked))} />} label="تفعيل المصادقة الثنائية" />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel control={<Switch checked={getSettingValue('session_timeout') === 'true'} onChange={(e) => updateSetting('session_timeout', String(e.target.checked))} />} label="تسجيل الخروج تلقائياً بعد فترة عدم النشاط" />
            <Divider sx={{ my: 2 }} />
            <TextField fullWidth label="مدة الجلسة (بالدقائق)" type="number" value={getSettingValue('session_minutes') || '60'} onChange={(e) => updateSetting('session_minutes', e.target.value)} />
          </Box>
        )}
      </Paper>

      {/* نافذة استعادة النسخة الاحتياطية */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>استعادة نسخة احتياطية</DialogTitle>
        <DialogContent>
          <input type="file" accept=".sql" onChange={(e) => setRestoreFile(e.target.files?.[0] || null)} />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            تحذير: استعادة النسخة الاحتياطية ستستبدل جميع البيانات الحالية
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleRestoreBackup} variant="contained" color="warning">استعادة</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}