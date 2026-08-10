import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
export default function EditUser() {
    const { id } = useParams(); // استخراج ID من URL
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        fullName: "",
        role: "",
        phone: "",
    });
    useEffect(() => {
        axios
            .get(`https://localhost:5001/api/users/${id}`)
            .then((res) => setUser(res.data.data))
            .catch((err) => console.error(err));
    }, [id]);
    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .put(`https://localhost:5001/api/users/${id}`, user)
            .then((res) => {
            navigate("/users"); // العودة لصفحة المستخدمين بعد التحديث
        })
            .catch((err) => console.error(err));
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Edit User" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { type: "text", name: "username", value: user.username, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Username" }), _jsx("input", { type: "text", name: "fullName", value: user.fullName, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Full Name" }), _jsx("input", { type: "text", name: "phone", value: user.phone, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Phone" }), _jsxs("select", { name: "role", value: user.role, onChange: handleChange, className: "w-full p-2 border rounded", children: [_jsx("option", { value: "Admin", children: "Admin" }), _jsx("option", { value: "Employee", children: "Employee" }), _jsx("option", { value: "Client", children: "Client" })] }), _jsx("button", { className: "w-full bg-blue-500 text-white p-2 rounded", children: "Update User" })] })] }));
}
