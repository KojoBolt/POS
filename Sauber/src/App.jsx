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
import CashierSales from "./components/cashier/CashierSales";
import Customers from "./components/cashier/Customers";
import CashierOrders from "./components/cashier/CashierOrders";
import CashierSettings from "./components/cashier/CashierSettings";

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
          <Route path="sales" element={<CashierSales />} />
          <Route path="customers" element={<Customers />} />
          <Route path="orders" element={<CashierOrders />} />
          <Route path="settings" element={<CashierSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<main class="grid h-screen place-items-center bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
          <div class="text-center">
            <p class="text-base font-semibold text-indigo-400">404</p>
            <h1 class="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">Page not found</h1>
            <p class="mt-6 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">Sorry, we couldn’t find the page you’re looking for.</p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
              <a href="/" class="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Go back home</a>
              <a href="#" class="text-sm font-semibold text-white">Contact support <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
</main>} />
      </Routes>
  );
}

export default App;
