import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    useEffect(() => {
        axios
            .get("https://localhost:5001/api/subscriptions")
            .then((res) => setSubscriptions(res.data.data))
            .catch((err) => console.error(err));
    }, []);
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Subscriptions" }), _jsx("div", { className: "mb-4", children: _jsx(Link, { to: "/subscriptions/create", className: "bg-blue-500 text-white px-4 py-2 rounded", children: "Create Subscription" }) }), _jsx("div", { className: "overflow-x-auto bg-white rounded-lg shadow-lg", children: _jsxs("table", { className: "min-w-full table-auto", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("th", { className: "p-4 text-left", children: "User" }), _jsx("th", { className: "p-4 text-left", children: "Plan" }), _jsx("th", { className: "p-4 text-left", children: "Start Date" }), _jsx("th", { className: "p-4 text-left", children: "End Date" }), _jsx("th", { className: "p-4 text-left", children: "Actions" })] }) }), _jsx("tbody", { children: subscriptions.map((sub) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-4", children: sub.user.username }), _jsx("td", { className: "p-4", children: sub.plan.name }), _jsx("td", { className: "p-4", children: new Date(sub.startDate).toLocaleDateString() }), _jsx("td", { className: "p-4", children: new Date(sub.endDate).toLocaleDateString() }), _jsx("td", { className: "p-4", children: _jsx(Link, { to: `/subscriptions/edit/${sub.id}`, className: "text-blue-500 hover:underline", children: "Edit" }) })] }, sub.id))) })] }) })] }));
}
