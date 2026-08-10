import { c as createSvgIcon, j as jsxRuntimeExports, r as reactExports, d as useNavigate, a as api, B as Box, T as Typography, e as Button, f as Paper, g as TextField, I as IconButton, F as FormControl, h as InputLabel, S as Select, i as MenuItem } from "./index-CvPhQGw5.js";
import { R as RefreshIcon } from "./Refresh-DbF-JX5a.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { T as TablePagination } from "./TablePagination-DXfmDxPY.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
import "./KeyboardArrowRight-nMvpNNjv.js";
const MoreVertIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"
}), "MoreVert");
function Clients() {
  const [clients, setClients] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [page, setPage] = reactExports.useState(0);
  const [rowsPerPage, setRowsPerPage] = reactExports.useState(10);
  const [search, setSearch] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const [selectedClient, setSelectedClient] = reactExports.useState(null);
  const [plans, setPlans] = reactExports.useState([]);
  const [selectedPlanId, setSelectedPlanId] = reactExports.useState("");
  const [editDialogOpen, setEditDialogOpen] = reactExports.useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = reactExports.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = reactExports.useState(false);
  const [editFormData, setEditFormData] = reactExports.useState({ fullName: "", phone: "", email: "", address: "" });
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    fetchClients();
    fetchPlans();
  }, [page, rowsPerPage, search]);
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clients", { params: { page: page + 1, pageSize: rowsPerPage, search } });
      if (response.data.success) {
        setClients(response.data.data.data || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error2) {
      console.error("Error fetching clients:", error2);
    } finally {
      setLoading(false);
    }
  };
  const fetchPlans = async () => {
    try {
      const response = await api.get("/plans");
      const plansData = response.data.data || response.data || [];
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (error2) {
      console.error("Error fetching plans:", error2);
      setPlans([]);
    }
  };
  const handleMenuOpen = (event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };
  const handleActivateSubscription = async () => {
    var _a, _b;
    setSubmitting(true);
    try {
      await api.post("/subscriptions", { userId: selectedClient == null ? void 0 : selectedClient.id, planId: selectedPlanId });
      setSuccess("تم تفعيل الاشتراك");
      setActivateDialogOpen(false);
      fetchClients();
    } catch (err) {
      setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };
  return jsxRuntimeExports.jsxs(Box, {
    children: [
      jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "العملاء" }), jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Button, { onClick: fetchClients, startIcon: jsxRuntimeExports.jsx(RefreshIcon, {}), children: "تحديث" }), jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: () => navigate("/clients/new"), children: "عميل جديد" })] })] }),
      jsxRuntimeExports.jsx(Paper, { sx: { p: 2, mb: 2 }, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, placeholder: "بحث...", value: search, onChange: (e) => setSearch(e.target.value) }) }),
      jsxRuntimeExports.jsxs(TableContainer, { component: Paper, children: [jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "اسم المستخدم" }), jsxRuntimeExports.jsx(TableCell, { children: "الاسم" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" }), jsxRuntimeExports.jsx(TableCell, { align: "center", children: "إجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: Array.isArray(clients) && clients.map((client, idx) => jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: client.username }), jsxRuntimeExports.jsx(TableCell, { children: client.fullName }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: client.status }) }), jsxRuntimeExports.jsx(TableCell, { align: "center", children: jsxRuntimeExports.jsx(IconButton, { onClick: (e) => handleMenuOpen(e, client), children: jsxRuntimeExports.jsx(MoreVertIcon, {}) }) })] }, client.id)) })] }), jsxRuntimeExports.jsx(TablePagination, { count: total, page, onPageChange: (_, newPage) => setPage(newPage), rowsPerPage, onRowsPerPageChange: (e) => setRowsPerPage(parseInt(e.target.value)) })] }),
      /* dialogs... */
      jsxRuntimeExports.jsxs(Dialog, { open: activateDialogOpen, onClose: () => setActivateDialogOpen(false), fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "تفعيل اشتراك" }), jsxRuntimeExports.jsxs(DialogContent, { children: [jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, sx: { mt: 2 }, children: [jsxRuntimeExports.jsx(InputLabel, { children: "اختر الباقة" }), jsxRuntimeExports.jsx(Select, { value: selectedPlanId, onChange: (e) => setSelectedPlanId(e.target.value), children: Array.isArray(plans) && plans.map((plan) => jsxRuntimeExports.jsx(MenuItem, { value: plan.id, children: `${plan.name} - ${plan.price} ل.س` }, plan.id)) })] })] }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setActivateDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleActivateSubscription, children: "تفعيل" })] })] })
    ]
  });
}
export {
  Clients as default
};
//# sourceMappingURL=Clients-B_LjcmXc.js.map
