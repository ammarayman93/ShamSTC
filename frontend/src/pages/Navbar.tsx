import { useAuth } from "../context/AuthContext"; // نقطتين فقط للخروج من pages
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">ISP Dashboard</h1>
      
      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          Welcome, <span className="font-semibold">{user?.fullName || user?.username}</span>
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}