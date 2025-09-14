import { useState, useEffect } from "react";
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Reports() {

  const [filter, setFilter] = useState("monthly");
  const [salesTrend, setSalesTrend] = useState([]);
  const [salesBreakdown, setSalesBreakdown] = useState([]);
  const [totals, setTotals] = useState({ total: 0, daily: 0, weekly: 0, monthly: 0 });

  useEffect(() => {
    // Sales Trend (last 7 days)
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        date: d.toISOString().slice(0, 10),
        sales: 0,
      });
    }
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0,0,0,0);
    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', start),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const trend = days.map(d => ({ ...d }));
      let total = 0, daily = 0, weekly = 0, monthly = 0;
      // Service breakdown: Silver, Gold, Platin, Others
      const breakdown = { Silver: 0, Gold: 0, Platin: 0, Others: 0 };
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.total === 'number' && data.createdAt && data.createdAt.toDate) {
          const dateStr = data.createdAt.toDate().toISOString().slice(0, 10);
          // Trend
          const trendDay = trend.find(d => d.date === dateStr);
          if (trendDay) trendDay.sales += data.total;
          // Totals
          total += data.total;
          if (dateStr === todayStr) daily += data.total;
          if (data.createdAt.toDate() >= weekAgo) weekly += data.total;
          if (data.createdAt.toDate() >= monthStart) monthly += data.total;
          // Breakdown by service name
          if (Array.isArray(data.services)) {
            data.services.forEach(service => {
              const name = (service.name || '').toLowerCase();
              if (name.includes('silver')) breakdown.Silver += service.price || 0;
              else if (name.includes('gold')) breakdown.Gold += service.price || 0;
              else if (name.includes('platin')) breakdown.Platin += service.price || 0;
              else breakdown.Others += service.price || 0;
            });
          }
        }
      });
      setSalesTrend(trend);
      setTotals({ total, daily, weekly, monthly });
      setSalesBreakdown([
        { name: 'Silver', value: breakdown.Silver },
        { name: 'Gold', value: breakdown.Gold },
        { name: 'Platin', value: breakdown.Platin },
        { name: 'Others', value: breakdown.Others },
      ]);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sales Reports</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Total Sales</p>
          <h2 className="text-2xl font-bold">₵{totals.total.toLocaleString()}</h2>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Daily Sales</p>
          <h2 className="text-2xl font-bold">₵{totals.daily.toLocaleString()}</h2>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Weekly Sales</p>
          <h2 className="text-2xl font-bold">₵{totals.weekly.toLocaleString()}</h2>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Monthly Sales</p>
          <h2 className="text-2xl font-bold">₵{totals.monthly.toLocaleString()}</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Sales Trend</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#604BE8] focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#604BE8"
                fill="#604BE8"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Breakdown */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Sales Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#604BE8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
