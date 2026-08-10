import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    phone: "",
    role: "Client",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await axios.post(
      "https://localhost:5001/api/users",
      form
    );

    if (res.status === 200) {
      navigate("/users"); // العودة لصفحة المستخدمين بعد الإضافة
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create New User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Username"
        />
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Full Name"
        />
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Phone"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Admin">Admin</option>
          <option value="Employee">Employee</option>
          <option value="Client">Client</option>
        </select>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Password"
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Create User
        </button>
      </form>
    </div>
  );
}