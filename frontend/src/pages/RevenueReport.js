import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import axios from "axios";
export default function RevenueReport() {
    const [report, setReport] = useState(null);
    useEffect(() => {
        axios
            .get("https://localhost:5001/api/reports/monthly/2026/4")
            .then((res) => setReport(res.data))
            .catch((err) => console.error(err));
    }, []);
    if (!report)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "p-6", children: [_jsxs("h2", { className: "text-2xl font-bold mb-4", children: ["Revenue Report for ", report.month, "/", report.year] }), _jsxs("div", { children: ["Total Revenue: ", report.revenue] })] }));
}
