import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "@fontsource/inter";

import { PetDetailPage } from "./pages/PetDetail/PetDetailPage";
import SupplierDetailPage from "./pages/SupplierDetailPage";
import PatientMedicalRecordForm from "./pages/PatientMedicalRecordForm";
import VaccinationDetailsPage from "./pages/Vaccination/VaccinationDetailsPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import BloodReports from "./pages/BloodReport/BloodReportPage";
import BloodReportView from "./pages/BloodReport/BloodReportView";
import MedicalRecordView from "./components/medicalRecords/ViewMedicalRecord";
import VaccineDetail from "./pages/Vaccination/VaccinePage";
import PatientListPage from "./pages/Patients/PatientList";
import SurgeryReportPage from "./pages/SurgeryReport/SurgeryReportPage";
import BloodReportForm from "./pages/PetDetail/Forms/AddBloodReport";
// Lazy-loaded pages
const Clients = lazy(() => import("./pages/Clients/ClientsPage"));
const ClientPatientsPage = lazy(() =>
  import("./pages/Patients/ClientPatientsPage")
);
// const Appointments = lazy(() => import("./pages/Appointments"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Sales = lazy(() => import("./pages/Sales"));
const StaffsPage = lazy(() => import("./pages/StaffsPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const MedicinesPage = lazy(() => import("./pages/MedicinePage"));
const ExpiredItemsPage = lazy(() => import("./pages/ExpiredItemsPage"));
const VaccinationPage = lazy(() =>
  import("./pages/Vaccination/VaccinationPage")
);
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
      <div className="mainApp">
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
                    <Navbar
                      toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    />
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

                          {/* Clients and Patients Routes */}
                          <Route path="/clients" element={<Clients />} />
                          <Route
                            path="/patients/client/:clientId"
                            element={<ClientPatientsPage />}
                          />
                          <Route
                            path="/patient/:patientId"
                            element={<PetDetailPage />}
                          />
                          <Route
                            path="/medical-record/:id"
                            element={<MedicalRecordView />}
                          />

                          {/* Existing Routes (unchanged) */}
                          <Route path="/staffs" element={<StaffsPage />} />
                          <Route
                            path="/blood-reports"
                            element={<BloodReports />}
                          />
                          <Route
                            path="/blood-reports/:id"
                            element={<BloodReportView />}
                          />
                          <Route
                            path="/blood-reports/:id/edit"
                            element={<BloodReportForm />}
                          />
                          <Route
                            path="/medicines"
                            element={<MedicinesPage />}
                          />
                          <Route
                            path="/patients"
                            element={<PatientListPage />}
                          />
                          <Route
                            path="/surgery/:id"
                            element={<SurgeryReportPage />}
                          />
                          <Route
                            path="/vaccination/:id"
                            element={<VaccineDetail />}
                          />
                          <Route
                            path="/vaccinations"
                            element={<VaccinationPage />}
                          />
                          <Route
                            path="/vaccination-details/:patientId"
                            element={<VaccinationDetailsPage />}
                          />
                          <Route
                            path="/suppliers"
                            element={<SuppliersPage />}
                          />
                          <Route
                            path="/suppliers/:supplierId"
                            element={<SupplierDetailPage />}
                          />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route
                            path="/patientmedicalform"
                            element={<PatientMedicalRecordForm />}
                          />
                          <Route
                            path="/expired"
                            element={<ExpiredItemsPage />}
                          />
                          <Route path="/sales" element={<Sales />} />
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
      </div>
    </Router>
  );
}

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen text-gray-600">
    Loading page...
  </div>
);

export default App;
