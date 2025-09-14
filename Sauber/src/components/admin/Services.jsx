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
		<div className="p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold">Services</h1>
					<p className="text-gray-500">Manage your car detailing services</p>
				</div>
				<button
					className="flex items-center gap-2 bg-[#604BE8] text-white px-4 py-2 rounded-lg hover:bg-[#7091EA]"
					onClick={handleAddButtonClick}
				>
					<Plus size={18} /> Add Service
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
			<div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2 md:gap-0">
				<input
					type="text"
					placeholder="Search services by name or category..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					className="bg-[#FFFFFF] rounded-lg px-4 py-3 w-full md:w-1/3 shadow-sm border border-gray-200 text-[12px]"
				/>
				<div className="flex gap-2 ml-0 md:ml-4 text-gray-400 text-[15px] mt-2 md:mt-0">
					{['All', 'Packages', 'Add-ons', 'Active', 'Inactive'].map(option => (
						<button
							key={option}
							className={`bg-black px-3 py-2 rounded  border border-gray-200 ${filter === option ? 'bg-[#604BE8] text-white' : ''}`}
							onClick={() => setFilter(option)}
						>
							{option}
						</button>
					))}
				</div>
			</div>

			{/* Table */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
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
