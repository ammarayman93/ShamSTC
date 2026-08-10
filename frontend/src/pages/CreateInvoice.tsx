import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subscriptionId: "",
    total: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await axios.post(
      "https://localhost:5001/api/invoices",
      form
    );

    if (res.status === 200) {
      navigate("/invoices"); // العودة لصفحة الفواتير بعد الإضافة
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create New Invoice</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="subscriptionId"
          value={form.subscriptionId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Subscription ID"
        />
        <input
          type="number"
          name="total"
          value={form.total}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Total Amount"
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Create Invoice
        </button>
      </form>
    </div>
  );
}