import { r as reactExports, a as api, j as jsxRuntimeExports, B as Box, T as Typography, e as Button, A as Alert, f as Paper, F as FormControl, h as InputLabel, S as Select, i as MenuItem, I as IconButton, g as TextField } from "./index-CvPhQGw5.js";
import { R as RefreshIcon } from "./Refresh-DbF-JX5a.js";
import { A as AddIcon } from "./Add-ufYjVZFg.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { V as VisibilityIcon } from "./Visibility-DNsOSjUl.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
function Tickets() {
  const [tickets, setTickets] = reactExports.useState([]);
  const [selectedTicket, setSelectedTicket] = reactExports.useState(null);
  const [replies, setReplies] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = reactExports.useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = reactExports.useState(false);
  const [replyMessage, setReplyMessage] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [tabValue, setTabValue] = reactExports.useState(0);
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [formData, setFormData] = reactExports.useState({
    clientId: "",
    title: "",
    description: "",
    priority: "Medium",
    category: "General"
  });
  reactExports.useEffect(() => {
    fetchTickets();
  }, [statusFilter]);
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all")
        params.status = statusFilter;
      const response = await api.get("/tickets", { params });
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error2) {
      console.error("Error fetching tickets:", error2);
    } finally {
      setLoading(false);
    }
  };
  const fetchTicketDetails = async (id) => {
    try {
      const response = await api.get(`/tickets/${id}`);
      if (response.data.success) {
        setSelectedTicket(response.data.data);
        setReplies(response.data.data.replies || []);
      }
    } catch (error2) {
      console.error("Error fetching ticket details:", error2);
    }
  };
  const handleCreateTicket = async () => {
    try {
      await api.post("/tickets", formData);
      setSuccess("تم إنشاء التذكرة بنجاح");
      setDialogOpen(false);
      fetchTickets();
      setFormData({ clientId: "", title: "", description: "", priority: "Medium", category: "General" });
      setTimeout(() => setSuccess(""), 3e3);
    } catch (err) {
      setError("حدث خطأ");
    }
  };
  const handleAddReply = async () => {
    if (!replyMessage.trim()) {
      setError("الرجاء إدخال الرد");
      return;
    }
    try {
      await api.post(`/tickets/${selectedTicket == null ? void 0 : selectedTicket.id}/reply`, {
        userId: 1,
        // مؤقت
        message: replyMessage,
        isClient: false
      });
      setSuccess("تم إضافة الرد");
      setReplyDialogOpen(false);
      setReplyMessage("");
      fetchTicketDetails(selectedTicket.id);
      setTimeout(() => setSuccess(""), 3e3);
    } catch (err) {
      setError("حدث خطأ");
    }
  };
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/tickets/${id}/status`, { status });
      setSuccess("تم تحديث الحالة");
      fetchTickets();
      if (selectedTicket)
        fetchTicketDetails(selectedTicket.id);
      setTimeout(() => setSuccess(""), 3e3);
    } catch (err) {
      setError("حدث خطأ");
    }
  };
  const handleViewTicket = async (ticket) => {
    setSelectedTicket(ticket);
    await fetchTicketDetails(ticket.id);
    setViewDialogOpen(true);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "warning";
      case "InProgress":
        return "info";
      case "Resolved":
        return "success";
      case "Closed":
        return "default";
      default:
        return "default";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "Open":
        return "مفتوحة";
      case "InProgress":
        return "قيد المعالجة";
      case "Resolved":
        return "تم الحل";
      case "Closed":
        return "مغلقة";
      default:
        return status;
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "success";
      case "Medium":
        return "info";
      case "High":
        return "warning";
      case "Urgent":
        return "error";
      default:
        return "default";
    }
  };
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "تذاكر الدعم" }), jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(RefreshIcon, {}), onClick: fetchTickets, sx: { mr: 1 }, children: "تحديث" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => setDialogOpen(true), children: "تذكرة جديدة" })] })] }), success && jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), jsxRuntimeExports.jsx(Paper, { sx: { p: 2, mb: 2 }, children: jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, alignItems: "center", children: jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [jsxRuntimeExports.jsx(InputLabel, { children: "الحالة" }), jsxRuntimeExports.jsxs(Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), label: "الحالة", children: [jsxRuntimeExports.jsx(MenuItem, { value: "all", children: "الكل" }), jsxRuntimeExports.jsx(MenuItem, { value: "Open", children: "مفتوحة" }), jsxRuntimeExports.jsx(MenuItem, { value: "InProgress", children: "قيد المعالجة" }), jsxRuntimeExports.jsx(MenuItem, { value: "Resolved", children: "تم الحل" }), jsxRuntimeExports.jsx(MenuItem, { value: "Closed", children: "مغلقة" })] })] }) }) }) }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: "#f5f5f5" }, children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "العنوان" }), jsxRuntimeExports.jsx(TableCell, { children: "العميل" }), jsxRuntimeExports.jsx(TableCell, { children: "الأولوية" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" }), jsxRuntimeExports.jsx(TableCell, { children: "التاريخ" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: tickets.map((ticket, idx) => jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: ticket.title }), jsxRuntimeExports.jsx(TableCell, { children: ticket.clientName }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: ticket.priority, color: getPriorityColor(ticket.priority), size: "small" }) }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: getStatusText(ticket.status), color: getStatusColor(ticket.status), size: "small" }) }), jsxRuntimeExports.jsx(TableCell, { children: new Date(ticket.createdAt).toLocaleDateString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleViewTicket(ticket), children: jsxRuntimeExports.jsx(VisibilityIcon, { fontSize: "small" }) }) })] }, ticket.id)) })] }) }), jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "تذكرة جديدة" }), jsxRuntimeExports.jsx(DialogContent, { children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "العنوان", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الوصف", multiline: true, rows: 4, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [jsxRuntimeExports.jsx(InputLabel, { children: "الأولوية" }), jsxRuntimeExports.jsxs(Select, { value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), label: "الأولوية", children: [jsxRuntimeExports.jsx(MenuItem, { value: "Low", children: "منخفضة" }), jsxRuntimeExports.jsx(MenuItem, { value: "Medium", children: "متوسطة" }), jsxRuntimeExports.jsx(MenuItem, { value: "High", children: "عالية" }), jsxRuntimeExports.jsx(MenuItem, { value: "Urgent", children: "طارئة" })] })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [jsxRuntimeExports.jsx(InputLabel, { children: "التصنيف" }), jsxRuntimeExports.jsxs(Select, { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), label: "التصنيف", children: [jsxRuntimeExports.jsx(MenuItem, { value: "Technical", children: "تقني" }), jsxRuntimeExports.jsx(MenuItem, { value: "Billing", children: "مالي" }), jsxRuntimeExports.jsx(MenuItem, { value: "General", children: "عام" })] })] }) })] }) }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleCreateTicket, variant: "contained", children: "إنشاء" })] })] }), jsxRuntimeExports.jsxs(Dialog, { open: viewDialogOpen, onClose: () => setViewDialogOpen(false), maxWidth: "md", fullWidth: true, children: [jsxRuntimeExports.jsxs(DialogTitle, { children: [selectedTicket == null ? void 0 : selectedTicket.title, jsxRuntimeExports.jsxs(Box, { sx: { mt: 1 }, children: [jsxRuntimeExports.jsx(Chip, { label: getStatusText((selectedTicket == null ? void 0 : selectedTicket.status) || ""), color: getStatusColor((selectedTicket == null ? void 0 : selectedTicket.status) || ""), size: "small", sx: { mr: 1 } }), jsxRuntimeExports.jsx(Chip, { label: selectedTicket == null ? void 0 : selectedTicket.priority, color: getPriorityColor((selectedTicket == null ? void 0 : selectedTicket.priority) || ""), size: "small" })] })] }), jsxRuntimeExports.jsxs(DialogContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "الوصف:" }), jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: selectedTicket == null ? void 0 : selectedTicket.description }), jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { mt: 2, mb: 1 }, children: "الردود:" }), replies.map((reply) => jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, mb: 1, bgcolor: reply.isClient ? "#e3f2fd" : "#f5f5f5" }, children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: "bold", children: reply.userName }), jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "textSecondary", children: new Date(reply.createdAt).toLocaleString("ar-EG") })] }), jsxRuntimeExports.jsx(Typography, { variant: "body2", children: reply.message })] }, reply.id)), jsxRuntimeExports.jsxs(Box, { display: "flex", gap: 1, mt: 2, children: [jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", placeholder: "اكتب ردك...", value: replyMessage, onChange: (e) => setReplyMessage(e.target.value) }), jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: handleAddReply, children: "إرسال" })] })] }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(FormControl, { size: "small", sx: { minWidth: 120 }, children: jsxRuntimeExports.jsxs(Select, { value: (selectedTicket == null ? void 0 : selectedTicket.status) || "Open", onChange: (e) => handleUpdateStatus(selectedTicket.id, e.target.value), children: [jsxRuntimeExports.jsx(MenuItem, { value: "Open", children: "مفتوحة" }), jsxRuntimeExports.jsx(MenuItem, { value: "InProgress", children: "قيد المعالجة" }), jsxRuntimeExports.jsx(MenuItem, { value: "Resolved", children: "تم الحل" }), jsxRuntimeExports.jsx(MenuItem, { value: "Closed", children: "مغلقة" })] }) }), jsxRuntimeExports.jsx(Button, { onClick: () => setViewDialogOpen(false), children: "إغلاق" })] })] })] });
}
export {
  Tickets as default
};
//# sourceMappingURL=Tickets-BsZfXLzy.js.map
