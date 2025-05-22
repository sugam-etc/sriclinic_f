import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaPaw,
  FaCalendarAlt,
  FaFileMedical,
  FaBoxes,
  FaDollarSign,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaFileImport,
} from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { CgDanger } from "react-icons/cg";
import logo from "../assets/clinic.jpg"; // Correct path to your logo

// Sidebar component now accepts loggedInUser and onLogout as props
const Sidebar = ({ loggedInUser, onLogout }) => {
  const location = useLocation();

  const navLinks = [
    { path: "/", name: "Dashboard", icon: <FaHome className="w-5 h-5" /> },
    {
      path: "/clients",
      name: "Clients",
      icon: <FaUserFriends className="w-5 h-5" />,
    },
    {
      path: "/patients",
      name: "Patients",
      icon: <FaPaw className="w-5 h-5" />,
    },
    {
      path: "/appointments",
      name: "Appointments",
      icon: <FaCalendarAlt className="w-5 h-5" />,
    },
    {
      path: "/staffs",
      name: "Staffs",
      icon: <FaPeopleGroup className="w-5 h-5" />,
    },
    {
      path: "/suppliers",
      name: "Suppliers",
      icon: <FaFileImport className="w-5 h-5" />,
    },
    {
      path: "/medical-records",
      name: "Medical Records",
      icon: <FaFileMedical className="w-5 h-5" />,
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
      path: "/expired",
      name: "Expired Items",
      icon: <CgDanger className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-screen fixed">
      {/* Sidebar header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Sri Vet Clinic Logo"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="ml-2 text-xl font-bold text-gray-800">
            Sri Vet Clinic
          </span>
        </div>
      </div>

      {/* Sidebar content */}
      <div className="flex flex-col flex-grow overflow-y-auto">
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 bg-white">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === link.path
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="mr-3">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center px-4 py-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaUser className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {/* This line displays the logged-in user's name or username */}
                {loggedInUser
                  ? loggedInUser.fullName || loggedInUser.username
                  : "Guest"}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {loggedInUser ? loggedInUser.role : "Role"}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <button
              onClick={onLogout} // Call the onLogout function when clicked
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
            >
              <FaSignOutAlt className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
