import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";
export default function RevenueChart() {
    const [chartData, setChartData] = useState(null);
    useEffect(() => {
        axios
            .get("https://localhost:5001/api/reports/monthly/2026/4")
            .then((res) => {
            const data = {
                labels: ["January", "February", "March", "April"],
                datasets: [
                    {
                        label: "Revenue",
                        data: [res.data.revenue, 5000, 7000, 8000],
                    },
                ],
            };
            setChartData(data);
        })
            .catch((err) => console.error(err));
    }, []);
    return (_jsxs("div", { children: [_jsx("h2", { children: "Revenue Chart" }), chartData && _jsx(Line, { data: chartData })] }));
}
