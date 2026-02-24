import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, PawPrint } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Owners from "./pages/Owners";
import Schedule from "./pages/Schedule";
import Inventory from "./pages/Inventory";
import Staff from "./pages/Staff";
import Users from "./pages/Users";
import MedicalRecords from "./pages/MedicalRecords";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Recovery from "./pages/Recovery";
import ResetPassword from "./pages/ResetPassword";
import Hospitalization from "./pages/Hospitalization";
import { appointmentService, Appointment } from "./services/appointmentService";

// Wrapper para transiciones de página suaves
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = ({ appointments, loadAppointments }: any) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageWrapper><Dashboard appointments={appointments}/></PageWrapper>} />
        <Route path="/patients" element={<PageWrapper><Patients /></PageWrapper>} />
        <Route path="/owners" element={<PageWrapper><Owners /></PageWrapper>} />
        <Route path="/schedule" element={<PageWrapper><Schedule appointments={appointments} refreshAppointments={loadAppointments} /></PageWrapper>} />
        <Route path="/hospitalization" element={<PageWrapper><Hospitalization /></PageWrapper>} />
        <Route path="/inventory" element={<PageWrapper><Inventory /></PageWrapper>} />
        <Route path="/staff" element={<PageWrapper><Staff /></PageWrapper>} />
        <Route path="/users" element={<PageWrapper><Users /></PageWrapper>} />
        <Route path="/records" element={<PageWrapper><MedicalRecords /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("vet_auth") === "true";
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
    }
  }, [isAuthenticated]);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error("Error loading shared appointments:", error);
    }
  };

  const login = () => {
    localStorage.setItem("vet_auth", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("vet_auth");
    setIsAuthenticated(false);
  };

  const todayCount = appointments.filter(app => {
    const today = new Date();
    const appDate = new Date(app.start_time);
    return appDate.toDateString() === today.toDateString();
  }).length;

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans antialiased relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <PawPrint className="size-5" />
            </div>
            <span className="font-black text-slate-900 tracking-tight">VetFiles</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="size-10 flex items-center justify-center text-slate-600 active:bg-slate-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Sidebar wrapper with responsive logic */}
        <div className={`
          fixed inset-0 z-50 lg:relative lg:z-20
          transition-transform duration-500 ease-[0.23,1,0.32,1]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div 
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative h-full w-72 h-screen">
            <Sidebar onLogout={logout} agendaCounter={todayCount} />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto relative z-10 bg-slate-50 mt-16 lg:mt-0 pb-10">
          <div className="relative z-10 h-full">
            <AnimatedRoutes 
              appointments={appointments} 
              loadAppointments={loadAppointments} 
            />
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
