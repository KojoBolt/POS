import { useState, useEffect } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import AddServiceModal from "./AddServiceModal";
import EditServiceModal from "./EditServiceModal";
import { db } from "../../firebase/config";
import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
} from "firebase/firestore";

function Services() {
	const [services, setServices] = useState([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editService, setEditService] = useState(null);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState("All");

	// Fetch services from Firestore on mount
	useEffect(() => {
		const fetchServices = async () => {
			setLoading(true);
			const querySnapshot = await getDocs(collection(db, "services"));
			const fetched = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setServices(fetched);
			setLoading(false);
		};
		fetchServices();
	}, []);

	// Add service to local state only (Firestore is handled in AddServiceModal)
	const handleAddService = (newService) => {
		setServices((prev) => [...prev, newService]);
	};

	// Delete service from Firestore
	const handleDeleteService = async (id) => {
		await deleteDoc(doc(db, "services", id));
		setServices((prev) => prev.filter((service) => service.id !== id));
	};

	// Edit service in Firestore
	const handleUpdateService = async (updatedService) => {
		const { id, ...data } = updatedService;
		await updateDoc(doc(db, "services", id), data);
		setServices((prev) =>
			prev.map((service) =>
				service.id === id ? { ...service, ...data } : service
			)
		);
		setEditService(null);
	};

	const handleEditClick = (service) => {
		setEditService(service);
		setShowEditModal(true);
		setShowAddModal(false);
	};

	// Add Service Modal logic
	const handleAddButtonClick = () => {
		setEditService(null);
		setShowAddModal(true);
		setShowEditModal(false);
	};

	const totalServices = services.length;
	const totalCategories = new Set(services.map((s) => s.category)).size;
	const totalActive = services.filter((s) => s.status === "Active").length;
	const totalValue = services.reduce(
		(acc, s) => acc + (Number(s.price) || 0),
		0
	);

	// Filtered and searched services
		const filteredServices = services.filter((service) => {
			// Search by name, category, price, or type (case-insensitive, price as string)
			const searchLower = search.toLowerCase();
			const matchesSearch =
				service.name?.toLowerCase().includes(searchLower) ||
				service.category?.toLowerCase().includes(searchLower) ||
				service.type?.toLowerCase().includes(searchLower) ||
				String(service.price).toLowerCase().includes(searchLower);
			// Filter by type/category/status
			let matchesFilter = true;
			if (filter === "Packages") matchesFilter = service.category === "Package";
			else if (filter === "Add-ons") matchesFilter = service.category === "Add-on";
			else if (filter === "Active") matchesFilter = service.status === "Active";
			else if (filter === "Inactive") matchesFilter = service.status === "Inactive";
			return matchesSearch && matchesFilter;
		});

	return (
		   <div className="p-4 sm:p-6">
			   {/* Header */}
			   <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
				   <div>
					   <h1 className="text-2xl font-bold">Services</h1>
					   <p className="text-gray-500">Manage your car detailing services</p>
				   </div>
				   <button
					   className="flex items-center gap-2 bg-[#604BE8] text-white px-3 py-2 rounded-md text-sm hover:bg-[#7091EA] w-full max-w-xs sm:w-auto sm:max-w-none sm:rounded-lg sm:text-base sm:px-4 sm:py-3"
					   onClick={handleAddButtonClick}
				   >
					   <Plus size={16} className="sm:hidden" />
					   <Plus size={18} className="hidden sm:inline" />
					   <span className="xs:inline">Add Service</span>
				   </button>
			   </div>

			   {/* Stats */}
			   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				   <div className="bg-white p-4 rounded-lg shadow">
					   <p className="text-sm text-gray-500">Total Services</p>
					   <h2 className="text-2xl font-bold">{totalServices}</h2>
				   </div>
				   <div className="bg-white p-4 rounded-lg shadow">
					   <p className="text-sm text-gray-500">Categories</p>
					   <h2 className="text-2xl font-bold">{totalCategories}</h2>
				   </div>
				   <div className="bg-white p-4 rounded-lg shadow">
					   <p className="text-sm text-gray-500">Active</p>
					   <h2 className="text-2xl font-bold">{totalActive}</h2>
				   </div>
				   <div className="bg-white p-4 rounded-lg shadow">
					   <p className="text-sm text-gray-500">Total Value</p>
					   <h2 className="text-2xl font-bold">₵{totalValue}</h2>
				   </div>
			   </div>

			   {/* Filters */}
			   <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-4">
				   <input
					   type="text"
					   placeholder="Search services by name or category..."
					   value={search}
					   onChange={e => setSearch(e.target.value)}
					   className="bg-[#FFFFFF] rounded-md px-3 py-2 w-full max-w-xs md:max-w-none md:rounded-lg md:px-4 md:py-3 md:w-1/3 shadow-sm border border-gray-200 text-sm md:text-[12px]"
				   />
				   <div className="flex flex-wrap gap-2 text-gray-400 text-sm md:text-[15px] mt-2 md:mt-0">
					   {['All', 'Packages', 'Add-ons', 'Active', 'Inactive'].map(option => (
						   <button
							   key={option}
							   className={`bg-black px-3 py-2 rounded border border-gray-200 ${filter === option ? 'bg-[#604BE8] text-white' : ''}`}
							   onClick={() => setFilter(option)}
						   >
							   {option}
						   </button>
					   ))}
				   </div>
			   </div>

			   {/* Mobile Card Layout */}
			   <div className="flex flex-col gap-4 md:hidden mb-12 lg-mb-0">
				   {loading ? (
					   <div className="text-center py-8 text-gray-400">Loading...</div>
				   ) : filteredServices.length === 0 ? (
					   <div className="text-center py-8 text-gray-400">No services found.</div>
				   ) : (
					   filteredServices.map((service) => (
						   <div key={service.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border-l-4 border-green-500">
							   <div className="flex justify-between items-center">
								   <span className="font-semibold text-base">{service.name}</span>
								   <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">{service.status}</span>
							   </div>
							   <div className="text-sm text-gray-500">{service.description}</div>
							   <div className="flex flex-wrap gap-2 text-xs text-gray-500">
								   <span>Category: {service.category}</span>
								   <span>Type: {service.type}</span>
								   <span>Supplier: {service.supplier}</span>
							   </div>
							   <div className="font-bold text-green-700 text-lg">₵{service.price}</div>
							   <div className="flex gap-2 mt-2">
								   <button
									   className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
									   onClick={() => handleEditClick(service)}
								   >
									   <Edit size={16} />
								   </button>
								   <button
									   className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
									   onClick={() => handleDeleteService(service.id)}
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
				   <table className="w-full text-left">
					   <thead className="bg-[#000] text-white text-sm">
						   <tr>
							   <th className="px-6 py-3">Service</th>
							   <th className="px-6 py-3">Category</th>
							   <th className="px-6 py-3">Type</th>
							   <th className="px-6 py-3">Price</th>
							   <th className="px-6 py-3">Status</th>
							   <th className="px-6 py-3">Supplier </th>
							   <th className="px-6 py-3">Actions</th>
						   </tr>
					   </thead>
					   <tbody>
						   {loading ? (
							   <tr>
								   <td
									   colSpan={7}
									   className="text-center py-8 text-gray-400"
								   >
									   Loading...
								   </td>
							   </tr>
						   ) : filteredServices.length === 0 ? (
							   <tr>
								   <td
									   colSpan={7}
									   className="text-center py-8 text-gray-400"
								   >
									   No services found.
								   </td>
							   </tr>
						   ) : (
							   filteredServices.map((service) => (
								   <tr key={service.id} className="border-b border-green-100">
									   <td className="px-6 py-4">
										   <p className="font-semibold">{service.name}</p>
										   <p className="text-sm text-gray-500">
											   {service.description}
										   </p>
									   </td>
									   <td className="px-6 py-4">{service.category}</td>
									   <td className="px-6 py-4">{service.type}</td>
									   <td className="px-6 py-4 font-semibold">
										   ₵{service.price}
									   </td>
									   <td className="px-6 py-4">
										   <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-600">
											   {service.status}
										   </span>
									   </td>
									   <td className="px-6 py-4">{service.supplier}</td>
									   <td className="px-6 py-4 flex gap-2">
										   <button
											   className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
											   onClick={() => handleEditClick(service)}
										   >
											   <Edit size={16} />
										   </button>
										   <button
											   className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
											   onClick={() => handleDeleteService(service.id)}
										   >
											   <Trash2 size={16} />
										   </button>
									   </td>
								   </tr>
							   ))
						   )}
					   </tbody>
				   </table>
			   </div>

			{/* Add Service Modal */}
			<AddServiceModal
				isOpen={showAddModal}
				onClose={() => {
					setShowAddModal(false);
					setEditService(null);
				}}
				onSubmit={handleAddService}
			/>
			{/* Edit Service Modal */}
			<EditServiceModal
				isOpen={showEditModal}
				onCancel={() => {
					setShowEditModal(false);
					setEditService(null);
				}}
				service={editService}
				onSave={handleUpdateService}
			/>
		</div>
	);
}

export default Services;
