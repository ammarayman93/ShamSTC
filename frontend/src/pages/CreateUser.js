import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function CreateUser() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        fullName: "",
        phone: "",
        role: "Client",
        password: "",
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("https://localhost:5001/api/users", form);
        if (res.status === 200) {
            navigate("/users"); // العودة لصفحة المستخدمين بعد الإضافة
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Create New User" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { type: "text", name: "username", value: form.username, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Username" }), _jsx("input", { type: "text", name: "fullName", value: form.fullName, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Full Name" }), _jsx("input", { type: "text", name: "phone", value: form.phone, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Phone" }), _jsxs("select", { name: "role", value: form.role, onChange: handleChange, className: "w-full p-2 border rounded", children: [_jsx("option", { value: "Admin", children: "Admin" }), _jsx("option", { value: "Employee", children: "Employee" }), _jsx("option", { value: "Client", children: "Client" })] }), _jsx("input", { type: "password", name: "password", value: form.password, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Password" }), _jsx("button", { className: "w-full bg-blue-500 text-white p-2 rounded", children: "Create User" })] })] }));
}
