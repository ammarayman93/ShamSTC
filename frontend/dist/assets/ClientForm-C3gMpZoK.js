import { d as useNavigate, r as reactExports, a as api, j as jsxRuntimeExports, B as Box, T as Typography, f as Paper, A as Alert, g as TextField, i as MenuItem, e as Button, C as CircularProgress } from "./index-CvPhQGw5.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
function ClientForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = reactExports.useState(false);
  const [plans, setPlans] = reactExports.useState([]);
  const [error, setError] = reactExports.useState("");
  const [successDialog, setSuccessDialog] = reactExports.useState(false);
  const [newClient, setNewClient] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    nationalId: "",
    fullName: "",
    phone: "",
    address: "",
    planId: 0,
    paymentMethod: "Cash"
  });
  reactExports.useEffect(() => {
    fetchPlans();
  }, []);
  const fetchPlans = async () => {
    try {
      const response = await api.get("/plans");
      if (response.data) {
        setPlans(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, planId: response.data[0].id }));
        }
      }
    } catch (error2) {
      console.error("Error fetching plans:", error2);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/clients", formData);
      if (response.data.success) {
        setNewClient(response.data.data.client);
        setSuccessDialog(true);
      }
    } catch (err) {
      setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };
  const handleCloseDialog = () => {
    setSuccessDialog(false);
    navigate("/clients");
  };
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "إضافة عميل جديد" }), jsxRuntimeExports.jsxs(Paper, { sx: { p: 3 }, children: [error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }), jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الرقم الوطني", name: "nationalId", value: formData.nationalId, onChange: handleChange, required: true, helperText: "سيتم استخدام الرقم الوطني لإنشاء البريد الإلكتروني وكلمة المرور" }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الاسم الكامل", name: "fullName", value: formData.fullName, onChange: handleChange, required: true }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "رقم الهاتف", name: "phone", value: formData.phone, onChange: handleChange, required: true }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, select: true, label: "الباقة", name: "planId", value: formData.planId, onChange: handleChange, required: true, children: plans.map((plan) => jsxRuntimeExports.jsxs(MenuItem, { value: plan.id, children: [plan.name, " - ", plan.price.toLocaleString(), " ل.س"] }, plan.id)) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsxs(TextField, { fullWidth: true, select: true, label: "طريقة الدفع", name: "paymentMethod", value: formData.paymentMethod, onChange: handleChange, children: [jsxRuntimeExports.jsx(MenuItem, { value: "Cash", children: "كاش" }), jsxRuntimeExports.jsx(MenuItem, { value: "Bank", children: "تحويل بنكي" }), jsxRuntimeExports.jsx(MenuItem, { value: "Card", children: "بطاقة ائتمان" })] }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "العنوان", name: "address", value: formData.address, onChange: handleChange, multiline: true, rows: 2 }) })] }), jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, children: [jsxRuntimeExports.jsx(Button, { variant: "outlined", onClick: () => navigate("/clients"), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { type: "submit", variant: "contained", disabled: loading, children: loading ? jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : "إضافة عميل" })] })] })] }), jsxRuntimeExports.jsxs(Dialog, { open: successDialog, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "✅ تم إنشاء العميل بنجاح" }), jsxRuntimeExports.jsxs(DialogContent, { children: [jsxRuntimeExports.jsx(Typography, { variant: "body2", gutterBottom: true, children: "يرجى حفظ هذه البيانات لأنها لن تظهر مرة أخرى:" }), jsxRuntimeExports.jsxs(Paper, { variant: "outlined", sx: { p: 2, mt: 2, bgcolor: "#f5f5f5" }, children: [jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "اسم المستخدم:" }), " ", newClient == null ? void 0 : newClient.username] }), jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "كلمة المرور:" }), " ", jsxRuntimeExports.jsx("span", { style: { color: "red", fontSize: "20px" }, children: newClient == null ? void 0 : newClient.password })] }), jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "البريد الإلكتروني:" }), " ", newClient == null ? void 0 : newClient.email] }), jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "الاسم الكامل:" }), " ", newClient == null ? void 0 : newClient.fullName] }), jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "رقم الهاتف:" }), " ", newClient == null ? void 0 : newClient.phone] }), jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "الرقم الوطني:" }), " ", newClient == null ? void 0 : newClient.nationalId] }), jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "عنوان MAC:" }), " ", newClient == null ? void 0 : newClient.macAddress] }), jsxRuntimeExports.jsxs(Typography, { children: [jsxRuntimeExports.jsx("strong", { children: "عنوان IP:" }), " ", newClient == null ? void 0 : newClient.ipAddress] })] })] }), jsxRuntimeExports.jsx(DialogActions, { children: jsxRuntimeExports.jsx(Button, { onClick: handleCloseDialog, variant: "contained", children: "حسناً" }) })] })] });
}
export {
  ClientForm as default
};
//# sourceMappingURL=ClientForm-C3gMpZoK.js.map
