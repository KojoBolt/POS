import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

ChartJS.register(ArcElement, Tooltip, Legend);

// Define your plugin here
const centerTextPlugin = {
  id: 'centerTextPlugin',
  afterDraw(chart) {
    const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart;
    ctx.save();

    // Get the total of the data
    const total = chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);

    // Calculate the center of the chart
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    // Set font and color for the value
    ctx.font = 'bold 36px sans-serif'; // Adjust font size and style as needed
    ctx.fillStyle = '#000000'; // Black color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the total value inside the doughnut
    ctx.fillText(`$${total}`, centerX, centerY);
    
    ctx.restore();
  }
};

const data = {
  labels: ["Silver", "Gold", "Platin"],
  datasets: [
    {
      label: "Income",
      data: [40, 32, 28],
      backgroundColor: ["#FACC15", "#D99100", "#6366F1"], 
      borderWidth: 2,
    },
  ],
};

const options = {
  responsive: true,
  cutout: "70%", // Increase cutout for more space
  plugins: {
    legend: {
      display: false, // Hide the default Chart.js legend
    },
  },
};

// Accept totalIncome and incomeRange as props

export default function IncomeDoughnutChart({ incomeRange: propIncomeRange = 'month', onRangeChange }) {
  const [serviceTotals, setServiceTotals] = useState({ Gold: 0, Silver: 0, Others: 0 });
  const [incomeRange, setIncomeRange] = useState(propIncomeRange);

  useEffect(() => {
    // Helper to get start/end for week/month
    function getRange(type) {
      const now = new Date();
      if (type === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return { start, end };
      } else if (type === 'week') {
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
  }
  return { start: now, end: now };
}

    const { start, end } = getRange(incomeRange);
    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      let gold = 0, silver = 0, others = 0;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (Array.isArray(data.services)) {
          data.services.forEach(service => {
            const name = (service.name || '').toLowerCase();
            if (name.includes('gold')) gold += service.price || 0;
            else if (name.includes('silver')) silver += service.price || 0;
            else others += service.price || 0;
          });
        }
      });
      setServiceTotals({ Gold: gold, Silver: silver, Others: others });
    });
    return () => unsub();
  }, [incomeRange]);

  // Notify parent if onRangeChange is provided
  useEffect(() => {
    if (onRangeChange) onRangeChange(incomeRange);
  }, [incomeRange, onRangeChange]);

  const total = serviceTotals.Gold + serviceTotals.Silver + serviceTotals.Others;
  let chartData;
  if (total === 0) {
    chartData = {
      labels: ["No Data"],
      datasets: [
        {
          label: 'Income',
          data: [1],
          backgroundColor: ["#e5e7eb"], 
        },
      ],
    };
  } else {
    chartData = {
      labels: ["Gold", "Silver", "Others"],
      datasets: [
        {
          label: 'Income',
          data: [serviceTotals.Gold, serviceTotals.Silver, serviceTotals.Others],
          backgroundColor: ["#D99100", "#06923E", "#3338A0"],
        },
      ],
    };
  }

  // Responsive text plugin (not used, center value is rendered in JSX below)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
      {/* Range Dropdown */}
      <div className="flex justify-end mb-2 gap-1 items-center">
      <h3 className="text-md font-semibold">Total Income</h3>
        
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={incomeRange}
          onChange={e => setIncomeRange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      {/* Chart */}
      <div className="relative h-64 sm:h-72 md:h-80">
        <Doughnut
          data={chartData}
          options={options}
        />
        {/* Centered total income over the doughnut hole */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900">₵{total.toLocaleString()}</span>
          <span className="text-xs text-gray-500 font-medium mt-1">Total</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.labels[0] === "No Data" ? (
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[0] }}></span>
            <span>No data for this range</span>
          </div>
        ) : (
          chartData.labels.map((label, index) => {
            const value = chartData.datasets[0].data[index];
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center space-x-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: chartData.datasets[0].backgroundColor[index],
                  }}
                ></span>
                <span className="text-gray-600 text-sm sm:text-base">{label}</span>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">
                  {percent}%
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
