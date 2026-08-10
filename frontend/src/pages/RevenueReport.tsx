import { useEffect, useState } from "react";
import axios from "axios";

export default function RevenueReport() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    axios
      .get("https://localhost:5001/api/reports/monthly/2026/4")
      .then((res) => setReport(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!report) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Revenue Report for {report.month}/{report.year}</h2>
      <div>Total Revenue: {report.revenue}</div>
    </div>
  );
}