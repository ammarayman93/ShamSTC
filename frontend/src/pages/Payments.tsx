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
      } catch (err) {
        setError("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:5001/api/payments",
        { userId, amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPayments([...payments, response.data.data]);
      setAmount(0);
      setUserId(0);
      setError(null);
    } catch (err) {
      setError("Failed to create payment.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="px-4 py-2">{payment.id}</td>
                  <td className="px-4 py-2">{payment.amount}</td>
                  <td className="px-4 py-2">{payment.date}</td>
                  <td className="px-4 py-2">{payment.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handlePayment}>
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
        <button type="submit">Add Payment</button>
      </form>
    </div>
  );
}