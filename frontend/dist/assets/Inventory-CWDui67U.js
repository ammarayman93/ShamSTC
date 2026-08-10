import { r as reactExports, a as api, j as jsxRuntimeExports, B as Box, T as Typography, e as Button, f as Paper, I as IconButton, g as TextField } from "./index-CvPhQGw5.js";
import { A as AddIcon } from "./Add-ufYjVZFg.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { C as Chip } from "./Chip-trihV-h6.js";
import { E as EditIcon } from "./Edit-D3ZMOIh5.js";
import { D as DeleteIcon } from "./Delete-CGcyhYnn.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
function Inventory() {
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingProduct, setEditingProduct] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({ name: "", costPrice: "", sellPrice: "", quantity: "" });
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  reactExports.useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products");
      if (response.data)
        setProducts(response.data);
    } catch (error2) {
      console.error(error2);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        costPrice: parseFloat(formData.costPrice),
        sellPrice: parseFloat(formData.sellPrice),
        quantity: parseInt(formData.quantity)
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        setSuccess("تم تحديث المنتج");
      } else {
        await api.post("/products", data);
        setSuccess("تم إضافة المنتج");
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      setError("حدث خطأ");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد؟")) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0);
  const lowStockProducts = products.filter((p) => p.quantity <= 5);
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "المخزون" }), jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => {
    setEditingProduct(null);
    setFormData({ name: "", costPrice: "", sellPrice: "", quantity: "" });
    setDialogOpen(true);
  }, children: "منتج جديد" })] }), jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#1976d2", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "إجمالي قيمة المخزون" }), jsxRuntimeExports.jsxs(Typography, { variant: "h5", children: [totalValue.toLocaleString(), " ل.س"] })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: lowStockProducts.length > 0 ? "#f44336" : "#4caf50", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "منتجات منخفضة المخزون" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: lowStockProducts.length })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center", bgcolor: "#ff9800", color: "white" }, children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "إجمالي المنتجات" }), jsxRuntimeExports.jsx(Typography, { variant: "h5", children: products.length })] }) })] }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: "#f5f5f5" }, children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "#" }), jsxRuntimeExports.jsx(TableCell, { children: "المنتج" }), jsxRuntimeExports.jsx(TableCell, { children: "سعر الشراء" }), jsxRuntimeExports.jsx(TableCell, { children: "سعر البيع" }), jsxRuntimeExports.jsx(TableCell, { children: "الكمية" }), jsxRuntimeExports.jsx(TableCell, { children: "الحالة" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: products.map((p, idx) => jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: idx + 1 }), jsxRuntimeExports.jsx(TableCell, { children: p.name }), jsxRuntimeExports.jsxs(TableCell, { children: [p.costPrice.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsxs(TableCell, { children: [p.sellPrice.toLocaleString(), " ل.س"] }), jsxRuntimeExports.jsx(TableCell, { children: p.quantity }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(Chip, { label: p.quantity <= 5 ? "منخفض" : "متوفر", color: p.quantity <= 5 ? "error" : "success", size: "small" }) }), jsxRuntimeExports.jsxs(TableCell, { children: [jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => {
    setEditingProduct(p);
    setFormData({ name: p.name, costPrice: p.costPrice.toString(), sellPrice: p.sellPrice.toString(), quantity: p.quantity.toString() });
    setDialogOpen(true);
  }, children: jsxRuntimeExports.jsx(EditIcon, {}) }), jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(p.id), children: jsxRuntimeExports.jsx(DeleteIcon, {}) })] })] }, p.id)) })] }) }), jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: editingProduct ? "تعديل منتج" : "منتج جديد" }), jsxRuntimeExports.jsxs(DialogContent, { children: [jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "اسم المنتج", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), margin: "normal" }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "سعر الشراء", type: "number", value: formData.costPrice, onChange: (e) => setFormData({ ...formData, costPrice: e.target.value }), margin: "normal" }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "سعر البيع", type: "number", value: formData.sellPrice, onChange: (e) => setFormData({ ...formData, sellPrice: e.target.value }), margin: "normal" }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الكمية", type: "number", value: formData.quantity, onChange: (e) => setFormData({ ...formData, quantity: e.target.value }), margin: "normal" })] }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, variant: "contained", children: "حفظ" })] })] })] });
}
export {
  Inventory as default
};
//# sourceMappingURL=Inventory-CWDui67U.js.map
