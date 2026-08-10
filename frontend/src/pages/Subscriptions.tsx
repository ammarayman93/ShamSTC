import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("https://localhost:5001/api/subscriptions")
      .then((res) => setSubscriptions(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Subscriptions</h2>

      <div className="mb-4">
        <Link
          to="/subscriptions/create"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Subscription
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Plan</th>
              <th className="p-4 text-left">Start Date</th>
              <th className="p-4 text-left">End Date</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub: any) => (
              <tr key={sub.id} className="border-t">
                <td className="p-4">{sub.user.username}</td>
                <td className="p-4">{sub.plan.name}</td>
                <td className="p-4">{new Date(sub.startDate).toLocaleDateString()}</td>
                <td className="p-4">{new Date(sub.endDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <Link
                    to={`/subscriptions/edit/${sub.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}