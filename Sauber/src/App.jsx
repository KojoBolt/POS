// src/App.jsx
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import useAuthStore from "./store/authStore";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import CashierLayout from "./components/layout/CashierLayout";

// Admin pages
import AdminDashboard from "./components/admin/dashboard/Dashboard";
import Services from "./components/admin/Services";
import Reports from "./components/admin/Reports";
import Users from "./components/admin/Users";
import Inventory from "./components/admin/Inventory";
import Order from "./components/admin/Order";
import AdminSales from "./components/admin/Sales";
import AdminCustomers from "./components/admin/Customers";
import Payment from "./components/admin/Payment";
import Settings from "./components/admin/Settings";
// import EditService from "./components/admin/EditService";

// Cashier pages
import CashierDashboard from "./components/cashier/Dashboard";
import Sales from "./components/cashier/Sales";
import Customers from "./components/cashier/Customers";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

function App() {
  const initAuth = useAuthStore((state) => state.init);

  // initialize Firebase auth listener on app load
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Order />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="payments" element={<Payment />} />
          <Route path="settings" element={<Settings />} />
          {/* <Route path="services/edit/:id" element={<EditService />} /> */}
        </Route>

        {/* Cashier Routes */}
        <Route
          path="/cashier/*"
          element={
            <ProtectedRoute allowedRoles={["cashier"]}>
              <CashierLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CashierDashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="customers" element={<Customers />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
  );
}

export default App;
