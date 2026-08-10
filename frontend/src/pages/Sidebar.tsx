import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white p-4 min-h-screen">
      <h2 className="text-xl font-bold mb-6">ISP System</h2>
      
      <nav className="space-y-2">
        <Link to="/dashboard" className="block hover:bg-gray-700 p-2 rounded transition">
          Dashboard
        </Link>
        
        <Link to="/users" className="block hover:bg-gray-700 p-2 rounded transition">
          Users
        </Link>
        
        <Link to="/subscriptions" className="block hover:bg-gray-700 p-2 rounded transition">
          Subscriptions
        </Link>
        
        <Link to="/payments" className="block hover:bg-gray-700 p-2 rounded transition">
          Payments
        </Link>
        
        <Link to="/invoices" className="block hover:bg-gray-700 p-2 rounded transition">
          Invoices
        </Link>
      </nav>
    </div>
  );
}