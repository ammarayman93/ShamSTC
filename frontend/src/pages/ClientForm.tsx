import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Chip,
  InputAdornment,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward,
  PersonAdd,
} from '@mui/icons-material';
import api from '../services/api';

interface Plan {
  id: number;
  name: string;
  speed: string;
  price: number;
  durationDays?: number;
}

type ImageKey = 'idFrontImage' | 'idBackImage' | 'contractFrontImage' | 'contractBackImage';

interface FormState {
  nationalId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  title: string;
  fatherName: string;
  motherName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  street: string;
  apartment: string;
  address: string;
  contractNumber: string;
  notes: string;
  username: string;
  password: string;
  passwordConfirm: string;
  planId: number | '';
  isActive: boolean;
  freeSubscription: boolean;
  freeSpeed: string;
  freeDays: number;
  idFrontImage: string;
  idBackImage: string;
  contractFrontImage: string;
  contractBackImage: string;
}

const empty: FormState = {
  nationalId: '',
  firstName: '',
  lastName: '',
  displayName: '',
  title: '',
  fatherName: '',
  motherName: '',
  gender: 'ذكر',
  birthDate: '',
  birthPlace: '',
  phone: '',
  email: '',
  city: '',
  area: '',
  street: '',
  apartment: '',
  address: '',
  contractNumber: '',
  notes: '',
  username: '',
  password: '',
  passwordConfirm: '',
  planId: '',
  isActive: true,
  freeSubscription: false,
  freeSpeed: '2M/2M',
  freeDays: 30,
  idFrontImage: '',
  idBackImage: '',
  contractFrontImage: '',
  contractBackImage: '',
};

