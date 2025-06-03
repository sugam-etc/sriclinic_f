import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PetDetailPage from "./pages/PetDetailPage";
import SupplierDetailPage from "./pages/SupplierDetailPage";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Patients = lazy(() => import("./pages/Patients"));
const Appointments = lazy(() => import("./pages/Appointments"));
const MedicalRecords = lazy(() => import("./pages/MedicalRecords"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Sales = lazy(() => import("./pages/Sales"));
const StaffsPage = lazy(() => import("./pages/StaffsPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const MedicinesPage = lazy(() => import("./pages/MedicinePage"));
const ExpiredItemsPage = lazy(() => import("./pages/ExpiredItemsPage"));
const VaccinationPage = lazy(() => import("./pages/VaccinationPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedInUser");
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("loggedInUser");
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  const handleSetLoggedInUser = useCallback((user) => {
    setLoggedInUser(user);
    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("loggedInUser");
    }
  }, []);

  const handleLogout = useCallback(() => {
    handleSetLoggedInUser(null);
  }, [handleSetLoggedInUser]);

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700 text-xl font-semibold">
        Loading application...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <LoginPage setLoggedInUser={handleSetLoggedInUser} />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            loggedInUser ? (
              <div className="flex flex-col min-h-screen bg-gray-50">
                <div className="md:hidden">
                  <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                </div>
                <div className="flex flex-1 overflow-hidden">
                  <div className="hidden md:block">
                    <Sidebar
                      loggedInUser={loggedInUser}
                      onLogout={handleLogout}
                    />
                  </div>
                  {sidebarOpen && (
                    <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
                      <Sidebar
                        loggedInUser={loggedInUser}
                        onLogout={handleLogout}
                      />
                    </div>
                  )}
                  <main className="flex-1 p-4 md:ml-64 overflow-auto">
                    <Suspense fallback={<LoadingScreen />}>
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/patients" element={<Patients />} />
                        <Route path="/staffs" element={<StaffsPage />} />
                        <Route path="/medicines" element={<MedicinesPage />} />
                        <Route
                          path="/appointments"
                          element={<Appointments />}
                        />
                        <Route
                          path="/vaccinations"
                          element={<VaccinationPage />}
                        />
                        <Route path="/suppliers" element={<SuppliersPage />} />
                        <Route
                          path="/suppliers/:supplierId"
                          element={<SupplierDetailPage />}
                        />
                        <Route
                          path="/medical-records"
                          element={<MedicalRecords />}
                        />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/expired" element={<ExpiredItemsPage />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route
                          path="/patient/:patientId"
                          element={<PetDetailPage />}
                        />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen text-gray-600">
    Loading page...
  </div>
);

export default App;
