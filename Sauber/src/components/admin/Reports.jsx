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
    const now = new Date();
    let trend = [];
    let start;
    let groupBy = 'day';
    if (filter === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        trend.push({
          name: d.toLocaleDateString(undefined, { weekday: 'short' }),
          key: d.toISOString().slice(0, 10),
          sales: 0,
        });
      }
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0,0,0,0);
      groupBy = 'day';
    } else if (filter === 'weekly') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i * 7);
        const weekNum = getWeekNumber(d);
        trend.push({
          name: `W${weekNum}`,
          key: `${d.getFullYear()}-W${weekNum}`,
          sales: 0,
        });
      }
      start = new Date(now);
      start.setDate(now.getDate() - 7 * 7);
      start.setHours(0,0,0,0);
      groupBy = 'week';
    } else {
      // Monthly: last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trend.push({
          name: d.toLocaleDateString(undefined, { month: 'short' }),
          key: `${d.getFullYear()}-${d.getMonth() + 1}`,
          sales: 0,
        });
      }
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      groupBy = 'month';
    }

    function getWeekNumber(d) {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
      return weekNo;
    }

    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', start),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      let total = 0, daily = 0, weekly = 0, monthly = 0;
      const breakdown = { Silver: 0, Gold: 0, Platin: 0, Others: 0 };
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      // Reset trend sales
      trend = trend.map(t => ({ ...t, sales: 0 }));
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.total === 'number' && data.createdAt && data.createdAt.toDate) {
          const dateObj = data.createdAt.toDate();
          const dateStr = dateObj.toISOString().slice(0, 10);
          // Grouping
          let key = '';
          if (groupBy === 'day') {
            key = dateStr;
          } else if (groupBy === 'week') {
            const weekNum = getWeekNumber(dateObj);
            key = `${dateObj.getFullYear()}-W${weekNum}`;
          } else {
            key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
          }
          const trendItem = trend.find(t => t.key === key);
          if (trendItem) trendItem.sales += data.total;
          // Totals
          total += data.total;
          if (dateStr === todayStr) daily += data.total;
          if (dateObj >= weekAgo) weekly += data.total;
          if (dateObj >= monthStart) monthly += data.total;
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
  }, [filter]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen mb-12 lg-mb-0">
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
