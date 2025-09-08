import { Box } from 'lucide-react';

export default function LatestProducts() {
  const productsData = [
    {
      name: "iPhone 13 Case",
      minStock: 10,
      leftInStock: 2
    },
    {
      name: "Wireless Charger",
      minStock: 5,
      leftInStock: 1
    },
    {
      name: "USB Cable",
      minStock: 15,
      leftInStock: 3
    },
    {
      name: "Screen Protector",
      minStock: 20,
      leftInStock: 4
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-[100%] md:min-w-[400px] lg:min-w-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Box className="w-5 h-5 text-black" />
        <h2 className="text-lg font-bold text-black">Latest Products</h2>
      </div>

      {/* Products List */}
      <div className="space-y-6">
        {productsData.map((product, index) => (
          <div key={index} className="flex items-center justify-between">
            {/* Left side - Product details */}
            <div>
              <div className="font-medium text-gray-900 mb-1">{product.name}</div>
              <div className="text-sm text-gray-500">Min stock: {product.minStock}</div>
            </div>

            {/* Right side - Stock remaining */}
            {/* <div className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium">
              {product.leftInStock} left
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}