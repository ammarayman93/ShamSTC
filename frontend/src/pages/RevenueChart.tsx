import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS } from "chart.js";

export default function RevenueChart() {
  const [chartData, setChartData] = useState<any>(null);

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

  return (
    <div>
      <h2>Revenue Chart</h2>
      {chartData && <Line data={chartData} />}
    </div>
  );
}