import { r as reactExports, a as api, j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, e as Button, A as Alert, f as Paper, I as IconButton, g as TextField } from "./index-CvPhQGw5.js";
import { R as RefreshIcon } from "./Refresh-DbF-JX5a.js";
import { A as AddIcon } from "./Add-ufYjVZFg.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { E as EditIcon } from "./Edit-D3ZMOIh5.js";
import { D as DeleteIcon } from "./Delete-CGcyhYnn.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
function Plans() {
  const [plans, setPlans] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingPlan, setEditingPlan] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    speed: "",
    price: "",
    durationDays: "30"
  });
  reactExports.useEffect(() => {
    fetchPlans();
  }, []);
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get("/plans");
      if (response.data) {
        setPlans(response.data);
      }
    } catch (error2) {
      console.error("Error fetching plans:", error2);
      setError("فشل في تحميل الباقات");
    } finally {
      setLoading(false);
    }
  };
  const handleOpenDialog = (plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        speed: plan.speed,
        price: plan.price.toString(),
        durationDays: plan.durationDays.toString()
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        speed: "",
        price: "",
        durationDays: "30"
      });
    }
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
    setFormData({
      name: "",
      speed: "",
      price: "",
      durationDays: "30"
    });
    setError("");
  };
  const handleSubmit = async () => {
    var _a, _b;
    if (!formData.name.trim()) {
      setError("اسم الباقة مطلوب");
      return;
    }
    if (!formData.speed.trim()) {
      setError("السرعة مطلوبة");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("السعر يجب أن يكون أكبر من صفر");
      return;
    }
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
      setError("المدة يجب أن تكون أكبر من صفر");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const data = {
        name: formData.name,
        speed: formData.speed,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        isActive: true,
        sortOrder: plans.length + 1
      };
      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, data);
        setSuccess("تم تعديل الباقة بنجاح");
      } else {
        await api.post("/plans", data);
        setSuccess("تم إضافة الباقة بنجاح");
      }
      handleCloseDialog();
      fetchPlans();
      setTimeout(() => setSuccess(""), 3e3);
    } catch (err) {
      setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "حدث خطأ أثناء حفظ الباقة");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id, name) => {
    var _a, _b;
    if (window.confirm(`هل أنت متأكد من حذف الباقة "${name}"؟`)) {
      try {
        await api.delete(`/plans/${id}`);
        setSuccess("تم حذف الباقة بنجاح");
        fetchPlans();
        setTimeout(() => setSuccess(""), 3e3);
      } catch (err) {
        setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "حدث خطأ أثناء الحذف");
        setTimeout(() => setError(""), 3e3);
      }
    }
  };
  if (loading) {
    return jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: jsxRuntimeExports.jsx(CircularProgress, {}) });
  }
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "الباقات والاشتراكات" }), jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(RefreshIcon, {}), onClick: fetchPlans, sx: { mr: 1 }, children: "تحديث" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => handleOpenDialog(), children: "باقة جديدة" })] })] }), success && jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(""), children: success }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(""), children: error }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: "#f5f5f5" }, children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "اسم الباقة" }), jsxRuntimeExports.jsx(TableCell, { children: "السرعة" }), jsxRuntimeExports.jsx(TableCell, { children: "السعر (ل.س)" }), jsxRuntimeExports.jsx(TableCell, { children: "المدة (يوم)" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: plans.map((plan, idx) => jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: plan.name }), jsxRuntimeExports.jsx(TableCell, { children: plan.speed }), jsxRuntimeExports.jsx(TableCell, { children: plan.price.toLocaleString() }), jsxRuntimeExports.jsx(TableCell, { children: plan.durationDays }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: plan.isActive ? "نشطة" : "غير نشطة", color: plan.isActive ? "success" : "default", size: "small" }) }), jsxRuntimeExports.jsxs(TableCell, { children: [jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleOpenDialog(plan), title: "تعديل", children: jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }), jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(plan.id, plan.name), title: "حذف", children: jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" }) })] })] }, plan.id)) })] }) }), jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: editingPlan ? "تعديل باقة" : "إضافة باقة جديدة" }), jsxRuntimeExports.jsx(DialogContent, { children: jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "اسم الباقة", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), margin: "normal", required: true, placeholder: "مثال: 4Mb/s (Damascus) 2025" }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "السرعة", value: formData.speed, onChange: (e) => setFormData({ ...formData, speed: e.target.value }), margin: "normal", required: true, placeholder: "مثال: 4Mb/s" }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "السعر (ل.س)", type: "number", value: formData.price, onChange: (e) => setFormData({ ...formData, price: e.target.value }), margin: "normal", required: true, InputProps: { inputProps: { min: 0 } } }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "المدة (يوم)", type: "number", value: formData.durationDays, onChange: (e) => setFormData({ ...formData, durationDays: e.target.value }), margin: "normal", required: true, InputProps: { inputProps: { min: 1 } } })] }) }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: handleCloseDialog, children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting, children: submitting ? jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : editingPlan ? "تحديث" : "إضافة" })] })] })] });
}
export {
  Plans as default
};
//# sourceMappingURL=Plans-bCRhMwQn.js.map
