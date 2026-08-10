import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Wifi as WifiIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface DashboardData {
  clients: {
    total: number;
    active: number;
    online: number;
    expiringToday: number;
    expiringSoon: number;
    expired: number;
  };
  financial?: {
    todayRevenue: number;
    monthRevenue: number;
    monthExpenses: number;
    monthProfit: number;
    overdueInvoices?: number;
    overdueAmount?: number;
  };
}

type PillProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

function StatPill({ label, value, icon, iconBg, iconColor }: PillProps) {
  return (
    <Box
      sx={{
        flex: '1 1 180px',
        minWidth: 160,
        maxWidth: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2.5,
        py: 2,
        borderRadius: 999,
        bgcolor: '#fff',
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
        border: '1px solid rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 1 }}
        >
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await api.get('/dashboard');
      const body = response.data;
      const payload = body?.data ?? body?.Data ?? body;

      if (payload?.clients) {
        setData(payload as DashboardData);
      } else {
        setData({
          clients: {
            total: Number(payload?.totalClients ?? payload?.total ?? 0),
            active: Number(payload?.activeClients ?? payload?.active ?? 0),
            online: Number(payload?.onlineClients ?? payload?.online ?? 0),
            expiringToday: Number(payload?.expiringToday ?? 0),
            expiringSoon: Number(payload?.expiringSoon ?? 0),
            expired: Number(payload?.expired ?? payload?.expiredClients ?? 0),
          },
          financial: payload?.financial ?? {
            todayRevenue: 0,
            monthRevenue: Number(payload?.monthRevenue ?? 0),
            monthExpenses: 0,
            monthProfit: 0,
            overdueInvoices: Number(payload?.overdueInvoices ?? 0),
          },
        });
      }
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || err.message || 'فشل تحميل لوحة التحكم');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => fetchDashboard(true), 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress />
      </Box>
    );
  }

  const c = data?.clients ?? {
    total: 0,
    active: 0,
    online: 0,
    expiringToday: 0,
    expiringSoon: 0,
    expired: 0,
  };

  const monthRevenue = data?.financial?.monthRevenue ?? 0;
  const overdueInvoices = data?.financial?.overdueInvoices ?? 0;

  return (
    <Box sx={{ direction: 'rtl' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={1}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            لوحة التحكم
          </Typography>
          <Typography variant="body2" color="text.secondary">
            نظرة سريعة على العملاء والاتصالات والإيرادات
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            icon={<RefreshIcon />}
            label="تحديث كل 15 ثانية"
            size="small"
            variant="outlined"
            onClick={() => fetchDashboard()}
            sx={{ borderRadius: 999, cursor: 'pointer' }}
          />
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              {lastUpdate.toLocaleTimeString('ar-SY')}
            </Typography>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* الصف الرئيسي — بنفس أسلوب الصورة + بطاقة المتصلين */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        justifyContent="stretch"
        mb={3}
      >
        <StatPill
          label="إجمالي العملاء"
          value={c.total}
          icon={<PeopleIcon />}
          iconBg="#eef2ff"
          iconColor="#4338ca"
        />
        <StatPill
          label="عملاء نشطين"
          value={c.active}
          icon={<PersonIcon />}
          iconBg="#ecfdf5"
          iconColor="#059669"
        />
        <StatPill
          label="العملاء المتصلين"
          value={c.online}
          icon={<WifiIcon />}
          iconBg="#ecfeff"
          iconColor="#0891b2"
        />
        <StatPill
          label="إيرادات الشهر"
          value={`${Number(monthRevenue).toLocaleString('ar-SY')} ل.س`}
          icon={<MoneyIcon />}
          iconBg="#fffbeb"
          iconColor="#d97706"
        />
        <StatPill
          label="فواتير متأخرة"
          value={overdueInvoices}
          icon={<ReceiptIcon />}
          iconBg="#fff1f2"
          iconColor="#e11d48"
        />
      </Box>

      {/* صف ثانٍ اختياري — انتهاء الاشتراكات */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        <StatPill
          label="ينتهي اليوم"
          value={c.expiringToday}
          icon={<ReceiptIcon />}
          iconBg="#fff7ed"
          iconColor="#ea580c"
        />
        <StatPill
          label="ينتهي خلال 3 أيام"
          value={c.expiringSoon}
          icon={<WifiIcon />}
          iconBg="#eff6ff"
          iconColor="#2563eb"
        />
        <StatPill
          label="منتهي الاشتراك"
          value={c.expired}
          icon={<PeopleIcon />}
          iconBg="#fef2f2"
          iconColor="#dc2626"
        />
      </Box>
    </Box>
  );
}
