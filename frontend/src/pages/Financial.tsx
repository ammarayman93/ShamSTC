import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

interface DashboardData {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  totalRevenue: number;
  todayExpenses: number;
  monthExpenses: number;
  totalExpenses: number;
  todayProfit: number;
  monthProfit: number;
  totalProfit: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  overdueAmount: number;
  totalPayments: number;
  averagePayment: number;
  monthlyRevenue: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  expensesByCategory: Array<{ category: string; amount: number; percentage: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Financial() {
  const [data, setData] = useState<DashboardData | null>(null);
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
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
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
    } catch (error) {
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
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const summaryCards = [
    {
      title: 'إجمالي الإيرادات',
      value: `${(data?.totalRevenue || 0).toLocaleString()} ل.س`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'إجمالي المصروفات',
      value: `${(data?.totalExpenses || 0).toLocaleString()} ل.س`,
      icon: <TrendingDownIcon sx={{ fontSize: 40 }} />,
      color: '#f44336',
    },
    {
      title: 'صافي الربح',
      value: `${(data?.totalProfit || 0).toLocaleString()} ل.س`,
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'الفواتير المتأخرة',
      value: `${data?.overdueInvoices || 0}`,
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">التبويبة المالية</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ mr: 1 }}
          >
            تحديث
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
            sx={{ mr: 1 }}
          >
            تصدير
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setExpenseDialogOpen(true)}
          >
            إضافة مصروف
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h5">{card.value}</Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="الإيرادات الشهرية" />
          <Tab label="المصروفات حسب الفئة" />
          <Tab label="الفواتير" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#4caf50" name="الإيرادات" />
                <Bar dataKey="expenses" fill="#f44336" name="المصروفات" />
                <Bar dataKey="profit" fill="#ff9800" name="الأرباح" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.expensesByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {(data?.expensesByCategory || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الفئة</TableCell>
                        <TableCell align="right">المبلغ</TableCell>
                        <TableCell align="right">النسبة</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data?.expensesByCategory || []).map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell>{cat.category}</TableCell>
                          <TableCell align="right">{cat.amount.toLocaleString()} ل.س</TableCell>
                          <TableCell align="right">{cat.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">ملخص الفواتير</Typography>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Typography>إجمالي الفواتير:</Typography>
                      <Typography fontWeight="bold">{data?.totalInvoices || 0}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography>مدفوعة:</Typography>
                      <Chip label={data?.paidInvoices || 0} color="success" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography>غير مدفوعة:</Typography>
                      <Chip label={data?.unpaidInvoices || 0} color="warning" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography>متأخرة:</Typography>
                      <Chip label={data?.overdueInvoices || 0} color="error" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={2} pt={2} borderTop="1px solid #eee">
                      <Typography>قيمة المتأخرات:</Typography>
                      <Typography fontWeight="bold" color="error">
                        {(data?.overdueAmount || 0).toLocaleString()} ل.س
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">متوسط الدفع</Typography>
                    <Typography variant="h3" color="primary">
                      {(data?.averagePayment || 0).toLocaleString()} ل.س
                    </Typography>
                    <Typography color="textSecondary">
                      إجمالي عدد المدفوعات: {data?.totalPayments || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* إضافة مصروف Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مصروف جديد</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="المبلغ"
            type="number"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="السبب"
            value={expenseForm.reason}
            onChange={(e) => setExpenseForm({ ...expenseForm, reason: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="الفئة"
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            margin="normal"
            required
          >
            <MenuItem value="Salaries">رواتب</MenuItem>
            <MenuItem value="Rent">إيجار</MenuItem>
            <MenuItem value="Equipment">معدات</MenuItem>
            <MenuItem value="Marketing">تسويق</MenuItem>
            <MenuItem value="Utilities">فواتير</MenuItem>
            <MenuItem value="Other">أخرى</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="ملاحظات"
            value={expenseForm.notes}
            onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenseDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleAddExpense} variant="contained" disabled={!expenseForm.amount || !expenseForm.reason}>
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}