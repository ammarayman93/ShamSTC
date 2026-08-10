import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditSubscription() {
  const { id } = useParams(); // استخراج ID من URL
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState<any>({
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

  const handleChange = (e: any) => {
    setSubscription({ ...subscription, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await axios.put(
      `https://localhost:5001/api/subscriptions/${id}`,
      subscription
    );

    if (res.status === 200) {
      navigate("/subscriptions"); // العودة لصفحة الاشتراكات بعد التعديل
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Subscription</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="userId"
          value={subscription.userId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="User ID"
        />
        <input
          type="number"
          name="planId"
          value={subscription.planId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Plan ID"
        />
        <input
          type="number"
          name="days"
          value={subscription.days}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Duration in Days"
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Update Subscription
        </button>
      </form>
    </div>
  );
}