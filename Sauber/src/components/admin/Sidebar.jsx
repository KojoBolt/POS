import { Home, ShoppingBag, Users, Settings, FileText, Box, CreditCard, BadgeCent, LogOut, Link   } from "lucide-react";
import { NavLink, useNavigate, Link as RouterLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import useAuthStore from "../../store/authStore";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };
  return (
    <div className="fixed left-0 top-0 w-64 bg-white shadow-md h-screen p-4 lg:flex flex-col hidden overflow-y-auto z-10 border-r border-gray-300">
      <h1 className="text-2xl font-bold text-indigo-600 mb-6">Sauber</h1>
      <nav className="flex-1 mb-6 text-md">
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold bg-[#F4F7FF] py-3 px-2 rounded' : 'text-gray-600'}`
              }
            >
              <Home size={18}/> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold bg-[#F4F7FF] py-3 px-2 rounded' : 'text-gray-600'}`
              }
            >
              <ShoppingBag size={18}/> Order
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/sales"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold bg-[#F4F7FF] py-3 px-2 rounded' : 'text-gray-600'}`
              }
            >
              <BadgeCent className="w-5 h-5" /> Sales
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/customers"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold bg-[#F4F7FF] py-3 px-2 rounded' : 'text-gray-600'}`
              }
            >
              <Users size={18}/> Customer
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/services"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold bg-[#F4F7FF] py-3 px-2 rounded' : 'text-gray-600'}`
              }
            >
              <Box size={18}/> Services
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold bg-[#F4F7FF] py-3 px-2 rounded' : 'text-gray-600'}`
              }
            >
              <FileText size={18}/> Reports
            </NavLink>
          </li>
          {/*
          <li>
            <NavLink
              to="/admin/payments"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600'}`
              }
            >
              <CreditCard size={18}/> Payment
            </NavLink>
          </li>
          */}
          <li>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 hover:text-indigo-600 cursor-pointer ${isActive ? 'text-indigo-600 font-semibold bg-[#F4F7FF] py-3 px-2 rounded' : 'text-gray-600'}`
              }
            >
              <Settings size={18}/> Settings
            </NavLink>
          </li>
          <li
            className="flex items-center gap-3 text-white hover:text-white cursor-pointer bg-gray-900 p-2 rounded text-sm justify-center lg:justify-start mt-10 text-center"
            onClick={handleLogout}
            role="button"
            tabIndex={0}
          >
            <LogOut size={18} /> Logout
          </li>
        </ul>
      </nav>
      <div className="mt-auto pt-4 shadow-md border border-gray-300 rounded-lg p-6 text-center space-y-2">
        <img src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg" alt="profile" className="w-12 h-12 rounded-full mx-auto" />
        <h3 className="mt-2 text-black font-bold ">{user?.displayName || user?.email?.split('@')[0] || 'User'}</h3>
        <p className="text-sm text-gray-400">{role || 'Role'}</p>
        <RouterLink to={`/admin/settings`} className="text-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded px-2 py-1">Edit Profile</RouterLink>
      </div>
    </div>
  );
};

export default Sidebar;