import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../context/AuthContext"; // نقطتين فقط للخروج من pages
import { useNavigate } from "react-router-dom";
export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    return (_jsxs("div", { className: "bg-white shadow-md p-4 flex justify-between items-center", children: [_jsx("h1", { className: "text-xl font-bold text-gray-800", children: "ISP Dashboard" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-gray-600", children: ["Welcome, ", _jsx("span", { className: "font-semibold", children: user?.fullName || user?.username })] }), _jsx("button", { onClick: handleLogout, className: "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition", children: "Logout" })] })] }));
}
