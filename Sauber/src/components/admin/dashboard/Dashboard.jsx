import SalesLineChart from "../../Charts/SalesLineChart";
import IncomeDoughnutChart from "../../Charts/IncomeDoughnutChart";
import { CalendarArrowUp } from 'lucide-react';
import { Users } from 'lucide-react';
import RecentSales from "../RecentSales";
import LatestProducts from "../LatestProducts";



const Dashboard = () => {
  return (
    <div className="flex-1 p-6 w-full">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex space-x-2 text-gray-500 flex-wrap gap-2">
          <button className="px-3 py-1 rounded-full text-gray-800">Yesterday</button>
          <button className="px-3 py-1 rounded-full text-white bg-orange-500">Today</button>
          <button className="px-3 py-1 rounded-full text-gray-800">Week</button>
          <button className="px-3 py-1 rounded-full text-gray-800">Month</button>
          <button className="px-3 py-1 rounded-full text-gray-800">Year</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Sales - Spans two columns on larger screens */}
        <div className="lg:col-span-2 bg-white lg:p-6 p-4 rounded-2xl shadow-md flex flex-col lg:h-[500px] m-auto lg:m-0 w-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="lg:text-lg font-semibold text-sm">Daily Sales</h3>
              <p className="text-2xl font-bold mt-1">2,568</p>
              <p className="text-sm text-green-500">↑ 2.1% vs last week</p>
            </div>
            <button className="px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-full">View Report</button>
          </div>
          <SalesLineChart className="flex-1" />
        </div>

        {/* Total Income - Now standalone in top-right */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Income</h3>
          <select className="text-xs border border-gray-200 rounded px-2 py-1">
            <option>Today</option>
            <option>Week</option>
            <option>Month</option>
          </select>
          <IncomeDoughnutChart />
        </div>

        {/* Right Column Stack - Trending Dishes & Total Orders */}
        <div className="flex flex-col space-y-6">
          {/* Trending Dishes */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Total Orders</h3>
              <CalendarArrowUp className="text-white bg-orange-500 rounded-full p-1" />
              
            </div>
              <p className="text-2xl font-bold mt-1">21,375</p>
              <p className="text-sm text-red-500">↓ 2.3%</p>
     
          </div>

          {/* Total Orders - Now under Trending Dishes */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Customers</h3>
              <Users className="text-white bg-green-800 rounded-full p-1" />
              
            </div>
              <p className="text-2xl font-bold mt-1">21,375</p>
              <p className="text-sm text-green-500">+ 2.3%</p>
     
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