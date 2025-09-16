import React from "react";

export default function DeleteCustomerModal({ isOpen, onClose, onConfirm, customer }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-2 p-6 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2 text-center text-red-600">Delete Customer?</h2>
        <p className="mb-4 text-center text-gray-700">
          Are you sure you want to delete <span className="font-semibold">{customer?.name}</span>?<br />
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-center mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
