import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, Alert, LinearProgress, useTheme, alpha, Divider, } from '@mui/material';
import { People as PeopleIcon, Wifi as WifiIcon, AttachMoney as MoneyIcon, Receipt as ReceiptIcon, } from '@mui/icons-material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import api from '../services/api';
const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [monthlyData, setMonthlyData] = useState([]);
    const theme = useTheme();
    useEffect(() => {
        fetchDashboard();
        fetchMonthlyData();
    }, []);
    const fetchDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard');
            console.log('Dashboard response:', response.data);
            if (response.data && response.data.success !== false) {
                setData(response.data.data || response.data);
            }
            else if (response.data && response.data.data) {
                setData(response.data.data);
            }
            else {
                // بيانات تجريبية إذا لم تكن هناك بيانات حقيقية
                setData({
                    clients: { total: 11, active: 1, online: 0, expiringToday: 0, expiringSoon: 0, expired: 0 },
                    plans: [{ name: '4Mb/s', count: 4 }, { name: '2Mb/s', count: 2 }],
                    financial: { todayRevenue: 0, monthRevenue: 75000, monthExpenses: 0, monthProfit: 75000, overdueInvoices: 0, overdueAmount: 0 },
                    recent: { expiredClientsList: [], expiringSoonList: [] },
                });
            }
        }
        catch (err) {
            console.error('Error fetching dashboard:', err);
            setError(err.message || 'حدث خطأ في تحميل البيانات');
            // بيانات تجريبية
            setData({
                clients: { total: 11, active: 1, online: 0, expiringToday: 0, expiringSoon: 0, expired: 0 },
                plans: [{ name: '4Mb/s', count: 4 }, { name: '2Mb/s', count: 2 }],
                financial: { todayRevenue: 0, monthRevenue: 75000, monthExpenses: 0, monthProfit: 75000, overdueInvoices: 0, overdueAmount: 0 },
                recent: { expiredClientsList: [], expiringSoonList: [] },
            });
        }
        finally {
            setLoading(false);
        }
    };
    const fetchMonthlyData = async () => {
        try {
            const response = await api.get('/financial/dashboard');
            if (response.data && response.data.success && response.data.data?.monthlyRevenue) {
                setMonthlyData(response.data.data.monthlyRevenue);
            }
            else {
                setMonthlyData([
                    { month: 'يناير', revenue: 45000, expenses: 32000, profit: 13000 },
                    { month: 'فبراير', revenue: 52000, expenses: 35000, profit: 17000 },
                    { month: 'مارس', revenue: 58000, expenses: 33000, profit: 25000 },
                    { month: 'أبريل', revenue: 75000, expenses: 38000, profit: 37000 },
                ]);
            }
        }
        catch (err) {
            setMonthlyData([
                { month: 'يناير', revenue: 45000, expenses: 32000, profit: 13000 },
                { month: 'فبراير', revenue: 52000, expenses: 35000, profit: 17000 },
                { month: 'مارس', revenue: 58000, expenses: 33000, profit: 25000 },
                { month: 'أبريل', revenue: 75000, expenses: 38000, profit: 37000 },
            ]);
        }
    };
    if (loading) {
        return (_jsx(Box, { sx: { width: '100%', mt: 4 }, children: _jsx(LinearProgress, {}) }));
    }
    const statCards = [
        {
            title: 'إجمالي العملاء',
            value: data?.clients.total || 0,
            icon: _jsx(PeopleIcon, { sx: { fontSize: 40 } }),
            color: '#6366f1',
            bgColor: alpha('#6366f1', 0.1),
        },
        {
            title: 'عملاء نشطين',
            value: data?.clients.active || 0,
            icon: _jsx(WifiIcon, { sx: { fontSize: 40 } }),
            color: '#10b981',
            bgColor: alpha('#10b981', 0.1),
        },
        {
            title: 'إيرادات الشهر',
            value: `${(data?.financial.monthRevenue || 0).toLocaleString()} ل.س`,
            icon: _jsx(MoneyIcon, { sx: { fontSize: 40 } }),
            color: '#f59e0b',
            bgColor: alpha('#f59e0b', 0.1),
        },
        {
            title: 'فواتير متأخرة',
            value: data?.financial.overdueInvoices || 0,
            icon: _jsx(ReceiptIcon, { sx: { fontSize: 40 } }),
            color: '#ef4444',
            bgColor: alpha('#ef4444', 0.1),
        },
    ];
    const planDistribution = data?.plans?.map(plan => ({
        name: plan.name,
        value: plan.count,
    })) || [];
    return (_jsxs(Box, { className: "animate-fade-in", children: [_jsx(Typography, { variant: "h4", gutterBottom: true, sx: { fontWeight: 700, mb: 4 }, children: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" }), error && (_jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error })), _jsx(Grid, { container: true, spacing: 3, children: statCards.map((card, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { sx: {
                            borderRadius: 4,
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                        }, children: _jsx(CardContent, { children: _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [_jsxs(Box, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, variant: "body2", children: card.title }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: card.value })] }), _jsx(Box, { sx: {
                                            bgcolor: card.bgColor,
                                            borderRadius: '50%',
                                            p: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }, children: card.icon })] }) }) }) }, index))) }), _jsxs(Grid, { container: true, spacing: 3, sx: { mt: 2 }, children: [_jsx(Grid, { item: true, xs: 12, md: 7, children: _jsx(Card, { sx: { borderRadius: 4 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629" }), _jsx(ResponsiveContainer, { width: "100%", height: 350, children: _jsxs(BarChart, { data: monthlyData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: theme.palette.divider }), _jsx(XAxis, { dataKey: "month", stroke: theme.palette.text.secondary }), _jsx(YAxis, { stroke: theme.palette.text.secondary }), _jsx(Tooltip, { contentStyle: {
                                                        backgroundColor: theme.palette.background.paper,
                                                        borderColor: theme.palette.divider,
                                                        borderRadius: 12,
                                                    } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "revenue", fill: "#6366f1", name: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A", radius: [8, 8, 0, 0] }), _jsx(Bar, { dataKey: "expenses", fill: "#ef4444", name: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A", radius: [8, 8, 0, 0] }), _jsx(Bar, { dataKey: "profit", fill: "#10b981", name: "\u0627\u0644\u0623\u0631\u0628\u0627\u062D", radius: [8, 8, 0, 0] })] }) })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 5, children: _jsx(Card, { sx: { borderRadius: 4 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0628\u0627\u0642\u0627\u062A" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: planDistribution, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`, outerRadius: 100, fill: "#8884d8", dataKey: "value", nameKey: "name", children: planDistribution.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, {}), _jsx(Legend, {})] }) })] }) }) })] }), _jsxs(Grid, { container: true, spacing: 3, sx: { mt: 2 }, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: { borderRadius: 4 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "\u0627\u0644\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0627\u0644\u064A" }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [_jsx(Typography, { color: "textSecondary", children: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0634\u0647\u0631:" }), _jsxs(Typography, { fontWeight: "bold", color: "success.main", children: [(data?.financial.monthRevenue || 0).toLocaleString(), " \u0644.\u0633"] })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [_jsx(Typography, { color: "textSecondary", children: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0634\u0647\u0631:" }), _jsxs(Typography, { fontWeight: "bold", color: "error.main", children: [(data?.financial.monthExpenses || 0).toLocaleString(), " \u0644.\u0633"] })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [_jsx(Typography, { color: "textSecondary", children: "\u0623\u0631\u0628\u0627\u062D \u0627\u0644\u0634\u0647\u0631:" }), _jsxs(Typography, { fontWeight: "bold", color: "success.main", children: [(data?.financial.monthProfit || 0).toLocaleString(), " \u0644.\u0633"] })] }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(Box, { display: "flex", justifyContent: "space-between", children: [_jsx(Typography, { color: "textSecondary", children: "\u0641\u0648\u0627\u062A\u064A\u0631 \u0645\u062A\u0623\u062E\u0631\u0629:" }), _jsx(Chip, { label: `${data?.financial.overdueInvoices || 0} فاتورة`, color: "error", size: "small" })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: { borderRadius: 4 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621" }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [_jsx(Typography, { color: "textSecondary", children: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0639\u0645\u0644\u0627\u0621:" }), _jsx(Typography, { fontWeight: "bold", children: data?.clients.total || 0 })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [_jsx(Typography, { color: "textSecondary", children: "\u0639\u0645\u0644\u0627\u0621 \u0646\u0634\u0637\u064A\u0646:" }), _jsx(Typography, { fontWeight: "bold", color: "success.main", children: data?.clients.active || 0 })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [_jsx(Typography, { color: "textSecondary", children: "\u0639\u0645\u0644\u0627\u0621 \u0645\u062A\u0635\u0644\u064A\u0646:" }), _jsx(Typography, { fontWeight: "bold", color: "info.main", children: data?.clients.online || 0 })] }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(Box, { display: "flex", justifyContent: "space-between", children: [_jsx(Typography, { color: "textSecondary", children: "\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0645\u0646\u062A\u0647\u064A\u0629:" }), _jsx(Chip, { label: data?.clients.expired || 0, color: "warning", size: "small" })] })] }) }) })] })] }));
}
