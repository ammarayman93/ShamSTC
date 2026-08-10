import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [amount, setAmount] = useState(0);
    const [userId, setUserId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("https://localhost:5001/api/payments", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPayments(response.data.data);
            }
            catch (err) {
                setError("Failed to load payments.");
            }
            finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);
    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("https://localhost:5001/api/payments", { userId, amount }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPayments([...payments, response.data.data]);
            setAmount(0);
            setUserId(0);
            setError(null);
        }
        catch (err) {
            setError("Failed to create payment.");
        }
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Payments" }), error && _jsx("div", { className: "text-red-500 mb-4", children: error }), loading ? (_jsx("div", { children: "Loading..." })) : (_jsx("div", { children: _jsxs("table", { className: "min-w-full border-collapse table-auto", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "px-4 py-2", children: "ID" }), _jsx("th", { className: "px-4 py-2", children: "Amount" }), _jsx("th", { className: "px-4 py-2", children: "Date" }), _jsx("th", { className: "px-4 py-2", children: "User ID" })] }) }), _jsx("tbody", { children: payments.map((payment) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "px-4 py-2", children: payment.id }), _jsx("td", { className: "px-4 py-2", children: payment.amount }), _jsx("td", { className: "px-4 py-2", children: payment.date }), _jsx("td", { className: "px-4 py-2", children: payment.userId })] }, payment.id))) })] }) })), _jsxs("form", { onSubmit: handlePayment, children: [_jsx("input", { type: "number", placeholder: "User ID", value: userId, onChange: (e) => setUserId(Number(e.target.value)), required: true }), _jsx("input", { type: "number", placeholder: "Amount", value: amount, onChange: (e) => setAmount(Number(e.target.value)), required: true }), _jsx("button", { type: "submit", children: "Add Payment" })] })] }));
}
