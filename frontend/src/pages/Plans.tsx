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
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Plan {
  id: number;
  name: string;
  speed: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    speed: '',
    price: '',
    durationDays: '30',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

    const fetchPlans = async () => {
        setLoading(true);

        try {
            const response = await api.get('/plans');

            if (response.data?.success) {
                setPlans(response.data.data || []);
            } else {
                setPlans([]);
                setError('فشل في تحميل الباقات');
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            setError('فشل في تحميل الباقات');
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      // للتعديل - تعبئة الحقول بالبيانات الموجودة
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        speed: plan.speed,
        price: plan.price.toString(),
        durationDays: plan.durationDays.toString(),
      });
    } else {
      // للإضافة - تعبئة حقول فارغة
      setEditingPlan(null);
      setFormData({
        name: '',
        speed: '',
        price: '',
        durationDays: '30',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      speed: '',
      price: '',
      durationDays: '30',
    });
    setError('');
  };

  const handleSubmit = async () => {
    // التحقق من صحة البيانات
    if (!formData.name.trim()) {
      setError('اسم الباقة مطلوب');
      return;
    }
    if (!formData.speed.trim()) {
      setError('السرعة مطلوبة');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('السعر يجب أن يكون أكبر من صفر');
      return;
    }
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
      setError('المدة يجب أن تكون أكبر من صفر');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = {
        name: formData.name,
        speed: formData.speed,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        isActive: true,
        sortOrder: plans.length + 1,
      };

      if (editingPlan) {
        // تعديل
        await api.put(`/plans/${editingPlan.id}`, data);
        setSuccess('تم تعديل الباقة بنجاح');
      } else {
        // إضافة جديدة
        await api.post('/plans', data);
        setSuccess('تم إضافة الباقة بنجاح');
      }
      
      handleCloseDialog();
      fetchPlans();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الباقة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الباقة "${name}"؟`)) {
      try {
        await api.delete(`/plans/${id}`);
        setSuccess('تم حذف الباقة بنجاح');
        fetchPlans();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">الباقات والاشتراكات</Typography>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPlans} sx={{ mr: 1 }}>
            تحديث
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            باقة جديدة
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>اسم الباقة</TableCell>
              <TableCell>السرعة</TableCell>
              <TableCell>السعر (ل.س)</TableCell>
              <TableCell>المدة (يوم)</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                      {(Array.isArray(plans) ? plans : []).map((plan, idx) => (
              <TableRow key={plan.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.speed}</TableCell>
                <TableCell>{plan.price.toLocaleString()}</TableCell>
                <TableCell>{plan.durationDays}</TableCell>
                <TableCell>
                  <Chip
                    label={plan.isActive ? 'نشطة' : 'غير نشطة'}
                    color={plan.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenDialog(plan)} title="تعديل">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(plan.id, plan.name)} title="حذف">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* نافذة إضافة/تعديل باقة */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPlan ? 'تعديل باقة' : 'إضافة باقة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="اسم الباقة"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              placeholder="مثال: 4Mb/s (Damascus) 2025"
            />
            <TextField
              fullWidth
              label="السرعة"
              value={formData.speed}
              onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
              margin="normal"
              required
              placeholder="مثال: 4Mb/s"
            />
            <TextField
              fullWidth
              label="السعر (ل.س)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              margin="normal"
              required
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              fullWidth
              label="المدة (يوم)"
              type="number"
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
              margin="normal"
              required
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : (editingPlan ? 'تحديث' : 'إضافة')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}