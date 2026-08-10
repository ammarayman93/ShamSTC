import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function CreateSubscription() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        userId: "",
        planId: "",
        days: 30,
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("https://localhost:5001/api/subscriptions", form);
        if (res.status === 200) {
            navigate("/subscriptions"); // العودة لصفحة الاشتراكات بعد الإضافة
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Create New Subscription" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { type: "number", name: "userId", value: form.userId, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "User ID" }), _jsx("input", { type: "number", name: "planId", value: form.planId, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Plan ID" }), _jsx("input", { type: "number", name: "days", value: form.days, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Duration in Days" }), _jsx("button", { className: "w-full bg-blue-500 text-white p-2 rounded", children: "Create Subscription" })] })] }));
}
