import React, { useState } from 'react';

// Example services - replace with your real data or fetch from backend
const SERVICES = [
  { id: 1, name: 'Oil Change', price: 50 },
  { id: 2, name: 'Tire Rotation', price: 30 },
  { id: 3, name: 'Brake Inspection', price: 40 },
  { id: 4, name: 'Car Wash', price: 20 },
  { id: 5, name: 'Air Filter Replacement', price: 25 },
  { id: 6, name: 'Battery Check', price: 15 },
];

function Order() {
  const [customer, setCustomer] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [note, setNote] = useState('');
  // Add missing state for modal and custom item
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discount = 0; // You can add discount logic here
  const total = subtotal - discount;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend or Firestore
    alert(`Order placed for ${customer || 'Unknown Customer'}!`);
    setCustomer('');
    setSelectedServices([]);
    setNote('');
  };

  // Add handler for adding custom item
  const handleAddCustomItem = () => {
    if (!customItemName.trim() || !customItemPrice || isNaN(customItemPrice)) return;
    setSelectedServices((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: customItemName,
        price: parseFloat(customItemPrice),
        custom: true,
      },
    ]);
    setShowAddItemModal(false);
    setCustomItemName('');
    setCustomItemPrice('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
          <p className="text-gray-600">Select services and customer information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border-gray-100 p-6">
              <div className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Enter customer name"
                  />
                </div>

                {/* Services Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Services
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedServices.some((s) => s.id === service.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.some((s) => s.id === service.id)}
                            onChange={() => handleServiceToggle(service)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-900">{service.name}</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">${service.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
                    rows={3}
                    placeholder="Add any special instructions..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-gray-300 p-6 sticky top-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  Service Bay No. {Math.floor(Math.random() * 50) + 1}
                </span>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Customer</p>
                <p className="font-medium text-gray-900">
                  {customer || 'Enter customer name'}
                </p>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Items</h4>
                {selectedServices.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">
                    No services selected yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">1</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                            <p className="text-xs text-gray-500">Service</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${service.price}</p>
                          <button
                            onClick={() => handleServiceToggle(service)}
                            className="text-red-500 hover:text-red-700 text-xs mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note Display */}
              {note && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Order Note</p>
                  <p className="text-sm text-gray-900">{note}</p>
                </div>
              )}

              {/* Pricing */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-medium text-gray-900">${subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-gray-900">-${discount}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span className="text-gray-900">Total Payment</span>
                  <span className="text-gray-900">${total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={!customer || selectedServices.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => {
                      setCustomer('');
                      setSelectedServices([]);
                      setNote('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                    onClick={() => setShowAddItemModal(true)}
                  >
                    Add Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Item</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="e.g., Custom Repair, Motor Oil, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setCustomItemName('');
                    setCustomItemPrice('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomItem}
                  disabled={!customItemName.trim() || !customItemPrice || isNaN(customItemPrice)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Order;