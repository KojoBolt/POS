import { Home, ShoppingBag, Users, Settings, FileText, Box, BadgeCent, ChevronsUpDown  } from "lucide-react";
import { Link, useLocation } from "react-router-dom";


import { useState, useRef, useEffect } from "react";

const MobileMenu = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const popupRef = useRef(null);

  // Main menu items (always visible)
  const mainMenu = [
    { icon: <Home size={20} />, path: "/admin/dashboard" },
    { icon: <ShoppingBag size={20} />, path: "/admin/orders" },
    { icon: <BadgeCent size={20} />, path: "/admin/sales" },
    { icon: <Users size={20} />, path: "/admin/customers" },
  ];
  // Items in the popup
  const moreMenu = [
    { icon: <Box size={20} />, label: "Services", path: "/admin/services" },
    { icon: <FileText size={20} />, label: "Reports", path: "/admin/reports" },
    { icon: <Settings size={20} />, label: "Settings", path: "/admin/settings" },
  ];

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowMore(false);
      }
    }
    if (showMore) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMore]);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full rounded-full bg-black shadow-lg border-t border-gray-200 flex justify-around items-center py-3 z-50 m-2 mx-auto">
      {mainMenu.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className={`p-2 rounded-full ${
            location.pathname === item.path ? "text-indigo-600 bg-indigo-100" : "text-gray-600"
          }`}
        >
          {item.icon}
        </Link>
      ))}
      {/* View More button */}
      <button
        className={`p-2 rounded-full ${showMore ? "text-indigo-600 bg-indigo-100" : "text-gray-600"}`}
        onClick={() => setShowMore((v) => !v)}
        aria-label="View more menu"
        type="button"
      >
  <ChevronsUpDown size={20} />
      </button>
      {/* Popup menu */}
      {showMore && (
        <div
          ref={popupRef}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg py-2 px-3 flex flex-col min-w-[160px] z-50 border border-gray-200 animate-fade-in"
        >
          {moreMenu.map((item, idx) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                location.pathname === item.path ? "text-indigo-600 font-semibold" : "text-gray-700"
              }`}
              onClick={() => setShowMore(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
