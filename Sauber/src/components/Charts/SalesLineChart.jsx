import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  elements: {
    line: { tension: 0.4 },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: { size: 10 },
      },
    },
    y: {
      ticks: {
        font: { size: 10 },
      },
    },
  },
};

const labels = ["09:00 am", "12:00 pm", "03:00 pm", "06:00 pm", "09:00 pm", "12:00 am"];

const data = {
  labels,
  datasets: [
    {
      label: "Sales",
      data: [400, 300, 500, 600, 700, 650],
      borderColor: "#6366F1",
      backgroundColor: "rgba(99, 102, 241, 0.2)",
      fill: true,
    },
  ],
};

export default function SalesLineChart() {
  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl mx-auto">
      <div className="relative h-56 sm:h-64 md:h-80">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
