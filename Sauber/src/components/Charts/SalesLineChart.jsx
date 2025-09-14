import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

function getHourLabel(hour) {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

export default function SalesLineChart({ data = [] }) {
  // Convert [{hour, total}] to [{hour: label, sales: total}]
  const salesData = data.length
    ? data.map((d) => ({ hour: getHourLabel(d.hour), sales: d.total }))
    : Array.from({ length: 24 }, (_, i) => ({ hour: getHourLabel(i), sales: 0 }));

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl mx-auto">
      <div className="relative h-56 sm:h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={12}
            />
            <YAxis tickFormatter={(value) => `₵${value}`} />
            <Tooltip formatter={(value) => [`₵${value}`, 'Sales']} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#7C3AED"
              fill="#7C3AED"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
