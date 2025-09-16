import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../cashier/Sidebar'
import MobileMenu from '../admin/MobileMenu'

function CashierLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <div className="lg:w-64 bg-white shadow-lg">
        <Sidebar />
      </div>
      
      {/* Main content on the right */}
      <div className="flex-1 lg:p-6 bg-gray-50 p-4">
        <Outlet /> {/* This renders Dashboard, Services, Users, etc. */}
      </div>
      <MobileMenu />
    </div>
  )
}

export default CashierLayout