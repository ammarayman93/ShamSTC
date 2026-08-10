import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function SubscriptionDetail() {
  const { id } = useParams(); // استخراج ID من URL
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`https://localhost:5001/api/subscriptions/${id}`)
      .then((res) => setSubscription(res.data.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!subscription) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Subscription Details</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <strong>User:</strong> {subscription.user.username}
        </div>
        <div className="mb-4">
          <strong>Plan:</strong> {subscription.plan.name}
        </div>
        <div className="mb-4">
          <strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleDateString()}
        </div>
        <div className="mb-4">
          <strong>End Date:</strong> {new Date(subscription.endDate).toLocaleDateString()}
        </div>
        <div className="mb-4">
          <strong>Status:</strong> {subscription.isActive ? "Active" : "Inactive"}
        </div>

        <div className="mt-4">
          <Link
            to={`/subscriptions/edit/${subscription.id}`}
            className="text-blue-500 hover:underline"
          >
            Edit Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}