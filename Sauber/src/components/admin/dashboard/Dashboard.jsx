
import SalesLineChart from "../../Charts/SalesLineChart";
import IncomeDoughnutChart from "../../Charts/IncomeDoughnutChart";
import { CalendarArrowUp } from 'lucide-react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecentSales from "../RecentSales";
import LatestProducts from "../LatestProducts";
import { useEffect, useState } from "react";
import { db } from '../../../firebase/config';
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";



const Dashboard = () => {
  const [dailySales, setDailySales] = useState(0);
  const [salesTrend, setSalesTrend] = useState([]); // [{hour, total}]
  const [lastWeekSales, setLastWeekSales] = useState(0);
  // Range can be: 'yesterday', 'today', 'week', 'month', 'year'
  const [range, setRange] = useState('month');
  const [totalIncome, setTotalIncome] = useState(0);

  const [totalOrders, setTotalOrders] = useState(0);
  const [lastWeekOrders, setLastWeekOrders] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [lastWeekCustomers, setLastWeekCustomers] = useState(0);

  useEffect(() => {
    // Helper to get start/end for all ranges
    function getRange(type) {
      const now = new Date();
      if (type === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return { start, end };
      } else if (type === 'yesterday') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        return { start, end };
      } else if (type === 'week') {
        // Start from last Sunday
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0,0,0,0);
        const end = new Date(now);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        return { start, end };
      } else if (type === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
      } else if (type === 'year') {
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
      }
      return { start: now, end: now };
    }

    // Get range for selected tab
    const { start, end } = getRange(range);
    // Get range for last week (for variance)
    let lastStart, lastEnd;
    if (range === 'today') {
      lastStart = new Date(start);
      lastStart.setDate(start.getDate() - 7);
      lastEnd = new Date(end);
      lastEnd.setDate(end.getDate() - 7);
    } else if (range === 'yesterday') {
      lastStart = new Date(start);
      lastStart.setDate(start.getDate() - 7);
      lastEnd = new Date(end);
      lastEnd.setDate(end.getDate() - 7);
    } else if (range === 'week') {
      lastStart = new Date(start);
      lastStart.setDate(start.getDate() - 7);
      lastEnd = new Date(end);
      lastEnd.setDate(end.getDate() - 7);
    } else if (range === 'month') {
      lastStart = new Date(start);
      lastStart.setMonth(start.getMonth() - 1);
      lastEnd = new Date(end);
      lastEnd.setMonth(end.getMonth() - 1);
    } else if (range === 'year') {
      lastStart = new Date(start);
      lastStart.setFullYear(start.getFullYear() - 1);
      lastEnd = new Date(end);
      lastEnd.setFullYear(end.getFullYear() - 1);
    }

    // Total income for selected range
    const qIncome = query(
      collection(db, 'orders'),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end),
      orderBy('createdAt', 'asc')
    );
    const unsubIncome = onSnapshot(qIncome, (snapshot) => {
      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.total === 'number') {
          total += data.total;
        }
      });
      setTotalIncome(total);
    });

    // Current range: sales, orders, new customers
    const qCurrent = query(
      collection(db, 'orders'),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end),
      orderBy('createdAt', 'asc')
    );
    // Previous range: for variance
    const qLast = query(
      collection(db, 'orders'),
      where('createdAt', '>=', lastStart),
      where('createdAt', '<=', lastEnd),
      orderBy('createdAt', 'asc')
    );

    const unsubCurrent = onSnapshot(qCurrent, (snapshot) => {
      let total = 0;
      let orderCount = 0;
      const trend = Array(24).fill(0);
      const customerSet = new Set();
      snapshot.forEach(doc => {
        orderCount++;
        const data = doc.data();
        if (typeof data.total === 'number') {
          total += data.total;
        }
        if (data.customerPhone) customerSet.add(data.customerPhone);
        else if (data.customerName) customerSet.add(data.customerName);
        if (data.createdAt && data.createdAt.toDate) {
          const hour = data.createdAt.toDate().getHours();
          trend[hour] += data.total || 0;
        }
      });
      setDailySales(total);
      setSalesTrend(trend.map((val, hour) => ({ hour, total: val })));
      setTotalOrders(orderCount);
      setNewCustomers(customerSet.size);
    });

    const unsubLast = onSnapshot(qLast, (snapshot) => {
      let total = 0;
      let orderCount = 0;
      const customerSet = new Set();
      snapshot.forEach(doc => {
        orderCount++;
        const data = doc.data();
        if (typeof data.total === 'number') {
          total += data.total;
        }
        if (data.customerPhone) customerSet.add(data.customerPhone);
        else if (data.customerName) customerSet.add(data.customerName);
      });
      setLastWeekSales(total);
      setLastWeekOrders(orderCount);
      setLastWeekCustomers(customerSet.size);
    });

    return () => {
      unsubCurrent();
      unsubLast();
      unsubIncome();
    };
  }, [range]);

  return (
    <div className="flex-1 p-6 w-full">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex space-x-2 text-gray-500 flex-wrap gap-2">
          {['yesterday', 'today', 'week', 'month', 'year'].map(tab => (
            <button
              key={tab}
              className={`px-3 py-1 rounded-full font-semibold ${range === tab ? 'text-white bg-orange-500' : 'text-gray-800'}`}
              onClick={() => setRange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Sales - Spans two columns on larger screens */}
        <div className="lg:col-span-2 bg-white lg:p-6 p-4 rounded-2xl shadow-md flex flex-col lg:h-[500px] m-auto lg:m-0 w-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="lg:text-lg font-semibold text-sm">Daily Sales</h3>
              <p className="text-2xl font-bold mt-1">₵{dailySales.toLocaleString()}</p>
              {/* Variance indicator vs last week */}
              {lastWeekSales > 0 ? (
                (() => {
                  const diff = dailySales - lastWeekSales;
                  const percent = ((diff / lastWeekSales) * 100).toFixed(1);
                  const up = diff >= 0;
                  return (
                    <span className={`text-sm font-semibold flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
                      {up ? '▲' : '▼'} {Math.abs(percent)}% vs last week
                    </span>
                  );
                })()
              ) : (
                <span className="text-sm text-gray-400">No data for last week</span>
              )}
            </div>
            <Link to="/admin/reports" className="text-sm text-gray-500 hover:underline">
              <button className="px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-full cursor-pointer">View Report</button>
            </Link>
          </div>
        
          <SalesLineChart className="flex-1" data={salesTrend} />
        </div>

        {/* Total Income - Now standalone in top-right */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <IncomeDoughnutChart incomeRange={range} />
        </div>

        {/* Right Column Stack - Trending Dishes & Total Orders */}
        <div className="flex flex-col space-y-6">
          {/* Total Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Total Orders</h3>
              <CalendarArrowUp className="text-white bg-orange-500 rounded-full p-1" />
            </div>
            <p className="text-2xl font-bold mt-1">{totalOrders.toLocaleString()}</p>
            {/* Variance indicator vs last week */}
            {lastWeekOrders > 0 ? (
              (() => {
                const diff = totalOrders - lastWeekOrders;
                const percent = ((diff / lastWeekOrders) * 100).toFixed(1);
                const up = diff >= 0;
                return (
                  <span className={`text-sm font-semibold flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
                    {up ? '▲' : '▼'} {Math.abs(percent)}% vs last week
                  </span>
                );
              })()
            ) : (
              <span className="text-sm text-gray-400">No data for last week</span>
            )}
          </div>

          {/* New Customers */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Customers</h3>
              <Users className="text-white bg-green-800 rounded-full p-1" />
            </div>
            <p className="text-2xl font-bold mt-1">{newCustomers.toLocaleString()}</p>
            {/* Variance indicator vs last week */}
            {lastWeekCustomers > 0 ? (
              (() => {
                const diff = newCustomers - lastWeekCustomers;
                const percent = ((diff / lastWeekCustomers) * 100).toFixed(1);
                const up = diff >= 0;
                return (
                  <span className={`text-sm font-semibold flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
                    {up ? '▲' : '▼'} {Math.abs(percent)}% vs last week
                  </span>
                );
              })()
            ) : (
              <span className="text-sm text-gray-400">No data for last week</span>
            )}
          </div>
        </div>

        {/* Recents sales - Spans one column */}
        {/* <div className="bg-white rounded-2xl shadow-md w-full ">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Sales</h3>
          </div> */}
          {/* List items for recent sales would go here */}
          
        {/* </div> */}
        <div className="lg:col-span-2 flex gap-8">
        <RecentSales className="flex-1" />

        </div>
        <div className="lg:col-span-2 flex gap-8">

        <LatestProducts className="flex-1" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;