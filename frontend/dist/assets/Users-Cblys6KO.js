import { c as createSvgIcon, j as jsxRuntimeExports, r as reactExports, a as api, B as Box, T as Typography, e as Button, A as Alert, f as Paper, g as TextField, I as IconButton, F as FormControl, h as InputLabel, S as Select, i as MenuItem, C as CircularProgress } from "./index-CvPhQGw5.js";
import { A as AddIcon } from "./Add-ufYjVZFg.js";
import { I as InputAdornment } from "./InputAdornment-DxPVCxwY.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { E as EditIcon } from "./Edit-D3ZMOIh5.js";
import { D as DeleteIcon } from "./Delete-CGcyhYnn.js";
import { T as TablePagination } from "./TablePagination-DXfmDxPY.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import "./KeyboardArrowRight-nMvpNNjv.js";
const SearchIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"
}), "Search");
function Users() {
  const [users, setUsers] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [page, setPage] = reactExports.useState(0);
  const [rowsPerPage, setRowsPerPage] = reactExports.useState(10);
  const [search, setSearch] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingUser, setEditingUser] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    email: "",
    role: "Employee"
  });
  reactExports.useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search]);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users", {
        params: { page: page + 1, pageSize: rowsPerPage, search }
      });
      if (response.data.success) {
        setUsers(response.data.data.data);
        setTotal(response.data.data.total);
      }
    } catch (error2) {
      console.error("Error fetching users:", error2);
    } finally {
      setLoading(false);
    }
  };
  const handleOpenDialog = (user) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        fullName: user.fullName,
        phone: user.phone,
        email: user.email || "",
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        fullName: "",
        phone: "",
        email: "",
        role: "Employee"
      });
    }
    setDialogOpen(true);
  };
  const handleSubmit = async () => {
    var _a, _b;
    setSubmitting(true);
    setError("");
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          role: formData.role
        });
        setSuccess("تم تحديث المستخدم بنجاح");
      } else {
        await api.post("/users", formData);
        setSuccess("تم إضافة المستخدم بنجاح");
      }
      setTimeout(() => setSuccess(""), 3e3);
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await api.delete(`/users/${id}`);
        setSuccess("تم حذف المستخدم بنجاح");
        fetchUsers();
      } catch (error2) {
        setError("حدث خطأ أثناء الحذف");
      }
    }
  };
  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "error";
      case "Accountant":
        return "warning";
      case "Employee":
        return "info";
      case "Support":
        return "success";
      default:
        return "default";
    }
  };
  const getRoleName = (role) => {
    switch (role) {
      case "Admin":
        return "مدير";
      case "Accountant":
        return "محاسب";
      case "Employee":
        return "موظف";
      case "Support":
        return "دعم فني";
      default:
        return role;
    }
  };
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "المستخدمين والصلاحيات" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => handleOpenDialog(), children: "مستخدم جديد" })] }), success && jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), jsxRuntimeExports.jsx(Paper, { sx: { p: 2, mb: 2 }, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "بحث باسم المستخدم، الاسم الكامل...", value: search, onChange: (e) => setSearch(e.target.value), InputProps: { startAdornment: jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: jsxRuntimeExports.jsx(SearchIcon, {}) }) } }) }), jsxRuntimeExports.jsxs(TableContainer, { component: Paper, children: [jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: "#f5f5f5" }, children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "اسم المستخدم" }), jsxRuntimeExports.jsx(TableCell, { children: "الاسم الكامل" }), jsxRuntimeExports.jsx(TableCell, { children: "رقم الهاتف" }), jsxRuntimeExports.jsx(TableCell, { children: "الصلاحية" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" }), jsxRuntimeExports.jsx(TableCell, { children: "آخر تسجيل دخول" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: users.map((user, idx) => jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 + page * rowsPerPage }), jsxRuntimeExports.jsx(TableCell, { children: user.username }), jsxRuntimeExports.jsx(TableCell, { children: user.fullName }), jsxRuntimeExports.jsx(TableCell, { children: user.phone }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: getRoleName(user.role), color: getRoleColor(user.role), size: "small" }) }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: user.status === "Active" ? "نشط" : "غير نشط", color: user.status === "Active" ? "success" : "default", size: "small" }) }), jsxRuntimeExports.jsx(TableCell, { children: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "-" }), jsxRuntimeExports.jsxs(TableCell, { children: [jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleOpenDialog(user), children: jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }), jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(user.id), children: jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" }) })] })] }, user.id)) })] }), jsxRuntimeExports.jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: total, rowsPerPage, page, onPageChange: (_, newPage) => setPage(newPage), onRowsPerPageChange: (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  } })] }), jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد" }), jsxRuntimeExports.jsx(DialogContent, { children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "اسم المستخدم", value: formData.username, onChange: (e) => setFormData({ ...formData, username: e.target.value }), disabled: !!editingUser, required: true }) }), !editingUser && jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "كلمة المرور", type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), required: true }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الاسم الكامل", value: formData.fullName, onChange: (e) => setFormData({ ...formData, fullName: e.target.value }), required: true }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "رقم الهاتف", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "البريد الإلكتروني", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [jsxRuntimeExports.jsx(InputLabel, { children: "الصلاحية" }), jsxRuntimeExports.jsxs(Select, { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), label: "الصلاحية", children: [jsxRuntimeExports.jsx(MenuItem, { value: "Admin", children: "مدير (كل الصلاحيات)" }), jsxRuntimeExports.jsx(MenuItem, { value: "Accountant", children: "محاسب (مالية، تقارير، فواتير)" }), jsxRuntimeExports.jsx(MenuItem, { value: "Employee", children: "موظف (عملاء، اشتراكات)" }), jsxRuntimeExports.jsx(MenuItem, { value: "Support", children: "دعم فني (عملاء، تذاكر)" })] })] }) })] }) }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting, children: submitting ? jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : editingUser ? "تحديث" : "إضافة" })] })] })] });
}
export {
  Users as default
};
//# sourceMappingURL=Users-Cblys6KO.js.map
