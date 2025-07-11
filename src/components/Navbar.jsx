import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaPaw,
  FaCalendarAlt,
  FaFileMedical,
  FaBoxes,
  FaDollarSign,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";
import logo from "../assets/clinic.jpg";
const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", name: "Dashboard", icon: <FaHome className="mr-2" /> },
    {
      path: "/clients",
      name: "Clients",
      icon: <FaUserFriends className="mr-2" />,
    },
    { path: "/patients", name: "Patients", icon: <FaPaw className="mr-2" /> },
    {
      path: "/appointments",
      name: "Appointments",
      icon: <FaCalendarAlt className="mr-2" />,
    },

    {
      path: "/inventory",
      name: "Inventory",
      icon: <FaBoxes className="mr-2" />,
    },
    { path: "/sales", name: "Sales", icon: <FaDollarSign className="mr-2" /> },
  ];

  return (
    <nav className="bg-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-8 text-indigo-600" src={logo} />
              <span className="ml-2 text-xl font-bold text-gray-800">
                Sri Vet Clinic
              </span>
            </div>
          </div>

          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === link.path
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button - hidden on desktop */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - hidden on desktop */}
      <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === link.path
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                {link.icon}
                {link.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
