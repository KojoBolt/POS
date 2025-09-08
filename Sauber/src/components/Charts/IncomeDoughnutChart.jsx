import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

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
  labels: ["Silver", "Gold", "Platinum"],
  datasets: [
    {
      label: "Income",
      data: [40, 32, 28],
      backgroundColor: ["#FACC15", "#22C55E", "#6366F1"], // Adjusted colors for visual similarity
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

export default function IncomeDoughnutChart() {
  const chartData = {
    labels: ["Silver", "Gold", "Platinum"],
    datasets: [
      {
        label: "Income",
        data: [40, 32, 28],
        backgroundColor: ["#facc15", "#22c55e", "#6366f1"],
      },
    ],
  };

  // Responsive text plugin
  const centerTextPlugin = {
    id: "centerTextPlugin",
    afterDraw(chart) {
      const {
        ctx,
        chartArea: { left, right, top, bottom, width, height },
      } = chart;
      ctx.save();

      const total = chart.data.datasets[0].data.reduce(
        (sum, value) => sum + value,
        0
      );

      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      // Responsive font size
      const fontSize = Math.min(width / 10, 36);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(`$${total}`, centerX, centerY);

      ctx.restore();
    },
  };

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
      {/* Chart */}
      <div className="relative h-64 sm:h-72 md:h-80">
        <Doughnut
          data={chartData}
          options={options}
          plugins={[centerTextPlugin]}
        />
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.labels.map((label, index) => (
          <div key={index} className="flex items-center space-x-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: chartData.datasets[0].backgroundColor[index],
              }}
            ></span>
            <span className="text-gray-600 text-sm sm:text-base">{label}</span>
            <span className="font-semibold text-gray-800 text-sm sm:text-base">
              {chartData.datasets[0].data[index]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
