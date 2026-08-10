import { c as createSvgIcon, j as jsxRuntimeExports, r as reactExports, a as api, y as TrendingUpIcon, M as MoneyIcon, R as ReceiptIcon, B as Box, T as Typography, e as Button, f as Paper, g as TextField, i as MenuItem } from "./index-CvPhQGw5.js";
import { L as LinearProgress, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis } from "./BarChart-dG-d6Hnq.js";
import { R as RefreshIcon } from "./Refresh-DbF-JX5a.js";
import { D as DownloadIcon } from "./Download-QngAMRlE.js";
import { A as AddIcon } from "./Add-ufYjVZFg.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { C as Card, a as CardContent } from "./CardContent-BtwDWtSL.js";
import { T as Tabs, a as Tab } from "./Tabs-BznsVJTZ.js";
import { R as ResponsiveContainer, T as Tooltip, L as Legend, B as Bar, P as PieChart, a as Pie, C as Cell } from "./PieChart-B9X8rMRA.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
import "./KeyboardArrowRight-nMvpNNjv.js";
const TrendingDownIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m16 18 2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"
}), "TrendingDown");
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
function Financial() {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [tabValue, setTabValue] = reactExports.useState(0);
  const [expenseDialogOpen, setExpenseDialogOpen] = reactExports.useState(false);
  const [expenseForm, setExpenseForm] = reactExports.useState({
    amount: "",
    reason: "",
    category: "",
    notes: ""
  });
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/financial/dashboard");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddExpense = async () => {
    try {
      await api.post("/financial/expense", {
        amount: parseFloat(expenseForm.amount),
        reason: expenseForm.reason,
        category: expenseForm.category,
        notes: expenseForm.notes
      });
      setExpenseDialogOpen(false);
      setExpenseForm({ amount: "", reason: "", category: "", notes: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };
  const handleExportReport = async () => {
    try {
      const response = await api.get("/reports/export/financial", {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "financial_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };
  if (loading) {
    return jsxRuntimeExports.jsx(LinearProgress, {});
  }
  const summaryCards = [
    {
      title: "إجمالي الإيرادات",
      value: `${((data == null ? void 0 : data.totalRevenue) || 0).toLocaleString()} ل.س`,
      icon: jsxRuntimeExports.jsx(TrendingUpIcon, { sx: { fontSize: 40 } }),
      color: "#4caf50"
    },
    {
      title: "إجمالي المصروفات",
      value: `${((data == null ? void 0 : data.totalExpenses) || 0).toLocaleString()} ل.س`,
      icon: jsxRuntimeExports.jsx(TrendingDownIcon, { sx: { fontSize: 40 } }),
      color: "#f44336"
    },
    {
      title: "صافي الربح",
      value: `${((data == null ? void 0 : data.totalProfit) || 0).toLocaleString()} ل.س`,
      icon: jsxRuntimeExports.jsx(MoneyIcon, { sx: { fontSize: 40 } }),
      color: "#ff9800"
    },
    {
      title: "الفواتير المتأخرة",
      value: `${(data == null ? void 0 : data.overdueInvoices) || 0}`,
      icon: jsxRuntimeExports.jsx(ReceiptIcon, { sx: { fontSize: 40 } }),
      color: "#9c27b0"
    }
  ];
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "التبويبة المالية" }), jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(RefreshIcon, {}), onClick: fetchData, sx: { mr: 1 }, children: "تحديث" }), jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(DownloadIcon, {}), onClick: handleExportReport, sx: { mr: 1 }, children: "تصدير" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => setExpenseDialogOpen(true), children: "إضافة مصروف" })] })] }), jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: summaryCards.map((card, index) => jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: jsxRuntimeExports.jsx(Card, { children: jsxRuntimeExports.jsx(CardContent, { children: jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: card.title }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: card.value })] }), jsxRuntimeExports.jsx(Box, { sx: { color: card.color }, children: card.icon })] }) }) }) }, index)) }), jsxRuntimeExports.jsxs(Paper, { sx: { mt: 3 }, children: [jsxRuntimeExports.jsxs(Tabs, { value: tabValue, onChange: (_, v) => setTabValue(v), children: [jsxRuntimeExports.jsx(Tab, { label: "الإيرادات الشهرية" }), jsxRuntimeExports.jsx(Tab, { label: "المصروفات حسب الفئة" }), jsxRuntimeExports.jsx(Tab, { label: "الفواتير" })] }), jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [tabValue === 0 && jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 400, children: jsxRuntimeExports.jsxs(BarChart, { data: (data == null ? void 0 : data.monthlyRevenue) || [], children: [jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }), jsxRuntimeExports.jsx(XAxis, { dataKey: "month" }), jsxRuntimeExports.jsx(YAxis, {}), jsxRuntimeExports.jsx(Tooltip, {}), jsxRuntimeExports.jsx(Legend, {}), jsxRuntimeExports.jsx(Bar, { dataKey: "revenue", fill: "#4caf50", name: "الإيرادات" }), jsxRuntimeExports.jsx(Bar, { dataKey: "expenses", fill: "#f44336", name: "المصروفات" }), jsxRuntimeExports.jsx(Bar, { dataKey: "profit", fill: "#ff9800", name: "الأرباح" })] }) }), tabValue === 1 && jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: jsxRuntimeExports.jsxs(PieChart, { children: [jsxRuntimeExports.jsx(Pie, { data: (data == null ? void 0 : data.expensesByCategory) || [], cx: "50%", cy: "50%", labelLine: false, label: ({ category, percentage }) => `${category}: ${percentage}%`, outerRadius: 80, fill: "#8884d8", dataKey: "amount", children: ((data == null ? void 0 : data.expensesByCategory) || []).map((_, index) => jsxRuntimeExports.jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`)) }), jsxRuntimeExports.jsx(Tooltip, {})] }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TableContainer, { component: Paper, variant: "outlined", children: jsxRuntimeExports.jsxs(Table, { size: "small", children: [jsxRuntimeExports.jsx(TableHead, { children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "الفئة" }), jsxRuntimeExports.jsx(TableCell, { align: "right", children: "المبلغ" }), jsxRuntimeExports.jsx(TableCell, { align: "right", children: "النسبة" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: ((data == null ? void 0 : data.expensesByCategory) || []).map((cat) => jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: cat.category }), jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [cat.amount.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [cat.percentage, "%"] })] }, cat.category)) })] }) }) })] }), tabValue === 2 && jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsx(Card, { variant: "outlined", children: jsxRuntimeExports.jsxs(CardContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "ملخص الفواتير" }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 2, children: [jsxRuntimeExports.jsx(Typography, { children: "إجمالي الفواتير:" }), jsxRuntimeExports.jsx(Typography, { fontWeight: "bold", children: (data == null ? void 0 : data.totalInvoices) || 0 })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 1, children: [jsxRuntimeExports.jsx(Typography, { children: "مدفوعة:" }), jsxRuntimeExports.jsx(Chip, { label: (data == null ? void 0 : data.paidInvoices) || 0, color: "success", size: "small" })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 1, children: [jsxRuntimeExports.jsx(Typography, { children: "غير مدفوعة:" }), jsxRuntimeExports.jsx(Chip, { label: (data == null ? void 0 : data.unpaidInvoices) || 0, color: "warning", size: "small" })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 1, children: [jsxRuntimeExports.jsx(Typography, { children: "متأخرة:" }), jsxRuntimeExports.jsx(Chip, { label: (data == null ? void 0 : data.overdueInvoices) || 0, color: "error", size: "small" })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 2, pt: 2, borderTop: "1px solid #eee", children: [jsxRuntimeExports.jsx(Typography, { children: "قيمة المتأخرات:" }), jsxRuntimeExports.jsxs(Typography, { fontWeight: "bold", color: "error", children: [((data == null ? void 0 : data.overdueAmount) || 0).toLocaleString(), " ل.س"] })] })] }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 8, children: jsxRuntimeExports.jsx(Card, { variant: "outlined", children: jsxRuntimeExports.jsxs(CardContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "متوسط الدفع" }), jsxRuntimeExports.jsxs(Typography, { variant: "h3", color: "primary", children: [((data == null ? void 0 : data.averagePayment) || 0).toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsxs(Typography, { color: "textSecondary", children: ["إجمالي عدد المدفوعات: ", (data == null ? void 0 : data.totalPayments) || 0] })] }) }) })] })] })] }), jsxRuntimeExports.jsxs(Dialog, { open: expenseDialogOpen, onClose: () => setExpenseDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "إضافة مصروف جديد" }), jsxRuntimeExports.jsxs(DialogContent, { children: [jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "المبلغ", type: "number", value: expenseForm.amount, onChange: (e) => setExpenseForm({ ...expenseForm, amount: e.target.value }), margin: "normal", required: true }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "السبب", value: expenseForm.reason, onChange: (e) => setExpenseForm({ ...expenseForm, reason: e.target.value }), margin: "normal", required: true }), jsxRuntimeExports.jsxs(TextField, { fullWidth: true, select: true, label: "الفئة", value: expenseForm.category, onChange: (e) => setExpenseForm({ ...expenseForm, category: e.target.value }), margin: "normal", required: true, children: [jsxRuntimeExports.jsx(MenuItem, { value: "Salaries", children: "رواتب" }), jsxRuntimeExports.jsx(MenuItem, { value: "Rent", children: "إيجار" }), jsxRuntimeExports.jsx(MenuItem, { value: "Equipment", children: "معدات" }), jsxRuntimeExports.jsx(MenuItem, { value: "Marketing", children: "تسويق" }), jsxRuntimeExports.jsx(MenuItem, { value: "Utilities", children: "فواتير" }), jsxRuntimeExports.jsx(MenuItem, { value: "Other", children: "أخرى" })] }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "ملاحظات", value: expenseForm.notes, onChange: (e) => setExpenseForm({ ...expenseForm, notes: e.target.value }), margin: "normal", multiline: true, rows: 3 })] }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setExpenseDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleAddExpense, variant: "contained", disabled: !expenseForm.amount || !expenseForm.reason, children: "إضافة" })] })] })] });
}
export {
  Financial as default
};
//# sourceMappingURL=Financial-B5J-EejK.js.map
