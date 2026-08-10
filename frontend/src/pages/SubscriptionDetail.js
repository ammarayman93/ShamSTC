import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
export default function SubscriptionDetail() {
    const { id } = useParams(); // استخراج ID من URL
    const [subscription, setSubscription] = useState(null);
    useEffect(() => {
        axios
            .get(`https://localhost:5001/api/subscriptions/${id}`)
            .then((res) => setSubscription(res.data.data))
            .catch((err) => console.error(err));
    }, [id]);
    if (!subscription)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Subscription Details" }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: [_jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "User:" }), " ", subscription.user.username] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Plan:" }), " ", subscription.plan.name] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Start Date:" }), " ", new Date(subscription.startDate).toLocaleDateString()] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "End Date:" }), " ", new Date(subscription.endDate).toLocaleDateString()] }), _jsxs("div", { className: "mb-4", children: [_jsx("strong", { children: "Status:" }), " ", subscription.isActive ? "Active" : "Inactive"] }), _jsx("div", { className: "mt-4", children: _jsx(Link, { to: `/subscriptions/edit/${subscription.id}`, className: "text-blue-500 hover:underline", children: "Edit Subscription" }) })] })] }));
}
