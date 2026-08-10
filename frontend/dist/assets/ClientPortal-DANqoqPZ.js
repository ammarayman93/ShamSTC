import { O as useAuth, r as reactExports, a as api, j as jsxRuntimeExports, C as CircularProgress, B as Box, T as Typography, R as ReceiptIcon, Q as AccountIcon, f as Paper, e as Button, g as TextField } from "./index-CvPhQGw5.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { C as Card, a as CardContent } from "./CardContent-BtwDWtSL.js";
import { W as WifiIcon } from "./Wifi-mG4BgS4h.js";
import { T as Tabs, a as Tab } from "./Tabs-BznsVJTZ.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
import "./KeyboardArrowRight-nMvpNNjv.js";
function ClientPortal() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = reactExports.useState(0);
  const [subscription, setSubscription] = reactExports.useState(null);
  const [invoices, setInvoices] = reactExports.useState([]);
  const [tickets, setTickets] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [ticketDialog, setTicketDialog] = reactExports.useState(false);
  const [ticketForm, setTicketForm] = reactExports.useState({ title: "", description: "", priority: "Medium", category: "General" });
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, invRes, tickRes] = await Promise.all([
        api.get("/subscriptions/client"),
        api.get("/invoices/client"),
        api.get("/tickets/client")
      ]);
      if (subRes.data.success)
        setSubscription(subRes.data.data);
      if (invRes.data.success)
        setInvoices(invRes.data.data);
      if (tickRes.data.success)
        setTickets(tickRes.data.data);
    } catch (error2) {
      console.error(error2);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateTicket = async () => {
    try {
      await api.post("/tickets", { ...ticketForm, clientId: user == null ? void 0 : user.id });
      setSuccess("تم إنشاء التذكرة بنجاح");
      setTicketDialog(false);
      fetchData();
    } catch (err) {
      setError("حدث خطأ");
    }
  };
  const daysRemaining = subscription ? Math.ceil((new Date(subscription.endDate).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24)) : 0;
  if (loading)
    return jsxRuntimeExports.jsx(CircularProgress, {});
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "لوحة العميل" }), jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, mb: 4, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsx(Card, { children: jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center" }, children: [jsxRuntimeExports.jsx(WifiIcon, { sx: { fontSize: 50, color: "#1976d2" } }), jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "الباقة الحالية" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: (subscription == null ? void 0 : subscription.planName) || "لا يوجد" }), jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: subscription == null ? void 0 : subscription.speed })] }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsx(Card, { children: jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center" }, children: [jsxRuntimeExports.jsx(ReceiptIcon, { sx: { fontSize: 50, color: "#4caf50" } }), jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "المتبقي على الاشتراك" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", color: daysRemaining <= 3 ? "error" : "success", children: daysRemaining > 0 ? `${daysRemaining} يوم` : "منتهي" }), jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: ["ينتهي في ", subscription ? new Date(subscription.endDate).toLocaleDateString("ar-EG") : "-"] })] }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsx(Card, { children: jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center" }, children: [jsxRuntimeExports.jsx(AccountIcon, { sx: { fontSize: 50, color: "#ff9800" } }), jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "مرحباً" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: user == null ? void 0 : user.fullName }), jsxRuntimeExports.jsx(Typography, { variant: "body2", children: user == null ? void 0 : user.username })] }) }) })] }), jsxRuntimeExports.jsxs(Paper, { sx: { width: "100%" }, children: [jsxRuntimeExports.jsxs(Tabs, { value: tabValue, onChange: (_, v) => setTabValue(v), children: [jsxRuntimeExports.jsx(Tab, { label: "الاشتراك" }), jsxRuntimeExports.jsx(Tab, { label: "الفواتير" }), jsxRuntimeExports.jsx(Tab, { label: "تذاكر الدعم" })] }), tabValue === 0 && subscription && jsxRuntimeExports.jsx(Box, { p: 3, children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "اسم الباقة:" }), jsxRuntimeExports.jsx(Typography, { variant: "h6", children: subscription.planName })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "السرعة:" }), jsxRuntimeExports.jsx(Typography, { variant: "h6", children: subscription.speed })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "تاريخ البدء:" }), jsxRuntimeExports.jsx(Typography, { children: new Date(subscription.startDate).toLocaleDateString("ar-EG") })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "تاريخ الانتهاء:" }), jsxRuntimeExports.jsx(Typography, { children: new Date(subscription.endDate).toLocaleDateString("ar-EG") })] })] }) }), tabValue === 1 && jsxRuntimeExports.jsx(Box, { p: 3, children: jsxRuntimeExports.jsx(TableContainer, { component: Paper, variant: "outlined", children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "رقم الفاتورة" }), jsxRuntimeExports.jsx(TableCell, { children: "المبلغ" }), jsxRuntimeExports.jsx(TableCell, { children: "التاريخ" }), jsxRuntimeExports.jsx(TableCell, { children: "تاريخ الاستحقاق" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: invoices.map((inv) => jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: inv.invoiceNumber }), jsxRuntimeExports.jsxs(TableCell, { children: [inv.total.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsx(TableCell, { children: new Date(inv.date).toLocaleDateString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: new Date(inv.dueDate).toLocaleDateString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: inv.isPaid ? "مدفوعة" : "غير مدفوعة", color: inv.isPaid ? "success" : "error", size: "small" }) })] }, inv.id)) })] }) }) }), tabValue === 2 && jsxRuntimeExports.jsxs(Box, { p: 3, children: [jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: () => setTicketDialog(true), sx: { mb: 2 }, children: "تذكرة جديدة" }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, variant: "outlined", children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "العنوان" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" }), jsxRuntimeExports.jsx(TableCell, { children: "التاريخ" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: tickets.map((t, idx) => jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: t.title }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: t.status, color: t.status === "Open" ? "warning" : "success", size: "small" }) }), jsxRuntimeExports.jsx(TableCell, { children: new Date(t.createdAt).toLocaleDateString("ar-EG") })] }, t.id)) })] }) })] })] }), jsxRuntimeExports.jsxs(Dialog, { open: ticketDialog, onClose: () => setTicketDialog(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "تذكرة دعم جديدة" }), jsxRuntimeExports.jsxs(DialogContent, { children: [jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "العنوان", value: ticketForm.title, onChange: (e) => setTicketForm({ ...ticketForm, title: e.target.value }), margin: "normal" }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الوصف", multiline: true, rows: 4, value: ticketForm.description, onChange: (e) => setTicketForm({ ...ticketForm, description: e.target.value }), margin: "normal" })] }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setTicketDialog(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleCreateTicket, variant: "contained", children: "إرسال" })] })] })] });
}
export {
  ClientPortal as default
};
//# sourceMappingURL=ClientPortal-DANqoqPZ.js.map
