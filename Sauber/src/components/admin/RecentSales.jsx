import { Clock, CheckCircle } from 'lucide-react';

export default function RecentSales() {
  const salesData = [
    {
      name: "John Doe",
      time: "10:30 AM",
      amount: "$85.50",
      status: "completed"
    },
    {
      name: "Jane Smith",
      time: "10:15 AM",
      amount: "$132.25",
      status: "completed"
    },
    {
      name: "Bob Johnson",
      time: "10:00 AM",
      amount: "$67.80",
      status: "completed"
    },
    {
      name: "Alice Brown",
      time: "9:45 AM",
      amount: "$245.00",
      status: "pending"
    },
    {
      name: "Charlie Wilson",
      time: "9:30 AM",
      amount: "$89.95",
      status: "completed"
    }
  ];

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