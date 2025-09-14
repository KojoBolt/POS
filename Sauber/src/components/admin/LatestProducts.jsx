import { Box } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function LatestProducts() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'services'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-[100%] md:min-w-[400px] lg:min-w-[500px] mb-12 lg:mb-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Box className="w-5 h-5 text-black" />
        <h2 className="text-lg font-bold text-black">Latest Services</h2>
      </div>

      {/* Services List */}
      <div className="space-y-6">
        {services.map((service, index) => (
          <div key={service.id || index} className="flex items-center justify-between">
            {/* Left side - Service details */}
            <div>
              <div className="font-medium text-gray-900 mb-1">{service.name}</div>
              <div className="text-sm text-gray-500">Category: {service.category || 'N/A'}</div>
            </div>
            {/* Right side - Price */}
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
              ₵{service.price?.toLocaleString() || '0'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}