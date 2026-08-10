import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditUser() {
  const { id } = useParams(); // استخراج ID من URL
  const navigate = useNavigate();

  const [user, setUser] = useState<any>({
    username: "",
    fullName: "",
    role: "",
    phone: "",
  });

  useEffect(() => {
    axios
      .get(`https://localhost:5001/api/users/${id}`)
      .then((res) => setUser(res.data.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    axios
      .put(`https://localhost:5001/api/users/${id}`, user)
      .then((res) => {
        navigate("/users"); // العودة لصفحة المستخدمين بعد التحديث
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          value={user.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Username"
        />
        <input
          type="text"
          name="fullName"
          value={user.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Full Name"
        />
        <input
          type="text"
          name="phone"
          value={user.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Phone"
        />
        <select
          name="role"
          value={user.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Admin">Admin</option>
          <option value="Employee">Employee</option>
          <option value="Client">Client</option>
        </select>

        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Update User
        </button>
      </form>
    </div>
  );
}