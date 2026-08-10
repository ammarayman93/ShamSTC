import { c as createSvgIcon, j as jsxRuntimeExports, r as reactExports, a as api, B as Box, T as Typography, e as Button, R as ReceiptIcon, A as Alert, f as Paper, I as IconButton, F as FormControl, h as InputLabel, S as Select, i as MenuItem, g as TextField, C as CircularProgress, D as Divider } from "./index-CvPhQGw5.js";
import { R as RefreshIcon } from "./Refresh-DbF-JX5a.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { V as VisibilityIcon } from "./Visibility-DNsOSjUl.js";
import { P as PrintIcon } from "./Print-D17PazDc.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
import { I as InputAdornment } from "./InputAdornment-DxPVCxwY.js";
const PaidIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m.88 15.76V19h-1.75v-1.29c-.74-.18-2.39-.77-3.02-2.96l1.65-.67c.06.22.58 2.09 2.4 2.09.93 0 1.98-.48 1.98-1.61 0-.96-.7-1.46-2.28-2.03-1.1-.39-3.35-1.03-3.35-3.31 0-.1.01-2.4 2.62-2.96V5h1.75v1.24c1.84.32 2.51 1.79 2.66 2.23l-1.58.67c-.11-.35-.59-1.34-1.9-1.34-.7 0-1.81.37-1.81 1.39 0 .95.86 1.31 2.64 1.9 2.4.83 3.01 2.05 3.01 3.45 0 2.63-2.5 3.13-3.02 3.22"
}), "Paid");
function Invoices() {
  const [invoices, setInvoices] = reactExports.useState([]);
  const [clients, setClients] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = reactExports.useState(false);
  const [selectedInvoice, setSelectedInvoice] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    clientId: "",
    amount: "",
    dueDate: ""
  });
  reactExports.useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/invoices");
      if (response.data && response.data.success) {
        setInvoices(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setInvoices(response.data);
      }
    } catch (error2) {
      console.error("Error fetching invoices:", error2);
    } finally {
      setLoading(false);
    }
  };
  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");
      if (response.data && response.data.success) {
        setClients(response.data.data.data || []);
      }
    } catch (error2) {
      console.error("Error fetching clients:", error2);
    }
  };
  const handleSubmit = async () => {
    var _a, _b;
    setSubmitting(true);
    setError("");
    try {
      const data = {
        clientId: parseInt(formData.clientId),
        total: parseFloat(formData.amount),
        dueDate: formData.dueDate
      };
      await api.post("/invoices", data);
      setSuccess("تم إنشاء الفاتورة بنجاح");
      setDialogOpen(false);
      fetchInvoices();
      setTimeout(() => setSuccess(""), 3e3);
    } catch (err) {
      setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };
  const handleMarkAsPaid = async (id) => {
    if (window.confirm("هل أنت متأكد من تحديد هذه الفاتورة كمدفوعة؟")) {
      try {
        await api.put(`/invoices/${id}/pay`);
        setSuccess("تم تحديث حالة الفاتورة");
        fetchInvoices();
      } catch (error2) {
        setError("حدث خطأ");
      }
    }
  };
  const totalUnpaid = invoices.filter((i) => !i.isPaid).reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.filter((i) => i.isPaid).reduce((sum, i) => sum + i.total, 0);
  const overdueInvoices = invoices.filter((i) => !i.isPaid && new Date(i.dueDate) < /* @__PURE__ */ new Date()).length;
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "الفواتير" }), jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(RefreshIcon, {}), onClick: fetchInvoices, sx: { mr: 1 }, children: "تحديث" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(ReceiptIcon, {}), onClick: () => setDialogOpen(true), children: "فاتورة جديدة" })] })] }), success && jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#4caf50", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "المدفوع" }), jsxRuntimeExports.jsxs(Typography, { variant: "h5", children: [totalPaid.toLocaleString(), " ل.س"] })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#f44336", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "غير المدفوع" }), jsxRuntimeExports.jsxs(Typography, { variant: "h5", children: [totalUnpaid.toLocaleString(), " ل.س"] })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#ff9800", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "فواتير متأخرة" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: overdueInvoices })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#2196f3", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "إجمالي الفواتير" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: invoices.length })] }) })] }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: "#f5f5f5" }, children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "رقم الفاتورة" }), jsxRuntimeExports.jsx(TableCell, { children: "العميل" }), jsxRuntimeExports.jsx(TableCell, { children: "المبلغ" }), jsxRuntimeExports.jsx(TableCell, { children: "تاريخ الإنشاء" }), jsxRuntimeExports.jsx(TableCell, { children: "تاريخ الاستحقاق" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: invoices.map((invoice, idx) => jsxRuntimeExports.jsxs(TableRow, { hover: true, sx: { bgcolor: !invoice.isPaid && new Date(invoice.dueDate) < /* @__PURE__ */ new Date() ? "#ffebee" : "inherit" }, children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: invoice.invoiceNumber }), jsxRuntimeExports.jsx(TableCell, { children: invoice.clientName }), jsxRuntimeExports.jsxs(TableCell, { children: [invoice.total.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsx(TableCell, { children: new Date(invoice.date).toLocaleDateString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: new Date(invoice.dueDate).toLocaleDateString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: invoice.isPaid ? "مدفوعة" : new Date(invoice.dueDate) < /* @__PURE__ */ new Date() ? "متأخرة" : "غير مدفوعة", color: invoice.isPaid ? "success" : new Date(invoice.dueDate) < /* @__PURE__ */ new Date() ? "error" : "warning", size: "small" }) }), jsxRuntimeExports.jsxs(TableCell, { children: [jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  }, children: jsxRuntimeExports.jsx(VisibilityIcon, { fontSize: "small" }) }), !invoice.isPaid && jsxRuntimeExports.jsx(IconButton, { size: "small", color: "success", onClick: () => handleMarkAsPaid(invoice.id), children: jsxRuntimeExports.jsx(PaidIcon, { fontSize: "small" }) }), jsxRuntimeExports.jsx(IconButton, { size: "small", children: jsxRuntimeExports.jsx(PrintIcon, { fontSize: "small" }) })] })] }, invoice.id)) })] }) }), jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "فاتورة جديدة" }), jsxRuntimeExports.jsx(DialogContent, { children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [jsxRuntimeExports.jsx(InputLabel, { children: "العميل" }), jsxRuntimeExports.jsx(Select, { value: formData.clientId, onChange: (e) => setFormData({ ...formData, clientId: e.target.value }), label: "العميل", children: clients.map((c) => jsxRuntimeExports.jsxs(MenuItem, { value: c.id, children: [c.fullName, " - ", c.username] }, c.id)) })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "المبلغ", type: "number", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), InputProps: { startAdornment: jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: "ل.س" }) } }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "تاريخ الاستحقاق", type: "date", value: formData.dueDate, onChange: (e) => setFormData({ ...formData, dueDate: e.target.value }), InputLabelProps: { shrink: true } }) })] }) }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting, children: submitting ? jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : "إنشاء الفاتورة" })] })] }), jsxRuntimeExports.jsxs(Dialog, { open: viewDialogOpen, onClose: () => setViewDialogOpen(false), maxWidth: "md", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "تفاصيل الفاتورة" }), jsxRuntimeExports.jsx(DialogContent, { children: selectedInvoice && jsxRuntimeExports.jsx(Box, { children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "رقم الفاتورة" }), jsxRuntimeExports.jsx(Typography, { variant: "h6", children: selectedInvoice.invoiceNumber })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "التاريخ" }), jsxRuntimeExports.jsx(Typography, { variant: "h6", children: new Date(selectedInvoice.date).toLocaleDateString("ar-EG") })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "العميل" }), jsxRuntimeExports.jsx(Typography, { children: selectedInvoice.clientName })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "تاريخ الاستحقاق" }), jsxRuntimeExports.jsx(Typography, { children: new Date(selectedInvoice.dueDate).toLocaleDateString("ar-EG") })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "المبلغ" }), jsxRuntimeExports.jsxs(Typography, { variant: "h4", color: "primary", children: [selectedInvoice.total.toLocaleString(), " ل.س"] })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "الحالة" }), jsxRuntimeExports.jsx(Chip, { label: selectedInvoice.isPaid ? "مدفوعة" : "غير مدفوعة", color: selectedInvoice.isPaid ? "success" : "warning" })] })] }) }) }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setViewDialogOpen(false), children: "إغلاق" }), jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(PrintIcon, {}), children: "طباعة" })] })] })] });
}
export {
  Invoices as default
};
//# sourceMappingURL=Invoices-D5up4-vI.js.map
