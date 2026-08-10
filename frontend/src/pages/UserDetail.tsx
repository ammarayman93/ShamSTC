import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

export default function UserDetail() {
  const { id } = useParams(); // استخراج ID من URL
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`https://localhost:5001/api/users/${id}`)
      .then((res) => setUser(res.data.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Details</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <strong>Username:</strong> {user.username}
        </div>
        <div className="mb-4">
          <strong>Full Name:</strong> {user.fullName}
        </div>
        <div className="mb-4">
          <strong>Phone:</strong> {user.phone}
        </div>
        <div className="mb-4">
          <strong>Role:</strong> {user.role}
        </div>

        <div className="mt-4">
          <Link
            to={`/users/edit/${user.id}`}
            className="text-blue-500 hover:underline"
          >
            Edit User
          </Link>
        </div>
      </div>
    </div>
  );
}