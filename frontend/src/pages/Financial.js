import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tabs, Tab, TextField, Button, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, } from '@mui/material';
import { AttachMoney as MoneyIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Receipt as ReceiptIcon, Add as AddIcon, Download as DownloadIcon, Refresh as RefreshIcon, } from '@mui/icons-material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import api from '../services/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
export default function Financial() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        reason: '',
        category: '',
        notes: '',
    });
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/financial/dashboard');
            if (response.data.success) {
                setData(response.data.data);
            }
        }
        catch (error) {
            console.error('Error fetching financial data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddExpense = async () => {
        try {
            await api.post('/financial/expense', {
                amount: parseFloat(expenseForm.amount),
                reason: expenseForm.reason,
                category: expenseForm.category,
                notes: expenseForm.notes,
            });
            setExpenseDialogOpen(false);
            setExpenseForm({ amount: '', reason: '', category: '', notes: '' });
            fetchData();
        }
        catch (error) {
            console.error('Error adding expense:', error);
        }
    };
    const handleExportReport = async () => {
        try {
            const response = await api.get('/reports/export/financial', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'financial_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
        catch (error) {
            console.error('Error exporting report:', error);
        }
    };
    if (loading) {
        return _jsx(LinearProgress, {});
    }
    const summaryCards = [
        {
            title: 'إجمالي الإيرادات',
            value: `${(data?.totalRevenue || 0).toLocaleString()} ل.س`,
            icon: _jsx(TrendingUpIcon, { sx: { fontSize: 40 } }),
            color: '#4caf50',
        },
        {
            title: 'إجمالي المصروفات',
            value: `${(data?.totalExpenses || 0).toLocaleString()} ل.س`,
            icon: _jsx(TrendingDownIcon, { sx: { fontSize: 40 } }),
            color: '#f44336',
        },
        {
            title: 'صافي الربح',
            value: `${(data?.totalProfit || 0).toLocaleString()} ل.س`,
            icon: _jsx(MoneyIcon, { sx: { fontSize: 40 } }),
            color: '#ff9800',
        },
        {
            title: 'الفواتير المتأخرة',
            value: `${data?.overdueInvoices || 0}`,
            icon: _jsx(ReceiptIcon, { sx: { fontSize: 40 } }),
            color: '#9c27b0',
        },
    ];
    return (_jsxs(Box, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h4", children: "\u0627\u0644\u062A\u0628\u0648\u064A\u0628\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629" }), _jsxs(Box, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: fetchData, sx: { mr: 1 }, children: "\u062A\u062D\u062F\u064A\u062B" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(DownloadIcon, {}), onClick: handleExportReport, sx: { mr: 1 }, children: "\u062A\u0635\u062F\u064A\u0631" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => setExpenseDialogOpen(true), children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0635\u0631\u0648\u0641" })] })] }), _jsx(Grid, { container: true, spacing: 3, children: summaryCards.map((card, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [_jsxs(Box, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, children: card.title }), _jsx(Typography, { variant: "h5", children: card.value })] }), _jsx(Box, { sx: { color: card.color }, children: card.icon })] }) }) }) }, index))) }), _jsxs(Paper, { sx: { mt: 3 }, children: [_jsxs(Tabs, { value: tabValue, onChange: (_, v) => setTabValue(v), children: [_jsx(Tab, { label: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629" }), _jsx(Tab, { label: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0641\u0626\u0629" }), _jsx(Tab, { label: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631" })] }), _jsxs(Box, { sx: { p: 3 }, children: [tabValue === 0 && (_jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(BarChart, { data: data?.monthlyRevenue || [], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { dataKey: "revenue", fill: "#4caf50", name: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A" }), _jsx(Bar, { dataKey: "expenses", fill: "#f44336", name: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A" }), _jsx(Bar, { dataKey: "profit", fill: "#ff9800", name: "\u0627\u0644\u0623\u0631\u0628\u0627\u062D" })] }) })), tabValue === 1 && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data?.expensesByCategory || [], cx: "50%", cy: "50%", labelLine: false, label: ({ category, percentage }) => `${category}: ${percentage}%`, outerRadius: 80, fill: "#8884d8", dataKey: "amount", children: (data?.expensesByCategory || []).map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0627\u0644\u0641\u0626\u0629" }), _jsx(TableCell, { align: "right", children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsx(TableCell, { align: "right", children: "\u0627\u0644\u0646\u0633\u0628\u0629" })] }) }), _jsx(TableBody, { children: (data?.expensesByCategory || []).map((cat) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: cat.category }), _jsxs(TableCell, { align: "right", children: [cat.amount.toLocaleString(), " \u0644.\u0633"] }), _jsxs(TableCell, { align: "right", children: [cat.percentage, "%"] })] }, cat.category))) })] }) }) })] })), tabValue === 2 && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { variant: "outlined", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "\u0645\u0644\u062E\u0635 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631" }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 2, children: [_jsx(Typography, { children: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631:" }), _jsx(Typography, { fontWeight: "bold", children: data?.totalInvoices || 0 })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 1, children: [_jsx(Typography, { children: "\u0645\u062F\u0641\u0648\u0639\u0629:" }), _jsx(Chip, { label: data?.paidInvoices || 0, color: "success", size: "small" })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 1, children: [_jsx(Typography, { children: "\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639\u0629:" }), _jsx(Chip, { label: data?.unpaidInvoices || 0, color: "warning", size: "small" })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 1, children: [_jsx(Typography, { children: "\u0645\u062A\u0623\u062E\u0631\u0629:" }), _jsx(Chip, { label: data?.overdueInvoices || 0, color: "error", size: "small" })] }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 2, pt: 2, borderTop: "1px solid #eee", children: [_jsx(Typography, { children: "\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A:" }), _jsxs(Typography, { fontWeight: "bold", color: "error", children: [(data?.overdueAmount || 0).toLocaleString(), " \u0644.\u0633"] })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(Card, { variant: "outlined", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062F\u0641\u0639" }), _jsxs(Typography, { variant: "h3", color: "primary", children: [(data?.averagePayment || 0).toLocaleString(), " \u0644.\u0633"] }), _jsxs(Typography, { color: "textSecondary", children: ["\u0625\u062C\u0645\u0627\u0644\u064A \u0639\u062F\u062F \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A: ", data?.totalPayments || 0] })] }) }) })] }))] })] }), _jsxs(Dialog, { open: expenseDialogOpen, onClose: () => setExpenseDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0635\u0631\u0648\u0641 \u062C\u062F\u064A\u062F" }), _jsxs(DialogContent, { children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0645\u0628\u0644\u063A", type: "number", value: expenseForm.amount, onChange: (e) => setExpenseForm({ ...expenseForm, amount: e.target.value }), margin: "normal", required: true }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0633\u0628\u0628", value: expenseForm.reason, onChange: (e) => setExpenseForm({ ...expenseForm, reason: e.target.value }), margin: "normal", required: true }), _jsxs(TextField, { fullWidth: true, select: true, label: "\u0627\u0644\u0641\u0626\u0629", value: expenseForm.category, onChange: (e) => setExpenseForm({ ...expenseForm, category: e.target.value }), margin: "normal", required: true, children: [_jsx(MenuItem, { value: "Salaries", children: "\u0631\u0648\u0627\u062A\u0628" }), _jsx(MenuItem, { value: "Rent", children: "\u0625\u064A\u062C\u0627\u0631" }), _jsx(MenuItem, { value: "Equipment", children: "\u0645\u0639\u062F\u0627\u062A" }), _jsx(MenuItem, { value: "Marketing", children: "\u062A\u0633\u0648\u064A\u0642" }), _jsx(MenuItem, { value: "Utilities", children: "\u0641\u0648\u0627\u062A\u064A\u0631" }), _jsx(MenuItem, { value: "Other", children: "\u0623\u062E\u0631\u0649" })] }), _jsx(TextField, { fullWidth: true, label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: expenseForm.notes, onChange: (e) => setExpenseForm({ ...expenseForm, notes: e.target.value }), margin: "normal", multiline: true, rows: 3 })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setExpenseDialogOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleAddExpense, variant: "contained", disabled: !expenseForm.amount || !expenseForm.reason, children: "\u0625\u0636\u0627\u0641\u0629" })] })] })] }));
}
