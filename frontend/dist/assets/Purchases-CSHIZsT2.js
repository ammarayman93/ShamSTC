import { r as reactExports, a as api, j as jsxRuntimeExports, B as Box, T as Typography, e as Button, A as Alert, f as Paper, g as TextField, I as IconButton, F as FormControl, h as InputLabel, S as Select, i as MenuItem, C as CircularProgress } from "./index-CvPhQGw5.js";
import { R as RefreshIcon } from "./Refresh-DbF-JX5a.js";
import { A as AddIcon } from "./Add-ufYjVZFg.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { D as DeleteIcon } from "./Delete-CGcyhYnn.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
import { I as InputAdornment } from "./InputAdornment-DxPVCxwY.js";
function Purchases() {
  const [purchases, setPurchases] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingPurchase, setEditingPurchase] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [startDate, setStartDate] = reactExports.useState("");
  const [endDate, setEndDate] = reactExports.useState("");
  const [formData, setFormData] = reactExports.useState({
    productId: "",
    quantity: "",
    costPerUnit: "",
    supplier: ""
  });
  reactExports.useEffect(() => {
    fetchPurchases();
    fetchProducts();
  }, []);
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await api.get("/purchases");
      if (response.data) {
        setPurchases(response.data);
      }
    } catch (error2) {
      console.error("Error fetching purchases:", error2);
    } finally {
      setLoading(false);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error2) {
      console.error("Error fetching products:", error2);
    }
  };
  const handleSubmit = async () => {
    var _a, _b;
    setSubmitting(true);
    setError("");
    try {
      const selectedProduct = products.find((p) => p.id === parseInt(formData.productId));
      const quantity = parseInt(formData.quantity);
      const costPerUnit = parseFloat(formData.costPerUnit);
      const total = quantity * costPerUnit;
      const data = {
        productId: parseInt(formData.productId),
        quantity,
        costPerUnit,
        total,
        supplier: formData.supplier,
        date: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (editingPurchase) {
        await api.put(`/purchases/${editingPurchase.id}`, data);
        setSuccess("تم تحديث المشتريات بنجاح");
      } else {
        await api.post("/purchases", data);
        setSuccess("تم إضافة المشتريات بنجاح");
      }
      setDialogOpen(false);
      fetchPurchases();
      fetchProducts();
      setTimeout(() => setSuccess(""), 3e3);
    } catch (err) {
      setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه العملية؟")) {
      try {
        await api.delete(`/purchases/${id}`);
        setSuccess("تم الحذف بنجاح");
        fetchPurchases();
        fetchProducts();
      } catch (error2) {
        setError("حدث خطأ أثناء الحذف");
      }
    }
  };
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const filteredPurchases = purchases.filter((p) => {
    if (startDate && new Date(p.date) < new Date(startDate))
      return false;
    if (endDate && new Date(p.date) > new Date(endDate))
      return false;
    return true;
  });
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "المشتريات" }), jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(RefreshIcon, {}), onClick: fetchPurchases, sx: { mr: 1 }, children: "تحديث" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => {
    setEditingPurchase(null);
    setFormData({ productId: "", quantity: "", costPerUnit: "", supplier: "" });
    setDialogOpen(true);
  }, children: "عملية شراء جديدة" })] })] }), success && jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(""), children: success }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(""), children: error }), jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#1976d2", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "إجمالي المشتريات" }), jsxRuntimeExports.jsxs(Typography, { variant: "h5", children: [totalPurchases.toLocaleString(), " ل.س"] })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#4caf50", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "عدد العمليات" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: purchases.length })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "من تاريخ", type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), InputLabelProps: { shrink: true } }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "إلى تاريخ", type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), InputLabelProps: { shrink: true } }) })] }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: "#f5f5f5" }, children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "المنتج" }), jsxRuntimeExports.jsx(TableCell, { children: "الكمية" }), jsxRuntimeExports.jsx(TableCell, { children: "سعر الوحدة" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجمالي" }), jsxRuntimeExports.jsx(TableCell, { children: "المورد" }), jsxRuntimeExports.jsx(TableCell, { children: "التاريخ" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: filteredPurchases.map((purchase, idx) => jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: purchase.productName }), jsxRuntimeExports.jsx(TableCell, { children: purchase.quantity }), jsxRuntimeExports.jsxs(TableCell, { children: [purchase.costPerUnit.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsxs(TableCell, { children: [purchase.total.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsx(TableCell, { children: purchase.supplier }), jsxRuntimeExports.jsx(TableCell, { children: new Date(purchase.date).toLocaleDateString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(purchase.id), children: jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" }) }) })] }, purchase.id)) })] }) }), jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: editingPurchase ? "تعديل عملية شراء" : "عملية شراء جديدة" }), jsxRuntimeExports.jsx(DialogContent, { children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [jsxRuntimeExports.jsx(InputLabel, { children: "المنتج" }), jsxRuntimeExports.jsx(Select, { value: formData.productId, onChange: (e) => setFormData({ ...formData, productId: e.target.value }), label: "المنتج", children: products.map((p) => jsxRuntimeExports.jsxs(MenuItem, { value: p.id, children: [p.name, " - المخزون: ", p.quantity] }, p.id)) })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الكمية", type: "number", value: formData.quantity, onChange: (e) => setFormData({ ...formData, quantity: e.target.value }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "سعر الوحدة", type: "number", value: formData.costPerUnit, onChange: (e) => setFormData({ ...formData, costPerUnit: e.target.value }), InputProps: { startAdornment: jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: "ل.س" }) } }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "المورد", value: formData.supplier, onChange: (e) => setFormData({ ...formData, supplier: e.target.value }) }) })] }) }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting, children: submitting ? jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : editingPurchase ? "تحديث" : "إضافة" })] })] })] });
}
export {
  Purchases as default
};
//# sourceMappingURL=Purchases-CSHIZsT2.js.map
