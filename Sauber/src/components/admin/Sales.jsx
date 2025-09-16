
import React, { useState, useEffect } from "react";
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";


export default function Sales() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for completed (paid) sales in real time
    const q = query(
      collection(db, 'orders'),
      where('paymentStatus', '==', 'Paid'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const salesData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Each service in the order is a separate sale row
        if (Array.isArray(data.services)) {
          data.services.forEach(service => {
            salesData.push({
              id: doc.id + '-' + (service.id || service.name),
              customer: data.customerName || 'N/A',
              service: service.name || 'N/A',
              amount: service.price || 0,
              date: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : '',
              status: data.paymentStatus,
            });
          });
        }
      });
      setSales(salesData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer.toLowerCase().includes(search.toLowerCase()) ||
      sale.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-gray-500">View and manage all car service sales</p>
        </div>
        <input
          type="text"
          placeholder="Search by customer or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm text-sm w-full sm:w-auto"
        />
      </div>

      {/* Mobile Card Layout */}
      <div className="flex flex-col gap-4 md:hidden mb-12 lg-mb-0">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading sales...</div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No sales found.</div>
        ) : (
          filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border-l-4 border-gray-800s">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{sale.date}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  sale.status === "Paid"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}>
                  {sale.status}
                </span>
              </div>
              <div className="font-semibold text-base">{sale.customer}</div>
              <div className="text-sm text-gray-500">{sale.service}</div>
              <div className="font-bold text-green-700 text-lg">₵{sale.amount}</div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="bg-white rounded-lg shadow overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead className="bg-[#000] text-white text-sm">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Loading sales...</td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No sales found.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-green-100">
                  <td className="px-6 py-4">{sale.date}</td>
                  <td className="px-6 py-4 font-semibold">{sale.customer}</td>
                  <td className="px-6 py-4">{sale.service}</td>
                  <td className="px-6 py-4 font-semibold">₵{sale.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        sale.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