function ImageBox({
  label,
  required,
  value,
  onChange,
  onClear,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('الحد الأقصى 10 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ''));
    reader.readAsDataURL(file);
  };
  return (
    <Paper
      variant="outlined"
      onClick={() => ref.current?.click()}
      sx={{
        p: 2,
        minHeight: 150,
        borderStyle: 'dashed',
        borderColor: required && !value ? 'error.light' : value ? 'primary.main' : 'divider',
        bgcolor: required && !value ? 'error.50' : value ? 'action.hover' : 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={handle} />
      {value ? (
        <>
          <Box component="img" src={value} alt={label} sx={{ maxHeight: 110, maxWidth: '100%', objectFit: 'contain' }} />
          <IconButton size="small" color="error" sx={{ position: 'absolute', top: 4, left: 4 }}
            onClick={(e) => { e.stopPropagation(); onClear(); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant="body2" color={required ? 'error' : 'text.secondary'} fontWeight={600} mb={0.5}>
            {label}{required ? ' *' : ''}
          </Typography>
          <Typography variant="body2" color="error.main">انقر للرفع</Typography>
        </>
      )}
    </Paper>
  );
}

export default function ClientForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = رقم وطني, 1 = بيانات
  const [form, setForm] = useState<FormState>(empty);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [created, setCreated] = useState<any>(null);

  useEffect(() => {
    api.get('/plans').then((res) => {
      const body = res.data;
      const list = Array.isArray(body) ? body : body?.data ?? body?.Data ?? [];
      setPlans(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, []);

  // توليد اسم المستخدم وكلمة المرور عند إدخال الرقم الوطني
  useEffect(() => {
    if (form.nationalId.length === 11 && /^\d{11}$/.test(form.nationalId)) {
      setForm((prev) => ({
        ...prev,
        username: prev.username || `${form.nationalId}-1@sham.net`,
        password: prev.password || String(Math.floor(100000 + Math.random() * 900000)),
      }));
    }
  }, [form.nationalId]);

  const set = (key: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep0 = () => {
    if (!/^\d{11}$/.test(form.nationalId)) {
      setError('الرقم الوطني يجب أن يكون 11 خانة رقمية فقط');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep1 = () => {
    if (!form.firstName.trim()) return setError('الاسم الأول مطلوب'), false;
    if (!form.lastName.trim()) return setError('الاسم الأخير مطلوب'), false;
    if (!form.fatherName.trim()) return setError('اسم الأب مطلوب'), false;
    if (!form.motherName.trim()) return setError('اسم الأم مطلوب'), false;
    if (!form.phone.trim()) return setError('الهاتف مطلوب'), false;
    if (!form.birthDate) return setError('تاريخ الولادة مطلوب'), false;
    if (!form.birthPlace.trim()) return setError('محل الولادة مطلوب'), false;
    if (!form.gender) return setError('الجنس مطلوب'), false;
    if (!form.idFrontImage || !form.idBackImage) return setError('صور الهوية للوجهين مطلوبة'), false;
    if (!form.freeSubscription && !form.planId) return setError('يجب اختيار باقة أو تفعيل اشتراك مجاني'), false;
    if (form.password && form.password !== form.passwordConfirm)
      return setError('تأكيد كلمة المرور غير متطابق'), false;
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setError('');
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        nationalId: form.nationalId,
        firstName: form.firstName,
        lastName: form.lastName,
        fullName,
        displayName: form.displayName || fullName,
        title: form.title || null,
        fatherName: form.fatherName,
        motherName: form.motherName,
        gender: form.gender,
        birthDate: form.birthDate || null,
        birthPlace: form.birthPlace,
        phone: form.phone,
        email: form.email || null,
        city: form.city || null,
        area: form.area || null,
        street: form.street || null,
        apartment: form.apartment || null,
        address: form.address || null,
        contractNumber: form.contractNumber || null,
        notes: form.notes || null,
        username: form.username || null,
        password: form.password || null,
        isActive: form.isActive,
        planId: form.freeSubscription ? (form.planId || null) : Number(form.planId),
        freeSubscription: form.freeSubscription,
        freeSpeed: form.freeSpeed,
        freeDays: form.freeDays,
        paymentMethod: form.freeSubscription ? 'Free' : 'Cash',
        paymentStatus: form.freeSubscription ? 'Paid' : 'Pending',
        idFrontImage: form.idFrontImage,
        idBackImage: form.idBackImage,
        contractFrontImage: form.contractFrontImage || null,
        contractBackImage: form.contractBackImage || null,
      };
      const res = await api.post('/clients', payload);
      const body = res.data;
      const ok = body?.success === true || body?.Success === true;
      if (!ok) {
        setError(body?.message || body?.Message || 'فشل إنشاء العميل');
        return;
      }
      setCreated(body?.data?.client ?? body?.data);
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.Message || err.message || 'خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ direction: 'rtl', maxWidth: 1100, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={800}>أضف عميل جديد</Typography>
        {step === 1 && (
          <Button onClick={() => setStep(0)}>تغيير الرقم الوطني</Button>
        )}
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={1} mb={2}>
        <Chip label="رقم وطني" color={step === 0 ? 'success' : 'default'} />
        <Typography color="text.secondary">›</Typography>
        <Chip label="بيانات العميل" color={step === 1 ? 'warning' : 'default'} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      {/* ========== الخطوة 0: الرقم الوطني ========== */}
      {step === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 3, justifyContent: 'center' }}>
            أدخل الرقم الوطني المكوّن من 11 خانة للبدء بإنشاء المشترك وحساب Radius
          </Alert>
          <TextField
            label="الرقم الوطني *"
            value={form.nationalId}
            onChange={(e) => set('nationalId', e.target.value.replace(/\D/g, '').slice(0, 11))}
            inputProps={{ maxLength: 11, inputMode: 'numeric', style: { textAlign: 'center', fontSize: 22, letterSpacing: 4 } }}
            helperText={`${form.nationalId.length}/11 خانة`}
            error={form.nationalId.length > 0 && form.nationalId.length !== 11}
            sx={{ maxWidth: 360 }}
            fullWidth
          />
          <Box mt={3}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              disabled={form.nationalId.length !== 11}
              onClick={() => { if (validateStep0()) setStep(1); }}
            >
              متابعة إلى بيانات العميل
            </Button>
          </Box>
        </Paper>
      )}

      {/* ========== الخطوة 1: البيانات الكاملة ========== */}
      {step === 1 && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            مشترك جديد: أكمل جميع الحقول المطلوبة وصور الهوية لإنشاء المستخدم المحلي وحساب Radius.
            <Chip label={form.nationalId} size="small" sx={{ ml: 1 }} color="error" variant="outlined" />
          </Alert>

          {/* معلومات الاشتراك */}
          <Typography variant="subtitle1" fontWeight={700} mb={2}>معلومات الاشتراك</Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="اسم المستخدم" value={form.username}
                onChange={(e) => set('username', e.target.value)}
                helperText="يُنشأ تلقائياً من الرقم الوطني — يمكن تعديله" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="الباقة" value={form.planId}
                disabled={form.freeSubscription}
                onChange={(e) => set('planId', e.target.value === '' ? '' : Number(e.target.value))}>
                <MenuItem value="">— اختر باقة —</MenuItem>
                {plans.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name} — {p.speed} — {Number(p.price).toLocaleString()} ل.س</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="كلمة المرور" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={(e) => set('password', e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="تأكيد كلمة المرور" type={showPass ? 'text' : 'password'}
                value={form.passwordConfirm} onChange={(e) => set('passwordConfirm', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="رقم العقد" value={form.contractNumber} onChange={(e) => set('contractNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="المدينة" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="الشقة / المنطقة" value={form.apartment || form.area}
                onChange={(e) => { set('apartment', e.target.value); set('area', e.target.value); }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="الشارع" value={form.street} onChange={(e) => set('street', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="العنوان الكامل" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="ملاحظات" value={form.notes} onChange={(e) => set('notes', e.target.value)} multiline minRows={2} />
            </Grid>

            {/* اشتراك مجاني */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: form.freeSubscription ? 'success.50' : 'background.paper' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.freeSubscription}
                      onChange={(e) => set('freeSubscription', e.target.checked)}
                      color="success"
                    />
                  }
                  label={<Typography fontWeight={700}>طلب اشتراك مجاني (باقة مجانية بسرعة محددة)</Typography>}
                />
                {form.freeSubscription && (
                  <Grid container spacing={2} mt={0.5}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="سرعة الاشتراك المجاني" value={form.freeSpeed}
                        onChange={(e) => set('freeSpeed', e.target.value)}
                        helperText="مثال: 2M/2M أو 5M/5M" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth type="number" label="المدة بالأيام" value={form.freeDays}
                        onChange={(e) => set('freeDays', Number(e.target.value) || 30)} />
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* معلومات المشترك */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>معلومات المشترك</Typography>
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} color="error" />}
              label="الحالة"
            />
          </Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="الاسم الظاهر" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="اللقب / الكنية" value={form.title} onChange={(e) => set('title', e.target.value)}>
                <MenuItem value="">—</MenuItem>
                <MenuItem value="السيد">السيد</MenuItem>
                <MenuItem value="السيدة">السيدة</MenuItem>
                <MenuItem value="الآنسة">الآنسة</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="الجنس *" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <MenuItem value="ذكر">ذكر</MenuItem>
                <MenuItem value="أنثى">أنثى</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="الاسم الأول *" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="الاسم الأخير *" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="الهاتف *" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="البريد الإلكتروني" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="اسم الأب *" value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="اسم الأم *" value={form.motherName} onChange={(e) => set('motherName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="تاريخ الولادة *" value={form.birthDate}
                onChange={(e) => set('birthDate', e.target.value)} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="محل الولادة *" value={form.birthPlace} onChange={(e) => set('birthPlace', e.target.value)} required />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* الهوية */}
          <Typography variant="subtitle1" fontWeight={700} mb={0.5}>الهوية الشخصية *</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            JPEG أو PNG أو GIF أو WebP — بحد أقصى 10 ميجابايت
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <ImageBox label="الوجه الأمامي للهوية الوطنية" required value={form.idFrontImage}
                onChange={(v) => set('idFrontImage', v)} onClear={() => set('idFrontImage', '')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ImageBox label="الوجه الخلفي للهوية الوطنية" required value={form.idBackImage}
                onChange={(v) => set('idBackImage', v)} onClear={() => set('idBackImage', '')} />
            </Grid>
          </Grid>

          {/* العقد */}
          <Typography variant="subtitle1" fontWeight={700} mb={0.5}>مستندات العقد</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>اختياري</Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <ImageBox label="صورة العقد (الوجه الأمامي)" value={form.contractFrontImage}
                onChange={(v) => set('contractFrontImage', v)} onClear={() => set('contractFrontImage', '')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ImageBox label="صورة العقد (الوجه الخلفي)" value={form.contractBackImage}
                onChange={(v) => set('contractBackImage', v)} onClear={() => set('contractBackImage', '')} />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button startIcon={<ArrowBack />} onClick={() => setStep(0)}>رجوع</Button>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PersonAdd />}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'جاري الحفظ...' : 'أضف عميل جديد'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* نجاح + عرض كلمة المرور */}
      <Dialog open={successOpen} onClose={() => navigate('/clients')} maxWidth="sm" fullWidth>
        <DialogTitle>تم إنشاء العميل بنجاح</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            احفظ بيانات الدخول — كلمة المرور تُعرض هنا مرة واحدة
          </Alert>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography><strong>المعرّف / المستخدم:</strong> {created?.username}</Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>كلمة المرور:</strong>{' '}
              <Box component="span" sx={{ color: 'error.main', fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>
                {created?.password}
              </Box>
            </Typography>
            <Typography sx={{ mt: 1 }}><strong>الاسم:</strong> {created?.fullName}</Typography>
            <Typography><strong>الرقم الوطني:</strong> {created?.nationalId}</Typography>
            <Typography><strong>الهاتف:</strong> {created?.phone}</Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => navigate('/clients')}>إلى قائمة العملاء</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
