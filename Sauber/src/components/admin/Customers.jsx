import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import AddCustomerModal from "./AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import DeleteCustomerModal from "./DeleteCustomerModal";
import { db } from "../../firebase/config";
import { getDocs, collection, Timestamp, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
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
  const handleDeleteCustomer = async () => {
    if (!deleteCustomer) return;
    await deleteDoc(doc(db, "customers", deleteCustomer.id));
    setCustomers((prev) => prev.filter((c) => c.id !== deleteCustomer.id));
    setDeleteModalOpen(false);
    setDeleteCustomer(null);
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

  // Edit customer in Firestore
  const handleUpdateCustomer = async (updatedCustomer) => {
    const { id, ...data } = updatedCustomer;
    await updateDoc(doc(db, "customers", id), data);
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    setEditModalOpen(false);
    setEditCustomer(null);
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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1 bg-[#604BE8] text-white px-3 py-2 rounded-md text-sm hover:bg-[#5036d3] w-full max-w-xs sm:w-auto sm:max-w-none sm:rounded-lg sm:text-base sm:px-4 sm:py-2"
        >
          <Plus size={16} className="sm:hidden" />
          <Plus size={18} className="hidden sm:inline" />
          <span className="xs:inline">Add New Customer</span>
        </button>
      </div>

      {/* Search + Date + Entries */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="w-full justify-center md:justify-start md:w-1/3">
          <div className="relative w-full max-w-xs md:max-w-none md:w-full">
            <input
              type="text"
              placeholder="Search for Name, Phone, Vehicle..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#604BE8] focus:outline-none text-sm sm:pl-10 sm:pr-4 sm:py-2 sm:rounded-lg sm:text-base"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 flex items-center sm:left-3">
              <Search className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <span className="text-gray-600">Date:</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#604BE8] focus:outline-none w-full sm:w-auto"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span className="sm:inline hidden">to</span>
          <span className="sm:hidden">to</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#604BE8] focus:outline-none w-full sm:w-auto"
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

      {/* Mobile Card Layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {paginatedCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No customers found.</div>
        ) : (
          paginatedCustomers.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border-l-4 border-green-500">
              <div className="font-semibold text-base">{c.name}</div>
              <div className="text-sm text-gray-500">{c.phone}</div>
              <div className="text-sm text-gray-500">{c.vehicle}</div>
              <div className="flex gap-2 mt-2">
                <button
                  className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                  onClick={() => {
                    setEditCustomer(c);
                    setEditModalOpen(true);
                  }}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  onClick={() => {
                    setDeleteCustomer(c);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="bg-white rounded-lg shadow overflow-x-auto hidden md:block">
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
                  <button
                    className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                    onClick={() => {
                      setEditCustomer(c);
                      setEditModalOpen(true);
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    onClick={() => {
                      setDeleteCustomer(c);
                      setDeleteModalOpen(true);
                    }}
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 mb-12 lg:mb-0">
        <div className="text-sm text-gray-500">
          Showing {paginatedCustomers.length} of {filteredCustomers.length} customers
        </div>
        <div className="flex gap-2">
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
      </div>

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />
      <EditCustomerModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditCustomer(null);
        }}
        customer={editCustomer}
        onSave={handleUpdateCustomer}
      />
      <DeleteCustomerModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteCustomer(null);
        }}
        customer={deleteCustomer}
        onConfirm={handleDeleteCustomer}
      />
    </div>
  );
// ...existing code...
}
