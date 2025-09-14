import { useState } from "react";
import { db } from '../../firebase/config';
import { updateDoc, doc } from "firebase/firestore";
import { X, Upload, Trash2 } from "lucide-react";

export default function EditServiceModal({ isOpen, service, onSave, onCancel }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: service?.name || "",
    description: service?.description || "",
    category: service?.category || "",
    type: service?.type || "",
    price: service?.price || "",
    quantity: service?.quantity || "",
    status: service?.status === "Active" || false,
    supplier: service?.supplier || "",
    images: service?.images || [],
    serviceId: service?.serviceId || ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cloudinary upload logic
  const handleImageUpload = async (files) => {
    const cloudName = "ds3wqm6wy"; // replace with your Cloudinary cloud name
    const uploadPreset = "carpos_upload"; // replace with your Cloudinary upload preset
    const newFiles = Array.from(files).slice(0, 5 - formData.images.length);
    const uploadedUrls = [];
    for (const file of newFiles) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      } catch (err) {
        setError("Image upload failed. Please try again.");
      }
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }
      // Update Firestore with new data
      const updatedProduct = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        status: formData.status ? "Active" : "Inactive",
        updatedAt: new Date(),
      };
      // If service has an id, update Firestore
      if (service?.id) {
        await updateDoc(doc(db, "services", service.id), updatedProduct);
        onSave({ ...updatedProduct, id: service.id });
      } else {
        onSave(updatedProduct);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message || "Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>My Products</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">{formData.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#84CC16] text-white hover:bg-[#65A30D] disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent resize-none text-sm leading-5"
                      placeholder="Start your day with a boost of coding inspiration using this Amigoscode Coffee Mug..."
                    />
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Product Images <span className="text-gray-400 font-normal">({formData.images.length}/5 images)</span>
                </h3>
                
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4 ${
                    dragActive 
                      ? 'border-[#84CC16] bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 mb-1">Choose a file Or Drag and Drop it here</p>
                  <p className="text-xs text-gray-400">PNG, JPEG, up to 2MB</p>
                  
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Image Previews */}
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 3 - formData.images.length) }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Product Status & Details */}
            <div className="space-y-6">
              {/* Product Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full ${formData.status ? 'bg-[#84CC16]' : 'bg-gray-300'} relative transition-colors duration-200`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${formData.status ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Stock Level */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Level</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent bg-white"
                    placeholder="200"
                    min="0"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">₵</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent bg-white"
                      placeholder="29.99"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Service ID */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-900"> Service  ID</span>
                  <svg className="h-6" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M59.5 12.5c0-3.038-2.462-5.5-5.5-5.5s-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5 5.5-2.462 5.5-5.5zm-11 0c0-3.038-2.462-5.5-5.5-5.5s-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5 5.5-2.462 5.5-5.5zm-11 0c0-3.038-2.462-5.5-5.5-5.5s-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5 5.5-2.462 5.5-5.5zm-11 0c0-3.038-2.462-5.5-5.5-5.5s-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5 5.5-2.462 5.5-5.5zm-11 0c0-3.038-2.462-5.5-5.5-5.5s-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5 5.5-2.462 5.5-5.5zm-11 0c0-3.038-2.462-5.5-5.5-5.5s-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5 5.5-2.462 5.5-5.5z" fill="#635BFF"/>
                  </svg>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service ID <span className="text-gray-400 font-normal">(Cannot be changed)</span>
                  </label>
                  <input
                    type="text"
                    value={service?.id || formData.serviceId || ""}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Additional Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent"
                    placeholder="e.g. Package / Add-on"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent"
                    placeholder="e.g. Small Car / Any Car"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent"
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}