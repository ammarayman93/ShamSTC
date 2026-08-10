import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
export default function EditSubscription() {
    const { id } = useParams(); // استخراج ID من URL
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState({
        userId: "",
        planId: "",
        days: 30,
    });
    useEffect(() => {
        axios
            .get(`https://localhost:5001/api/subscriptions/${id}`)
            .then((res) => setSubscription(res.data.data))
            .catch((err) => console.error(err));
    }, [id]);
    const handleChange = (e) => {
        setSubscription({ ...subscription, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.put(`https://localhost:5001/api/subscriptions/${id}`, subscription);
        if (res.status === 200) {
            navigate("/subscriptions"); // العودة لصفحة الاشتراكات بعد التعديل
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Edit Subscription" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { type: "number", name: "userId", value: subscription.userId, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "User ID" }), _jsx("input", { type: "number", name: "planId", value: subscription.planId, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Plan ID" }), _jsx("input", { type: "number", name: "days", value: subscription.days, onChange: handleChange, className: "w-full p-2 border rounded", placeholder: "Duration in Days" }), _jsx("button", { className: "w-full bg-blue-500 text-white p-2 rounded", children: "Update Subscription" })] })] }));
}
