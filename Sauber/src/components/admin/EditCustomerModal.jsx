import { useState, useEffect } from "react";

export default function EditCustomerModal({ isOpen, onClose, customer, onSave }) {
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "" });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        vehicle: customer.vehicle || "",
      });
    }
  }, [customer]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.vehicle.trim()) return;
    onSave({ ...customer, ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-2 p-6 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Edit Customer</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#604BE8] focus:outline-none text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#604BE8] focus:outline-none text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle</label>
            <input
              type="text"
              name="vehicle"
              value={form.vehicle}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#604BE8] focus:outline-none text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#604BE8] text-white py-2 rounded-lg font-semibold hover:bg-[#5036d3] transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
