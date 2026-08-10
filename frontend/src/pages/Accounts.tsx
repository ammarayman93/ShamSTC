import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  MenuItem, IconButton, Collapse, List, ListItemButton, ListItemText,
} from '@mui/material';
import {
  ExpandMore, ChevronLeft, Add as AddIcon, Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface AccountNode {
  id: number;
  code: string;
  name: string;
  type: string;
  parentId?: number;
  isPostable: boolean;
  isActive: boolean;
  openingBalance: number;
  level: number;
  children: AccountNode[];
}

const typeLabels: Record<string, string> = {
  Asset: 'أصول',
  Liability: 'خصوم',
  Equity: 'حقوق ملكية',
  Revenue: 'إيرادات',
  Expense: 'مصروفات',
  Cost: 'تكاليف',
};

const typeColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  Asset: 'primary',
  Liability: 'warning',
  Equity: 'secondary',
  Revenue: 'success',
  Expense: 'error',
  Cost: 'info',
};

function TreeNode({ node, depth = 0 }: { node: AccountNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <ListItemButton onClick={() => hasChildren && setOpen(!open)} sx={{ pl: 2 + depth * 2 }}>
        {hasChildren ? (open ? <ExpandMore fontSize="small" /> : <ChevronLeft fontSize="small" />) : (
          <Box width={24} />
        )}
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography component="span" fontFamily="monospace" fontWeight={600}>
                {node.code}
              </Typography>
              <Typography component="span">{node.name}</Typography>
              <Chip size="small" label={typeLabels[node.type] || node.type} color={typeColors[node.type] || 'default'} />
              {node.isPostable && <Chip size="small" variant="outlined" label="قابل للتقييد" />}
            </Box>
          }
        />
      </ListItemButton>
      {hasChildren && (
        <Collapse in={open}>
          <List disablePadding>
            {node.children.map((c) => (
              <TreeNode key={c.id} node={c} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default function Accounts() {
  const [tree, setTree] = useState<AccountNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [flat, setFlat] = useState<AccountNode[]>([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'Asset',
    parentId: '',
    isPostable: true,
    openingBalance: '0',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, f] = await Promise.all([
        api.get('/accounts/tree'),
        api.get('/accounts'),
      ]);
      const treeData = t.data?.data ?? t.data ?? [];
      const flatData = f.data?.data ?? f.data ?? [];
      setTree(Array.isArray(treeData) ? treeData : []);
      setFlat(Array.isArray(flatData) ? flatData : []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل تحميل الحسابات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/accounts', {
        code: form.code,
        name: form.name,
        type: form.type,
        parentId: form.parentId ? Number(form.parentId) : null,
        isPostable: form.isPostable,
        openingBalance: Number(form.openingBalance) || 0,
      });
      setSuccess('تم إنشاء الحساب');
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'فشل الإنشاء');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          شجرة الحسابات
        </Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={load}><RefreshIcon /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            حساب جديد
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box p={6} textAlign="center"><CircularProgress /></Box>
        ) : tree.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">لا توجد حسابات — أعد تشغيل الـ Backend لتشغيل البذرة</Typography>
          </Box>
        ) : (
          <List>
            {tree.map((n) => (
              <TreeNode key={n.id} node={n} />
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة حساب</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="الرمز" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="النوع" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(typeLabels).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="الحساب الأب (اختياري)" value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <MenuItem value="">— بدون —</MenuItem>
                {flat.map((a: any) => (
                  <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="رصيد افتتاحي" type="number" value={form.openingBalance}
                onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleCreate}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
