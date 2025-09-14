import { X } from "lucide-react";
import { useState } from "react";

export default function AddCustomerModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    vehicle: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setTimeout(() => setFormData({ firstName: "", lastName: "", phone: "", vehicle: "" }), 300);
    onClose();
  };

  return (
    <div className="fixed inset-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-[#604BE8] mb-6">
          Customer Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#604BE8] outline-none"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#604BE8] outline-none"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#604BE8] outline-none"
              required
            />
          </div>

          {/* Vehicle Info */}
          <div>
            <label className="block text-gray-700 mb-2">Vehicle Info</label>
            <input
              type="text"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              placeholder="e.g. Toyota Corolla - GJ05 AB 1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#604BE8] outline-none"
              required
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-[#604BE8] text-white py-3 rounded-lg font-medium hover:bg-[#5036d3] transition"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
