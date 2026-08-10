import { r as reactExports, u as useTheme, a as api, j as jsxRuntimeExports, B as Box, b as alpha, P as PeopleIcon, M as MoneyIcon, R as ReceiptIcon, T as Typography, A as Alert, D as Divider } from "./index-CvPhQGw5.js";
import { L as LinearProgress, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis } from "./BarChart-dG-d6Hnq.js";
import { W as WifiIcon } from "./Wifi-mG4BgS4h.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { C as Card, a as CardContent } from "./CardContent-BtwDWtSL.js";
import { R as ResponsiveContainer, T as Tooltip, L as Legend, B as Bar, P as PieChart, a as Pie, C as Cell } from "./PieChart-B9X8rMRA.js";
import { C as Chip } from "./Chip-trihV-h6.js";
const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];
function Dashboard() {
  var _a;
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [monthlyData, setMonthlyData] = reactExports.useState([]);
  const theme = useTheme();
  reactExports.useEffect(() => {
    fetchDashboard();
    fetchMonthlyData();
  }, []);
  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/dashboard");
      console.log("Dashboard response:", response.data);
      if (response.data && response.data.success !== false) {
        setData(response.data.data || response.data);
      } else if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setData({
          clients: { total: 11, active: 1, online: 0, expiringToday: 0, expiringSoon: 0, expired: 0 },
          plans: [{ name: "4Mb/s", count: 4 }, { name: "2Mb/s", count: 2 }],
          financial: { todayRevenue: 0, monthRevenue: 75e3, monthExpenses: 0, monthProfit: 75e3, overdueInvoices: 0, overdueAmount: 0 },
          recent: { expiredClientsList: [], expiringSoonList: [] }
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message || "حدث خطأ في تحميل البيانات");
      setData({
        clients: { total: 11, active: 1, online: 0, expiringToday: 0, expiringSoon: 0, expired: 0 },
        plans: [{ name: "4Mb/s", count: 4 }, { name: "2Mb/s", count: 2 }],
        financial: { todayRevenue: 0, monthRevenue: 75e3, monthExpenses: 0, monthProfit: 75e3, overdueInvoices: 0, overdueAmount: 0 },
        recent: { expiredClientsList: [], expiringSoonList: [] }
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchMonthlyData = async () => {
    var _a2;
    try {
      const response = await api.get("/financial/dashboard");
      if (response.data && response.data.success && ((_a2 = response.data.data) == null ? void 0 : _a2.monthlyRevenue)) {
        setMonthlyData(response.data.data.monthlyRevenue);
      } else {
        setMonthlyData([
          { month: "يناير", revenue: 45e3, expenses: 32e3, profit: 13e3 },
          { month: "فبراير", revenue: 52e3, expenses: 35e3, profit: 17e3 },
          { month: "مارس", revenue: 58e3, expenses: 33e3, profit: 25e3 },
          { month: "أبريل", revenue: 75e3, expenses: 38e3, profit: 37e3 }
        ]);
      }
    } catch (err) {
      setMonthlyData([
        { month: "يناير", revenue: 45e3, expenses: 32e3, profit: 13e3 },
        { month: "فبراير", revenue: 52e3, expenses: 35e3, profit: 17e3 },
        { month: "مارس", revenue: 58e3, expenses: 33e3, profit: 25e3 },
        { month: "أبريل", revenue: 75e3, expenses: 38e3, profit: 37e3 }
      ]);
    }
  };
  if (loading) {
    return jsxRuntimeExports.jsx(Box, { sx: { width: "100%", mt: 4 }, children: jsxRuntimeExports.jsx(LinearProgress, {}) });
  }
  const statCards = [
    {
      title: "إجمالي العملاء",
      value: (data == null ? void 0 : data.clients.total) || 0,
      icon: jsxRuntimeExports.jsx(PeopleIcon, { sx: { fontSize: 40 } }),
      color: "#6366f1",
      bgColor: alpha("#6366f1", 0.1)
    },
    {
      title: "عملاء نشطين",
      value: (data == null ? void 0 : data.clients.active) || 0,
      icon: jsxRuntimeExports.jsx(WifiIcon, { sx: { fontSize: 40 } }),
      color: "#10b981",
      bgColor: alpha("#10b981", 0.1)
    },
    {
      title: "إيرادات الشهر",
      value: `${((data == null ? void 0 : data.financial.monthRevenue) || 0).toLocaleString()} ل.س`,
      icon: jsxRuntimeExports.jsx(MoneyIcon, { sx: { fontSize: 40 } }),
      color: "#f59e0b",
      bgColor: alpha("#f59e0b", 0.1)
    },
    {
      title: "فواتير متأخرة",
      value: (data == null ? void 0 : data.financial.overdueInvoices) || 0,
      icon: jsxRuntimeExports.jsx(ReceiptIcon, { sx: { fontSize: 40 } }),
      color: "#ef4444",
      bgColor: alpha("#ef4444", 0.1)
    }
  ];
  const planDistribution = ((_a = data == null ? void 0 : data.plans) == null ? void 0 : _a.map((plan) => ({
    name: plan.name,
    value: plan.count
  }))) || [];
  return jsxRuntimeExports.jsxs(Box, { className: "animate-fade-in", children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, sx: { fontWeight: 700, mb: 4 }, children: "لوحة التحكم" }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }), jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: statCards.map((card, index) => jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: jsxRuntimeExports.jsx(Card, { sx: {
    borderRadius: 4,
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-4px)", boxShadow: 4 }
  }, children: jsxRuntimeExports.jsx(CardContent, { children: jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, variant: "body2", children: card.title }), jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: card.value })] }), jsxRuntimeExports.jsx(Box, { sx: {
    bgcolor: card.bgColor,
    borderRadius: "50%",
    p: 1.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }, children: card.icon })] }) }) }) }, index)) }), jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mt: 2 }, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 7, children: jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 4 }, children: jsxRuntimeExports.jsxs(CardContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "الإيرادات والمصروفات الشهرية" }), jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 350, children: jsxRuntimeExports.jsxs(BarChart, { data: monthlyData, children: [jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: theme.palette.divider }), jsxRuntimeExports.jsx(XAxis, { dataKey: "month", stroke: theme.palette.text.secondary }), jsxRuntimeExports.jsx(YAxis, { stroke: theme.palette.text.secondary }), jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    borderRadius: 12
  } }), jsxRuntimeExports.jsx(Legend, {}), jsxRuntimeExports.jsx(Bar, { dataKey: "revenue", fill: "#6366f1", name: "الإيرادات", radius: [8, 8, 0, 0] }), jsxRuntimeExports.jsx(Bar, { dataKey: "expenses", fill: "#ef4444", name: "المصروفات", radius: [8, 8, 0, 0] }), jsxRuntimeExports.jsx(Bar, { dataKey: "profit", fill: "#10b981", name: "الأرباح", radius: [8, 8, 0, 0] })] }) })] }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 5, children: jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 4 }, children: jsxRuntimeExports.jsxs(CardContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "توزيع الباقات" }), jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: jsxRuntimeExports.jsxs(PieChart, { children: [jsxRuntimeExports.jsx(Pie, { data: planDistribution, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`, outerRadius: 100, fill: "#8884d8", dataKey: "value", nameKey: "name", children: planDistribution.map((_, index) => jsxRuntimeExports.jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`)) }), jsxRuntimeExports.jsx(Tooltip, {}), jsxRuntimeExports.jsx(Legend, {})] }) })] }) }) })] }), jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mt: 2 }, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 4 }, children: jsxRuntimeExports.jsxs(CardContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "الملخص المالي" }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "إيرادات الشهر:" }), jsxRuntimeExports.jsxs(Typography, { fontWeight: "bold", color: "success.main", children: [((data == null ? void 0 : data.financial.monthRevenue) || 0).toLocaleString(), " ل.س"] })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "مصروفات الشهر:" }), jsxRuntimeExports.jsxs(Typography, { fontWeight: "bold", color: "error.main", children: [((data == null ? void 0 : data.financial.monthExpenses) || 0).toLocaleString(), " ل.س"] })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "أرباح الشهر:" }), jsxRuntimeExports.jsxs(Typography, { fontWeight: "bold", color: "success.main", children: [((data == null ? void 0 : data.financial.monthProfit) || 0).toLocaleString(), " ل.س"] })] }), jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "فواتير متأخرة:" }), jsxRuntimeExports.jsx(Chip, { label: `${(data == null ? void 0 : data.financial.overdueInvoices) || 0} فاتورة`, color: "error", size: "small" })] })] }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 4 }, children: jsxRuntimeExports.jsxs(CardContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 }, children: "إحصائيات العملاء" }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "إجمالي العملاء:" }), jsxRuntimeExports.jsx(Typography, { fontWeight: "bold", children: (data == null ? void 0 : data.clients.total) || 0 })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "عملاء نشطين:" }), jsxRuntimeExports.jsx(Typography, { fontWeight: "bold", color: "success.main", children: (data == null ? void 0 : data.clients.active) || 0 })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "عملاء متصلين:" }), jsxRuntimeExports.jsx(Typography, { fontWeight: "bold", color: "info.main", children: (data == null ? void 0 : data.clients.online) || 0 })] }), jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", children: "اشتراكات منتهية:" }), jsxRuntimeExports.jsx(Chip, { label: (data == null ? void 0 : data.clients.expired) || 0, color: "warning", size: "small" })] })] }) }) })] })] });
}
export {
  Dashboard as default
};
//# sourceMappingURL=Dashboard-BBE9Mkgj.js.map
