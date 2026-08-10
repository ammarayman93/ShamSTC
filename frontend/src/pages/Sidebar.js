import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function Sidebar() {
    return (_jsxs("div", { className: "w-64 bg-gray-900 text-white p-4 min-h-screen", children: [_jsx("h2", { className: "text-xl font-bold mb-6", children: "ISP System" }), _jsxs("nav", { className: "space-y-2", children: [_jsx(Link, { to: "/dashboard", className: "block hover:bg-gray-700 p-2 rounded transition", children: "Dashboard" }), _jsx(Link, { to: "/users", className: "block hover:bg-gray-700 p-2 rounded transition", children: "Users" }), _jsx(Link, { to: "/subscriptions", className: "block hover:bg-gray-700 p-2 rounded transition", children: "Subscriptions" }), _jsx(Link, { to: "/payments", className: "block hover:bg-gray-700 p-2 rounded transition", children: "Payments" }), _jsx(Link, { to: "/invoices", className: "block hover:bg-gray-700 p-2 rounded transition", children: "Invoices" })] })] }));
}
