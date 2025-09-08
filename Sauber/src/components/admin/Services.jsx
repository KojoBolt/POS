import { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import AddServiceModal from "./AddServiceModal";

const initialServices = [
	{
		id: 1,
		name: "Silver Package",
		description: "Inside & outside detailing, rim polishing",
		category: "Package",
		price: 499,
		type: "Small Car",
		status: "Active",
		supplier: "Sauber Detailing",
	},
	{
		id: 2,
		name: "Gold Package",
		description: "Silver + Tire oil shine + Summer waxing",
		category: "Package",
		price: 899,
		type: "Small Car",
		status: "Active",
		supplier: "Sauber Detailing",
	},
	{
		id: 3,
		name: "Engine Cleaning",
		description: "Deep engine cleaning service",
		category: "Add-on",
		price: 849,
		type: "Any Car",
		status: "Active",
		supplier: "Sauber Detailing",
	},
];

export default function Services() {
	const [services, setServices] = useState(initialServices);
	const [showAddModal, setShowAddModal] = useState(false);

	const handleAddService = (newService) => {
		setServices((prev) => [...prev, { id: prev.length + 1, ...newService }]);
	};

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
					onClick={() => setShowAddModal(true)}
				>
					<Plus size={18} /> Add Service
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-white p-4 rounded-lg shadow">
					<p className="text-sm text-gray-500">Total Services</p>
					<h2 className="text-2xl font-bold">{services.length}</h2>
				</div>
				<div className="bg-white p-4 rounded-lg shadow">
					<p className="text-sm text-gray-500">Categories</p>
					<h2 className="text-2xl font-bold">
						{new Set(services.map((s) => s.category)).size}
					</h2>
				</div>
				<div className="bg-white p-4 rounded-lg shadow">
					<p className="text-sm text-gray-500">Active</p>
					<h2 className="text-2xl font-bold">
						{services.filter((s) => s.status === "Active").length}
					</h2>
				</div>
				<div className="bg-white p-4 rounded-lg shadow">
					<p className="text-sm text-gray-500">Total Value</p>
					<h2 className="text-2xl font-bold">
						₵{services.reduce((acc, s) => acc + s.price, 0)}
					</h2>
				</div>
			</div>

			{/* Filters */}
			<div className="flex justify-between items-center mb-4">
				<input
					type="text"
					placeholder="Search services by name or category..."
					className="bg-[#FFFFFF] rounded-lg px-4 py-2 w-full md:w-1/3 shadow-sm border border-gray-200 text-[12px]"
				/>
				<div className="flex gap-2 ml-4 text-gray-400 text-[15px]">
					<button className="bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-200">
						All
					</button>
					<button className="bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-200">
						Packages
					</button>
					<button className="bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-200">
						Add-ons
					</button>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<table className="w-full text-left">
					<thead className="bg-[#06D8A1] text-white text-sm">
						<tr>
							<th className="px-6 py-3">Service</th>
							<th className="px-6 py-3">Category</th>
							<th className="px-6 py-3">Type</th>
							<th className="px-6 py-3">Price</th>
							<th className="px-6 py-3">Status</th>
							<th className="px-6 py-3">Provider</th>
							<th className="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{services.map((service) => (
							<tr key={service.id} className="border-b border-green-100">
								<td className="px-6 py-4">
									<p className="font-semibold">{service.name}</p>
									<p className="text-sm text-gray-500">
										{service.description}
									</p>
								</td>
								<td className="px-6 py-4">{service.category}</td>
								<td className="px-6 py-4">{service.type}</td>
								<td className="px-6 py-4 font-semibold">₵{service.price}</td>
								<td className="px-6 py-4">
									<span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-600">
										{service.status}
									</span>
								</td>
								<td className="px-6 py-4">{service.supplier}</td>
								<td className="px-6 py-4 flex gap-2">
									<button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
										<Edit size={16} />
									</button>
									<button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
										<Trash2 size={16} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Add Service Modal */}
			<AddServiceModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				onSubmit={handleAddService}
			/>
		</div>
	);
}
