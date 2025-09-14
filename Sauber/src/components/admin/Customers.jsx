import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import AddCustomerModal from "./AddCustomerModal";
import { db } from "../../firebase/config";
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(""); // For date filter
  const [endDate, setEndDate] = useState(""); // For date filter
  const [entries, setEntries] = useState(5); // Show Entries state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "customers"));
      const fetched = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(fetched);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  // Delete customer from Firestore
  const handleDeleteCustomer = async (id) => {
    await deleteDoc(doc(db, "customers", id));
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Save customer to Firestore
  const handleSaveCustomer = async (newCustomer) => {
    const fullName = `${newCustomer.firstName} ${newCustomer.lastName}`;
    const customerData = {
      name: fullName,
      phone: newCustomer.phone,
      vehicle: newCustomer.vehicle,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "customers"), customerData);
    setCustomers([
      ...customers,
      {
        id: docRef.id,
        ...customerData,
      },
    ]);
  };

  // Filter customers by search input (name, phone, vehicle) and date
  const filteredCustomers = customers.filter((c) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchLower)) ||
      (c.phone && c.phone.toLowerCase().includes(searchLower)) ||
      (c.vehicle && c.vehicle.toLowerCase().includes(searchLower));

    // Date filter logic
    let matchesDate = true;
    if (startDate) {
      const customerDate = c.createdAt?.toDate
        ? c.createdAt.toDate()
        : c.createdAt instanceof Date
        ? c.createdAt
        : null;
      if (customerDate) {
        matchesDate = matchesDate && customerDate >= new Date(startDate);
      }
    }
    if (endDate) {
      const customerDate = c.createdAt?.toDate
        ? c.createdAt.toDate()
        : c.createdAt instanceof Date
        ? c.createdAt
        : null;
      if (customerDate) {
        // Add one day to endDate to make it inclusive
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        matchesDate = matchesDate && customerDate < end;
      }
    }

    return matchesSearch && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / entries);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * entries,
    currentPage * entries
  );

  // Reset to page 1 if entries or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [entries, search, startDate, endDate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#604BE8] text-white px-4 py-2 rounded-lg hover:bg-[#5036d3]"
        >
          <Plus size={18} /> Add New Customer
        </button>
      </div>

      {/* Search + Date + Entries */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search for Name, Phone, Vehicle..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#604BE8] focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Date */}
        <div className="flex items-center gap-3">
          <span className="text-gray-600 ">Date:</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#604BE8] focus:outline-none"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#604BE8] focus:outline-none"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        {/* Show Entries */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Show Entries:</span>
          <select
            className="border border-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#604BE8] focus:outline-none"
            value={entries}
            onChange={e => setEntries(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-800 text-white">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Vehicle Info</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((c) => (
              <tr
                key={c.id}
                className="border-b border-b-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">{c.name}</td>
                <td className="px-6 py-4">{c.phone}</td>
                <td className="px-6 py-4">{c.vehicle}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    onClick={() => handleDeleteCustomer(c.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
