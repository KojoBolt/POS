
import { Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function RecentSales() {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    // Fetch the 10 most recent paid orders
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const customerMap = new Map();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.services)) {
          let total = 0;
          data.services.forEach(service => {
            total += service.price || 0;
          });
          const name = data.customerName || 'N/A';
          const key = name + (data.customerPhone || '');
          // If customer already exists, accumulate amount and keep latest time/status
          if (customerMap.has(key)) {
            const prev = customerMap.get(key);
            customerMap.set(key, {
              ...prev,
              amount: prev.amount + total,
              // Use the latest time/status if this order is newer
              time: (data.createdAt && data.createdAt.toDate && (!prev.time || data.createdAt.toDate() > prev.rawDate))
                ? data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : prev.time,
              rawDate: (data.createdAt && data.createdAt.toDate && (!prev.time || data.createdAt.toDate() > prev.rawDate))
                ? data.createdAt.toDate()
                : prev.rawDate,
              status: data.paymentStatus === 'Paid' ? 'completed' : 'pending',
            });
          } else {
            customerMap.set(key, {
              name,
              time: data.createdAt && data.createdAt.toDate ?
                data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              rawDate: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : null,
              amount: total,
              status: data.paymentStatus === 'Paid' ? 'completed' : 'pending',
            });
          }
        }
      });
      // Sort by latest time
      const grouped = Array.from(customerMap.values())
        .sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0))
        .slice(0, 5)
        .map(({ rawDate, ...rest }) => ({ ...rest, amount: `₵${rest.amount.toLocaleString()}` }));
      setSalesData(grouped);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-[100%] md:min-w-[400px] lg:min-w-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-black" />
        <h2 className="text-lg font-bold text-black">Recent Sales</h2>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {salesData.map((sale, index) => (
          <div key={index} className="flex items-center justify-between">
            {/* Left side - Icon and details */}
            <div className="flex items-center gap-3">
              {sale.status === "completed" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <div className="font-medium text-gray-900">{sale.name}</div>
                <div className="text-sm text-gray-500">{sale.time}</div>
              </div>
            </div>

            {/* Right side - Amount and status */}
            <div className="text-right">
              <div className="font-medium text-gray-900">{sale.amount}</div>
              <div className={`text-sm ${
                sale.status === "completed" ? "text-green-600" : "text-yellow-600"
              }`}>
                {sale.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}