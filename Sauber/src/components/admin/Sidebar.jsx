import { Home, ShoppingBag, Users, Settings, FileText, Box, CreditCard, BadgeCent  } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 w-64 bg-white shadow-md h-screen p-4 lg:flex flex-col hidden overflow-y-auto z-10">
      <h1 className="text-2xl font-bold text-indigo-600 mb-6">Sauber</h1>
      <nav className="flex-1 mb-6 text-md">
        <ul className="space-y-4">
          <li className="flex items-center gap-3 text-indigo-600 font-semibold">
            <Home size={18}/> <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer">
            <ShoppingBag size={18}/> <Link to="/admin/orders">Order</Link>
          </li>
          <li className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer">
            <BadgeCent className="w-5 h-5 text-gray-600" /> <Link to="/admin/sales">Sales</Link>
          </li>
          <li className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer">
            <Users size={18}/> <Link to="/admin/customers">Customer</Link>
          </li>
          <li className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer">
            <Box size={18}/> <Link to="/admin/services">Services</Link>
          </li>
          <li className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer">
            <FileText size={18}/> <Link to="/admin/reports">Reports</Link>
          </li>
          <li className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer">
            <CreditCard size={18}/> <Link to="/admin/payments">Payment</Link>
          </li>
          <li className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer">
            <Settings size={18}/> <Link to="/admin/settings">Settings</Link>
          </li>
          <li className="flex items-center gap-3 text-white hover:text-white cursor-pointer bg-red-500 p-2 rounded text-sm justify-center lg:justify-start mt-10 text-center">
            Logout 
          </li>
        </ul>
      </nav>
      <div className="mt-auto pt-4 shadow-md shadow-black/10 border border-gray-200 rounded-lg p-6 text-center space-y-2">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFcyssMbcvEkMiCDu8zrO9VuN-Yy1aW1vycA&s" alt="profile" className="w-12 h-12 rounded-full mx-auto" />
        <h3 className="mt-2 text-black font-bold ">David Dadzie</h3>
        <p className="text-sm text-gray-400">admin</p>
        <a href="#" className="text-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded px-2 py-1">Edit Profile</a>
      </div>
    </div>
  );
};

export default Sidebar;