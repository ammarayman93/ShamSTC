import { r as reactExports, a as api, j as jsxRuntimeExports, B as Box, T as Typography, e as Button, A as Alert, f as Paper, g as TextField, I as IconButton, F as FormControl, h as InputLabel, S as Select, i as MenuItem, C as CircularProgress } from "./index-CvPhQGw5.js";
import { R as RefreshIcon } from "./Refresh-DbF-JX5a.js";
import { A as AddIcon } from "./Add-ufYjVZFg.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { D as DeleteIcon } from "./Delete-CGcyhYnn.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
function Sales() {
  const [sales, setSales] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [startDate, setStartDate] = reactExports.useState("");
  const [endDate, setEndDate] = reactExports.useState("");
  const [formData, setFormData] = reactExports.useState({
    productId: "",
    quantity: "",
    customer: ""
  });
  reactExports.useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get("/sales");
      if (response.data) {
        setSales(response.data);
      }
    } catch (error2) {
      console.error("Error fetching sales:", error2);
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
      if (!selectedProduct) {
        setError("المنتج غير موجود");
        setSubmitting(false);
        return;
      }
      const quantity = parseInt(formData.quantity);
      if (quantity > selectedProduct.quantity) {
        setError(`الكمية المطلوبة (${quantity}) أكبر من المتوفر (${selectedProduct.quantity})`);
        setSubmitting(false);
        return;
      }
      const total = quantity * selectedProduct.sellPrice;
      const data = {
        productId: parseInt(formData.productId),
        quantity,
        total,
        customer: formData.customer,
        date: (/* @__PURE__ */ new Date()).toISOString()
      };
      await api.post("/sales", data);
      setSuccess("تم إضافة عملية البيع بنجاح");
      setDialogOpen(false);
      fetchSales();
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
        await api.delete(`/sales/${id}`);
        setSuccess("تم الحذف بنجاح");
        fetchSales();
        fetchProducts();
      } catch (error2) {
        setError("حدث خطأ أثناء الحذف");
      }
    }
  };
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const filteredSales = sales.filter((s) => {
    if (startDate && new Date(s.date) < new Date(startDate))
      return false;
    if (endDate && new Date(s.date) > new Date(endDate))
      return false;
    return true;
  });
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "المبيعات" }), jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(RefreshIcon, {}), onClick: fetchSales, sx: { mr: 1 }, children: "تحديث" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => {
    setFormData({ productId: "", quantity: "", customer: "" });
    setDialogOpen(true);
  }, children: "عملية بيع جديدة" })] })] }), success && jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#4caf50", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "إجمالي المبيعات" }), jsxRuntimeExports.jsxs(Typography, { variant: "h5", children: [totalSales.toLocaleString(), " ل.س"] })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#2196f3", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "عدد العمليات" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: sales.length })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "من تاريخ", type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), InputLabelProps: { shrink: true } }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "إلى تاريخ", type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), InputLabelProps: { shrink: true } }) })] }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: "#f5f5f5" }, children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "المنتج" }), jsxRuntimeExports.jsx(TableCell, { children: "الكمية" }), jsxRuntimeExports.jsx(TableCell, { children: "سعر البيع" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجمالي" }), jsxRuntimeExports.jsx(TableCell, { children: "العميل" }), jsxRuntimeExports.jsx(TableCell, { children: "التاريخ" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: filteredSales.map((sale, idx) => jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: sale.productName }), jsxRuntimeExports.jsx(TableCell, { children: sale.quantity }), jsxRuntimeExports.jsxs(TableCell, { children: [(sale.total / sale.quantity).toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsxs(TableCell, { children: [sale.total.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsx(TableCell, { children: sale.customer }), jsxRuntimeExports.jsx(TableCell, { children: new Date(sale.date).toLocaleDateString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(sale.id), children: jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" }) }) })] }, sale.id)) })] }) }), jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "عملية بيع جديدة" }), jsxRuntimeExports.jsx(DialogContent, { children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [jsxRuntimeExports.jsx(InputLabel, { children: "المنتج" }), jsxRuntimeExports.jsx(Select, { value: formData.productId, onChange: (e) => setFormData({ ...formData, productId: e.target.value }), label: "المنتج", children: products.map((p) => jsxRuntimeExports.jsxs(MenuItem, { value: p.id, children: [p.name, " - السعر: ", p.sellPrice.toLocaleString(), " ل.س - المتوفر: ", p.quantity] }, p.id)) })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الكمية", type: "number", value: formData.quantity, onChange: (e) => setFormData({ ...formData, quantity: e.target.value }) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "العميل", value: formData.customer, onChange: (e) => setFormData({ ...formData, customer: e.target.value }) }) })] }) }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, variant: "contained", color: "success", disabled: submitting, children: submitting ? jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : "تأكيد البيع" })] })] })] });
}
export {
  Sales as default
};
//# sourceMappingURL=Sales-C9wJBZwA.js.map
