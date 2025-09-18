import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import Receipt from './Receipt';
import { db } from '../../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

function Order() {
  // Pagination state for ongoing orders
  const [ongoingPage, setOngoingPage] = useState(1);
  const ongoingPageSize = 5;
  const { user, role } = useAuthStore();
  const [printOrder, setPrintOrder] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  // State for services and orders
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState('');
  // Vehicle Info state
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [note, setNote] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tab state: "order" or "ongoing"
  const [activeTab, setActiveTab] = useState("order");
  // Payment success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const printRef = useRef();

  // Customer suggestion state
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  // Fetch all customers for suggestions
  useEffect(() => {
    const fetchCustomers = async () => {
      const snapshot = await getDocs(collection(db, "customers"));
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCustomers(customers);
    };
    fetchCustomers();
  }, []);

  // Suggestion logic
  useEffect(() => {
    if (customer.trim().length === 0) {
      setCustomerSuggestions([]);
      return;
    }
    const search = customer.trim().toLowerCase();
    setCustomerSuggestions(
      allCustomers
        .filter(c => c.name && c.name.toLowerCase().includes(search))
        .slice(0, 5)
    );
  }, [customer, allCustomers]);

  // Fetch active services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      const q = query(collection(db, 'services'), where('status', '==', 'Active'));
      const snapshot = await getDocs(q);
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingServices(false);
    };
    fetchServices();
  }, []);

  // Fetch all orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingOrders(false);
    };
    fetchOrders();
  }, []);

  // Service selection logic
  const handleServiceToggle = (service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  // Add custom item logic
  const handleAddCustomItem = () => {
    if (!customItemName.trim() || !customItemPrice || isNaN(customItemPrice)) return;
    setSelectedServices((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: customItemName,
        price: parseFloat(customItemPrice),
        custom: true,
      },
    ]);
    setShowAddItemModal(false);
    setCustomItemName('');
    setCustomItemPrice('');
  };

  // Calculate totals
  const subtotal = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const discount = 0;
  const total = subtotal - discount;

  // Place order (add to Firestore)
  // Store the last created order for printing
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
  if (!customer.trim() || selectedServices.length === 0) return;
  // Validate vehicle info (optional: require some fields)
    setIsPaying(true);
    try {
      const orderData = {
        customerName: customer,
        // Vehicle Info
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehiclePlate,
        services: selectedServices.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          imageUrl: s.imageUrl || '',
        })),
        total,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        createdAt: serverTimestamp(),
        operatorName: (user?.displayName && user.displayName !== '') ? user.displayName : (user?.email ? user.email.split('@')[0] : 'N/A'),
        operatorRole: role || 'N/A',
      };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      const newOrder = { id: docRef.id, ...orderData, createdAt: new Date() };
      setOrders((prev) => [newOrder, ...prev]);
  setCustomer('');
  setSelectedServices([]);
  setNote('');
  setVehicleMake('');
  setVehicleModel('');
  setVehicleYear('');
  setVehiclePlate('');
      setLastCreatedOrder(newOrder); // Save for printing
      setShowSuccess(true);
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  // Mark order as paid
  const handleMarkPaid = async (orderId) => {
    await updateDoc(doc(db, 'orders', orderId), { paymentStatus: 'Paid' });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: 'Paid' } : o
      )
    );
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    await deleteDoc(doc(db, 'orders', orderId));
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "order"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border border-blue-600"
            }`}
            onClick={() => setActiveTab("order")}
          >
            Order
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "ongoing"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border border-blue-600"
            }`}
            onClick={() => setActiveTab("ongoing")}
          >
            Ongoing Orders
          </button>
        </div>

        {/* Order Form Tab */}
        {activeTab === "order" && (
          <div>
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
                    {/* Vehicle Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Make</label>
                        <input
                          type="text"
                          value={vehicleMake}
                          onChange={e => setVehicleMake(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="e.g. Toyota"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={e => setVehicleModel(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="e.g. Corolla"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <input
                          type="text"
                          value={vehicleYear}
                          onChange={e => setVehicleYear(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="e.g. 2020"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                        <input
                          type="text"
                          value={vehiclePlate}
                          onChange={e => setVehiclePlate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="e.g. GR-1234-21"
                        />
                      </div>
                    </div>

                    {/* Services Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Services
                      </label>
                      {loadingServices ? (
                        <div className="text-gray-500">Loading services...</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {services.map((service) => (
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
                                {service.imageUrl && (
                                  <img
                                    src={service.imageUrl}
                                    alt={service.name}
                                    className="w-10 h-10 object-cover rounded-lg border"
                                  />
                                )}
                                <span className="font-medium text-gray-900">{service.name}</span>
                              </div>
                              <span className="text-lg font-semibold text-gray-900">₵{service.price}</span>
                            </label>
                          ))}
                        </div>
                      )}
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
              <div className="lg:col-span-1 mb-12 lg:mb-0">
                <div className="bg-white rounded-2xl shadow-lg border-gray-300 p-6 sticky top-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                    <span className="bg-blue-100 text-blue-800 text-[12px] lg:text-xs font-medium px-2.5 py-1 rounded-full text-center">
                      Service Bay No. {Math.floor(Math.random() * 50) + 1}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Customer</p>
                    <p className="font-medium text-gray-900">
                      {customer || 'Enter customer name'}
                    </p>
                  </div>
                  {/* Vehicle Info */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vehicle Info</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-600">Make: </span>
                        <span className="font-medium text-gray-900">{vehicleMake || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Model: </span>
                        <span className="font-medium text-gray-900">{vehicleModel || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Year: </span>
                        <span className="font-medium text-gray-900">{vehicleYear || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Plate: </span>
                        <span className="font-medium text-gray-900">{vehiclePlate || '-'}</span>
                      </div>
                    </div>
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
                              <p className="font-semibold text-gray-900">₵{service.price}</p>
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
                      <span className="font-medium text-gray-900">₵{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-gray-900">-₵{discount}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span className="text-gray-900">Total Payment</span>
                      <span className="text-gray-900">₵{total}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSubmit}
                      disabled={!customer || selectedServices.length === 0 || isPaying}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isPaying ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Pay'
                      )}
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

                  {/* Payment Success Modal restored */}
                  {showSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center" ref={printRef}>
                        <svg className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
                        <p className="mb-6 text-gray-700 text-center">Thank you for your payment. Your order has been placed successfully.</p>
                        <button
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 mb-2"
                          onClick={() => {
                            setShowSuccess(false);
                            setPrintOrder(lastCreatedOrder);
                          }}
                        >
                          Print Receipt
                        </button>
                        <button
                          className="text-gray-500 mt-2 hover:underline"
                          onClick={() => setShowSuccess(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add Item Modal */}
            {showAddItemModal && (
              <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-100 border shadow-md rounded-2xl p-6 w-full max-w-md">
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
                        Price (₵)
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
        )}

        {/* Ongoing Orders Tab */}
        {activeTab === "ongoing" && (
          <div className="bg-white rounded-2xl shadow-lg border-gray-300 p-6 mb-12 lg:mb-0">
            <h2 className="text-xl font-bold mb-4">Ongoing Orders</h2>
            {loadingOrders ? (
              <div className="text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-500">No orders yet.</div>
            ) : (
              <>
                {/* Table for md+ screens */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Services</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice((ongoingPage-1)*ongoingPageSize, ongoingPage*ongoingPageSize).map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium">{order.customerName}</div>
                          </td>
                          <td className="px-4 py-3">
                            <ul className="space-y-1">
                              {Array.isArray(order.services) &&
                                order.services.map((s, idx) => (
                                  <li key={s.id || idx} className="flex items-center gap-2">
                                    {s.imageUrl && (
                                      <img
                                        src={s.imageUrl}
                                        alt={s.name}
                                        className="w-8 h-8 object-cover rounded border"
                                      />
                                    )}
                                    <span className="text-sm">{s.name}</span>
                                    <span className="text-xs text-gray-500">₵{s.price}</span>
                                  </li>
                                ))}
                            </ul>
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-700">
                            ₵{order.total}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.paymentStatus === 'Paid'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            {order.paymentStatus !== 'Paid' && (
                              <button
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                onClick={() => handleMarkPaid(order.id)}
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              Delete
                            </button>
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                              onClick={() => setPrintOrder(order)}
                            >
                              Print Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Card layout for mobile screens */}
                <div className="space-y-4 md:hidden">
                  {orders.slice((ongoingPage-1)*ongoingPageSize, ongoingPage*ongoingPageSize).map((order) => (
                    <div key={order.id} className="rounded-xl border border-gray-200 shadow p-4 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-base text-gray-900">{order.customerName}</div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{order.status}</span>
                      </div>
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-1">Services</div>
                        <ul className="space-y-1">
                          {Array.isArray(order.services) && order.services.map((s, idx) => (
                            <li key={s.id || idx} className="flex items-center gap-2">
                              {s.imageUrl && (
                                <img
                                  src={s.imageUrl}
                                  alt={s.name}
                                  className="w-7 h-7 object-cover rounded border"
                                />
                              )}
                              <span className="text-sm">{s.name}</span>
                              <span className="text-xs text-gray-500">₵{s.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Total</span>
                        <span className="font-semibold text-blue-700">₵{order.total}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Payment</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{order.paymentStatus}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {order.paymentStatus !== 'Paid' && (
                          <button
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                            onClick={() => handleMarkPaid(order.id)}
                          >Mark Paid</button>
                        )}
                        <button
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          onClick={() => handleDeleteOrder(order.id)}
                        >Delete</button>
                        <button
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          onClick={() => setPrintOrder(order)}
                        >Print Receipt</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50"
                    onClick={() => setOngoingPage(p => Math.max(1, p-1))}
                    disabled={ongoingPage === 1}
                  >Prev</button>
                  {Array.from({length: Math.ceil(orders.length/ongoingPageSize)}, (_, i) => i+1).map(page => (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded border text-sm font-medium ${ongoingPage === page ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setOngoingPage(page)}
                    >{page}</button>
                  ))}
                  <button
                    className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50"
                    onClick={() => setOngoingPage(p => Math.min(Math.ceil(orders.length/ongoingPageSize), p+1))}
                    disabled={ongoingPage === Math.ceil(orders.length/ongoingPageSize)}
                  >Next</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Print Receipt Modal for both new and ongoing orders */}
        {printOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center print:shadow-none print:bg-white">
              <Receipt order={printOrder} onAfterPrint={() => setPrintOrder(null)} />
              <button
                className="text-gray-500 mt-2 hover:underline"
                onClick={() => setPrintOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Order;