import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
export default function UserDetail() {
    const { id } = useParams(); // استخراج ID من URL
    const [user, setUser] = useState(null);
    useEffect(() => {
        axios
            .get(`https://localhost:5001/api/users/${id}`)
            .then((res) => setUser(res.data.data))
            .catch((err) => console.error(err));
    }, [id]);
    if (!user)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "User Details" }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: [_jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Username:" }), " ", user.username] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Full Name:" }), " ", user.fullName] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Phone:" }), " ", user.phone] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Role:" }), " ", user.role] }), _jsx("div", { className: "mt-4", children: _jsx(Link, { to: `/users/edit/${user.id}`, className: "text-blue-500 hover:underline", children: "Edit User" }) })] })] }));
}
