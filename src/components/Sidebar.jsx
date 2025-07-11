import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaPaw,
  FaCalendarAlt,
  FaBoxes,
  FaDollarSign,
  FaSignOutAlt,
  FaUser,
  FaFileImport,
  FaUsers,
} from "react-icons/fa";
import { FaPeopleGroup, FaSyringe } from "react-icons/fa6";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { CgDanger } from "react-icons/cg";
import logo from "../assets/clinic.jpg";
import React from "react";
import { MdBloodtype } from "react-icons/md";

const Sidebar = ({ loggedInUser, onLogout }) => {
  const location = useLocation();

  const navLinks = [
    { path: "/", name: "Dashboard", icon: <FaHome className="w-5 h-5" /> },
    {
      path: "/clients",
      name: "Clients",
      icon: <FaUsers className="w-5 h-5" />,
    },

    {
      path: "/patients",
      name: "Patients",
      icon: <FaPaw className="w-5 h-5" />,
    },
    {
      path: "/vaccinations",
      name: "Vaccinations",
      icon: <FaSyringe className="w-5 h-5" />,
    },
    {
      path: "/staffs",
      name: "Staff",
      icon: <FaPeopleGroup className="w-5 h-5" />,
    },
    {
      path: "/suppliers",
      name: "Suppliers",
      icon: <FaFileImport className="w-5 h-5" />,
    },
    {
      path: "/inventory",
      name: "Inventory",
      icon: <FaBoxes className="w-5 h-5" />,
    },
    {
      path: "/sales",
      name: "Sales",
      icon: <FaDollarSign className="w-5 h-5" />,
    },
    {
      path: "/medicines",
      name: "Medicines",
      icon: <AiOutlineMedicineBox className="w-5 h-5" />,
    },
    {
      path: "/blood-reports",
      name: "Blood Reports",
      icon: <MdBloodtype className="w-5 h-5" />,
    },
    {
      path: "/expired",
      name: "Expired Items",
      icon: <CgDanger className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col w-64 h-screen fixed bg-white border-r border-gray-200 no-print">
      {/* Header */}
      <div className="flex items-center h-20 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Sri Vet Clinic Logo"
            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
            Sri Vet Clinic
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto px-3 py-6">
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                location.pathname === link.path
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3">
                {React.cloneElement(link.icon, {
                  className: `w-5 h-5 ${
                    location.pathname === link.path
                      ? "text-white"
                      : "text-orange-500"
                  }`,
                })}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center px-3 py-2 rounded-lg">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white">
              <FaUser className="h-4 w-4 text-orange-500" />
            </div>
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">
              {loggedInUser
                ? loggedInUser.staff.name || loggedInUser.staff.username
                : "Guest"}
            </p>
            <p className="text-xs font-medium text-gray-500 truncate">
              {loggedInUser ? loggedInUser.staff.role : "Role"}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 mt-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
        >
          <FaSignOutAlt className="w-5 h-5 mr-3 text-gray-500" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
