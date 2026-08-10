import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  TextField,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const [reportType, setReportType] = useState('subscriptions');
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case 'subscriptions':
          response = await api.get('/reports/subscriptions');
          break;
        case 'clients':
          response = await api.get('/reports/clients');
          break;
        case 'products':
          response = await api.get('/reports/products');
          break;
        default:
          return;
      }
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        التقارير والإحصائيات
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>نوع التقرير</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="نوع التقرير"
              >
                <MenuItem value="subscriptions">تقرير الاشتراكات</MenuItem>
                <MenuItem value="clients">تقرير العملاء</MenuItem>
                <MenuItem value="products">تقرير المنتجات</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>الفترة</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                label="الفترة"
              >
                <MenuItem value="week">أسبوع</MenuItem>
                <MenuItem value="month">شهر</MenuItem>
                <MenuItem value="quarter">ربع سنة</MenuItem>
                <MenuItem value="year">سنة</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchReport}
              disabled={loading}
            >
              عرض التقرير
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {data && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                طباعة
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                تصدير
              </Button>
            </Box>

            {reportType === 'subscriptions' && (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">اشتراكات جديدة</Typography>
                        <Typography variant="h3" color="success.main">
                          {data.summary?.newSubscriptions || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">اشتراكات منتهية</Typography>
                        <Typography variant="h3" color="error.main">
                          {data.summary?.expiredSubscriptions || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">اشتراكات نشطة</Typography>
                        <Typography variant="h3" color="primary.main">
                          {data.summary?.activeSubscriptions || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">نسبة التجديد</Typography>
                        <Typography variant="h3">
                          {data.summary?.renewalRate || 0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 3 }}>
                  الاشتراكات حسب الباقة
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الباقة</TableCell>
                        <TableCell align="right">عدد الاشتراكات</TableCell>
                        <TableCell align="right">الإيرادات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.byPlan?.map((plan: any) => (
                        <TableRow key={plan.plan}>
                          <TableCell>{plan.plan}</TableCell>
                          <TableCell align="right">{plan.count}</TableCell>
                          <TableCell align="right">{plan.revenue.toLocaleString()} ل.س</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {reportType === 'clients' && (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">إجمالي العملاء</Typography>
                        <Typography variant="h3" color="primary.main">
                          {data.totalClients || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">عملاء نشطين</Typography>
                        <Typography variant="h3" color="success.main">
                          {data.activeClients || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">عملاء جدد هذا الشهر</Typography>
                        <Typography variant="h3" color="info.main">
                          {data.newClientsThisMonth || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">عملاء غير نشطين</Typography>
                        <Typography variant="h3" color="error.main">
                          {data.inactiveClients || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 3 }}>
                  العملاء حسب الحالة
                </Typography>
                <Box display="flex" justifyContent="center" mt={2}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.byStatus || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {(data.byStatus || []).map((_, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </>
            )}

            {reportType === 'products' && (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">المنتجات الأكثر مبيعاً</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>المنتج</TableCell>
                            <TableCell align="right">الكمية المباعة</TableCell>
                            <TableCell align="right">الإيرادات</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.topProducts?.map((product: any) => (
                            <TableRow key={product.productId}>
                              <TableCell>{product.productName}</TableCell>
                              <TableCell align="right">{product.quantitySold}</TableCell>
                              <TableCell align="right">{product.totalRevenue.toLocaleString()} ل.س</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">منتجات منخفضة المخزون</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>المنتج</TableCell>
                            <TableCell align="right">المتبقي</TableCell>
                            <TableCell align="right">سعر البيع</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.lowStockProducts?.map((product: any) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={product.quantity}
                                  color={product.quantity <= 5 ? 'error' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">{product.sellPrice.toLocaleString()} ل.س</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>

                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6">إجمالي قيمة المخزون</Typography>
                    <Typography variant="h3" color="primary.main">
                      {(data.totalStockValue || 0).toLocaleString()} ل.س
                    </Typography>
                  </CardContent>
                </Card>
              </>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}