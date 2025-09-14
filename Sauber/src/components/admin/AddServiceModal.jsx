import { useState, useEffect } from "react";
import { X, CloudUpload } from "lucide-react";
import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";

export default function AddServiceModal({ isOpen, onClose, onSubmit, service }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    type: "",
    supplier: "",
    discountable: false,
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isEdit = !!service;

  useEffect(() => {
    if (isEdit && service) {
      setFormData({ ...service, image: null });
      setPreview(service.imageUrl || null);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        type: "",
        supplier: "",
        discountable: false,
        image: null,
      });
      setPreview(null);
    }
  }, [isEdit, service, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!formData.name || !formData.category || !formData.price || !formData.type || !formData.supplier) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = preview;
      if (formData.image) {
        // Only upload if a new image is selected
        const cloudName = "ds3wqm6wy";
        const uploadPreset = "carpos_upload";
        const data = new FormData();
        data.append("file", formData.image);
        data.append("upload_preset", uploadPreset);
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: data,
        });
        const cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryData.secure_url) throw new Error("Image upload failed");
        imageUrl = cloudinaryData.secure_url;
      }
      if (isEdit) {
        // Update existing service
        const { id, ...rest } = service;
        const updatedService = {
          ...rest,
          ...formData,
          imageUrl: imageUrl || service.imageUrl || "",
        };
        await updateDoc(doc(db, "services", id), updatedService);
        setSuccessMessage("Service updated successfully!");
        if (onSubmit) onSubmit({ id, ...updatedService });
      } else {
        // Add new service
        const newService = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price) || 0,
          type: formData.type,
          status: "Active",
          supplier: formData.supplier,
          discountable: formData.discountable,
          createdAt: Timestamp.now(),
        };
        if (imageUrl) newService.imageUrl = imageUrl;
        const docRef = await addDoc(collection(db, "services"), newService);
        setSuccessMessage("Service created successfully!");
        if (onSubmit) onSubmit({ id: docRef.id, ...newService });
        setFormData({
          name: "",
          description: "",
          category: "",
          price: "",
          type: "",
          supplier: "",
          discountable: false,
          image: null,
        });
        setPreview(null);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      type: "",
      supplier: "",
      discountable: false,
      image: null,
    });
    setPreview(null);
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-hidden">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{isEdit ? "Edit Service" : "Add New Service"}</h2>
          <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        {/* Modal Form */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{successMessage}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#604BE8] focus:border-transparent"
                  required
                />
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#604BE8] focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Package">Package</option>
                  <option value="Add-on">Add-on</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₵) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#604BE8] focus:border-transparent"
                  required
                />
              </div>
              {/* Car Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#604BE8] focus:border-transparent"
                  required
                >
                  <option value="">Select car type</option>
                  <option value="Small Car">Small Car</option>
                  <option value="Medium Car">Medium Car</option>
                  <option value="Large Car">Large Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Any Car">Any Car</option>
                </select>
              </div>
            </div>
            {/* Supplier */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#604BE8] focus:border-transparent"
                required
              >
                <option value="">Select supplier</option>
                <option value="Sauber Detailing">Sauber Detailing</option>
                <option value="Premium Clean">Premium Clean</option>
                <option value="Auto Shine">Auto Shine</option>
              </select>
            </div>
            {/* Discountable Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discountable
              </label>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, discountable: !prev.discountable }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.discountable ? "bg-[#604BE8]" : "bg-gray-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.discountable ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span className="ml-3 text-sm text-gray-600">{formData.discountable ? "Yes" : "No"}</span>
            </div>
            {/* Image Upload (Optional) */}
            <div className="bg-[#F4F7FF] p-6 rounded-lg mb-6 flex flex-col items-center text-center">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="flex justify-center items-center mb-3 rounded-full p-5 w-18 h-10">
                <CloudUpload className="mb-2 text-center text-blue-800 p-1 w-8 h-8 rounded-2xl" />
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                className="lg:px-49 lg:py-2 mx-auto block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#604BE8] file:text-white hover:file:bg-[#7091EA] cursor-pointer"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 w-32 h-32 object-cover rounded-lg border"
                />
              )}
              {!preview && (
                <span className="text-xs text-gray-400 mt-2">No image selected</span>
              )}
            </div>
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter service description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#604BE8] focus:border-transparent resize-none"
              />
            </div>
            {/* Modal Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#604BE8] text-white rounded-lg hover:bg-[#7091EA] transition-colors"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
