import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel, Divider, Alert, Tab, Tabs, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import { Business as BusinessIcon, Email as EmailIcon, Payment as PaymentIcon, Backup as BackupIcon, Security as SecurityIcon, Download as DownloadIcon, Restore as RestoreIcon, } from '@mui/icons-material';
import api from '../services/api';
export default function Settings() {
    const [tabValue, setTabValue] = useState(0);
    const [settings, setSettings] = useState([]);
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [restoreFile, setRestoreFile] = useState(null);
    useEffect(() => {
        fetchSettings();
        fetchBackups();
    }, []);
    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data.success)
                setSettings(response.data.data);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchBackups = async () => {
        try {
            const response = await api.get('/backup/list');
            if (response.data.success)
                setBackups(response.data.data);
        }
        catch (error) {
            console.error(error);
        }
    };
    const updateSetting = async (key, value) => {
        setSaving(true);
        try {
            await api.put(`/settings/${key}`, { value, group: 'general' });
            setSuccess('تم حفظ الإعدادات');
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setSaving(false);
        }
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
        }
        catch (error) {
            setError('فشل إنشاء النسخة الاحتياطية');
        }
    };
    const handleRestoreBackup = async () => {
        if (!restoreFile)
            return;
        const formData = new FormData();
        formData.append('file', restoreFile);
        try {
            await api.post('/backup/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSuccess('تم استعادة النسخة الاحتياطية بنجاح');
            setRestoreDialogOpen(false);
            setRestoreFile(null);
        }
        catch (error) {
            setError('فشل استعادة النسخة الاحتياطية');
        }
    };
    const getSettingValue = (key) => settings.find(s => s.key === key)?.value || '';
    if (loading)
        return _jsx(CircularProgress, {});
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645" }), success && _jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs(Paper, { sx: { width: '100%' }, children: [_jsxs(Tabs, { value: tabValue, onChange: (_, v) => setTabValue(v), children: [_jsx(Tab, { icon: _jsx(BusinessIcon, {}), label: "\u0639\u0627\u0645" }), _jsx(Tab, { icon: _jsx(EmailIcon, {}), label: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A" }), _jsx(Tab, { icon: _jsx(PaymentIcon, {}), label: "\u0627\u0644\u062F\u0641\u0639" }), _jsx(Tab, { icon: _jsx(BackupIcon, {}), label: "\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A" }), _jsx(Tab, { icon: _jsx(SecurityIcon, {}), label: "\u0627\u0644\u0623\u0645\u0627\u0646" })] }), tabValue === 0 && (_jsx(Box, { p: 3, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629", value: getSettingValue('company_name'), onChange: (e) => updateSetting('company_name', e.target.value) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0634\u0639\u0627\u0631 (URL)", value: getSettingValue('company_logo'), onChange: (e) => updateSetting('company_logo', e.target.value) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", value: getSettingValue('company_email'), onChange: (e) => updateSetting('company_email', e.target.value) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", value: getSettingValue('company_phone'), onChange: (e) => updateSetting('company_phone', e.target.value) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", multiline: true, rows: 2, value: getSettingValue('company_address'), onChange: (e) => updateSetting('company_address', e.target.value) }) })] }) })), tabValue === 1 && (_jsxs(Box, { p: 3, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: getSettingValue('notify_expiring') === 'true', onChange: (e) => updateSetting('notify_expiring', String(e.target.checked)) }), label: "\u0625\u0634\u0639\u0627\u0631 \u0639\u0646\u062F \u0627\u0642\u062A\u0631\u0627\u0628 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643" }), _jsx(Divider, { sx: { my: 2 } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: getSettingValue('notify_overdue') === 'true', onChange: (e) => updateSetting('notify_overdue', String(e.target.checked)) }), label: "\u0625\u0634\u0639\u0627\u0631 \u0639\u0646\u062F \u062A\u0623\u062E\u0631 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631" }), _jsx(Divider, { sx: { my: 2 } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: getSettingValue('notify_low_stock') === 'true', onChange: (e) => updateSetting('notify_low_stock', String(e.target.checked)) }), label: "\u0625\u0634\u0639\u0627\u0631 \u0639\u0646\u062F \u0627\u0646\u062E\u0641\u0627\u0636 \u0627\u0644\u0645\u062E\u0632\u0648\u0646" }), _jsx(Divider, { sx: { my: 2 } }), _jsx(TextField, { fullWidth: true, label: "\u0623\u064A\u0627\u0645 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0642\u0628\u0644 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621", type: "number", value: getSettingValue('expiry_days') || '3', onChange: (e) => updateSetting('expiry_days', e.target.value), sx: { mt: 2 } })] })), tabValue === 2 && (_jsxs(Box, { p: 3, children: [_jsx(TextField, { fullWidth: true, label: "\u0631\u0642\u0645 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A", value: getSettingValue('bank_account'), onChange: (e) => updateSetting('bank_account', e.target.value), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0628\u0646\u0643", value: getSettingValue('bank_name'), onChange: (e) => updateSetting('bank_name', e.target.value), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "IBAN", value: getSettingValue('iban'), onChange: (e) => updateSetting('iban', e.target.value), sx: { mb: 2 } })] })), tabValue === 3 && (_jsx(Box, { p: 3, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, xs: 12, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(BackupIcon, {}), onClick: handleCreateBackup, children: "\u0625\u0646\u0634\u0627\u0621 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RestoreIcon, {}), onClick: () => setRestoreDialogOpen(true), sx: { ml: 2 }, children: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0646\u0633\u062E\u0629" })] }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 2 }, children: "\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629" }), _jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641" }), _jsx(TableCell, { children: "\u0627\u0644\u062D\u062C\u0645" }), _jsx(TableCell, { children: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }), _jsx(TableCell, { children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: backups.map((backup) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: backup.name }), _jsxs(TableCell, { children: [(backup.size / 1024).toFixed(2), " KB"] }), _jsx(TableCell, { children: new Date(backup.createdAt).toLocaleString('ar-EG') }), _jsx(TableCell, { children: _jsx(IconButton, { size: "small", color: "primary", onClick: () => window.open(`/backups/${backup.name}`), children: _jsx(DownloadIcon, { fontSize: "small" }) }) })] }, backup.name))) })] }) })] })] }) })), tabValue === 4 && (_jsxs(Box, { p: 3, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0645\u0627\u0646" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: getSettingValue('two_factor_auth') === 'true', onChange: (e) => updateSetting('two_factor_auth', String(e.target.checked)) }), label: "\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0627\u0644\u062B\u0646\u0627\u0626\u064A\u0629" }), _jsx(Divider, { sx: { my: 2 } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: getSettingValue('session_timeout') === 'true', onChange: (e) => updateSetting('session_timeout', String(e.target.checked)) }), label: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0628\u0639\u062F \u0641\u062A\u0631\u0629 \u0639\u062F\u0645 \u0627\u0644\u0646\u0634\u0627\u0637" }), _jsx(Divider, { sx: { my: 2 } }), _jsx(TextField, { fullWidth: true, label: "\u0645\u062F\u0629 \u0627\u0644\u062C\u0644\u0633\u0629 (\u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642)", type: "number", value: getSettingValue('session_minutes') || '60', onChange: (e) => updateSetting('session_minutes', e.target.value) })] }))] }), _jsxs(Dialog, { open: restoreDialogOpen, onClose: () => setRestoreDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629" }), _jsxs(DialogContent, { children: [_jsx("input", { type: "file", accept: ".sql", onChange: (e) => setRestoreFile(e.target.files?.[0] || null) }), _jsx(Typography, { variant: "caption", color: "textSecondary", sx: { mt: 1, display: 'block' }, children: "\u062A\u062D\u0630\u064A\u0631: \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0633\u062A\u0633\u062A\u0628\u062F\u0644 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setRestoreDialogOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleRestoreBackup, variant: "contained", color: "warning", children: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629" })] })] })] }));
}
