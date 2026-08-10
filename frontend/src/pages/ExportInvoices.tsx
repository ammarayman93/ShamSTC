import { useState, useEffect } from "react";
import axios from "axios";
import * as Papa from "papaparse";

export default function ExportInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("https://localhost:5001/api/invoices")
      .then((res) => setInvoices(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const exportToCSV = () => {
    const csv = Papa.unparse(invoices);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "invoices.csv";
    link.click();
  };

  return (
    <div>
      <button onClick={exportToCSV} className="btn btn-primary">
        Export to CSV
      </button>
    </div>
  );
}