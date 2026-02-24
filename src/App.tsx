import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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

export interface Appointment {
  id: string;
  petName: string;
  ownerName: string;
  type: 'Consulta' | 'Vacuna' | 'Cirugía' | 'Examen';
  doctor: string;
  assistant: string;
  startTime: Date;
  duration: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return localStorage.getItem("vet_auth") === "true";
  });

  const [appointments, setAppointments] = React.useState<Appointment[]>([
    {
      id: '1',
      petName: 'Luna',
      ownerName: 'Carlos Gómez',
      type: 'Consulta',
      doctor: 'Dr. Pérez',
      assistant: 'Marta R.',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      duration: 39
    },
    {
      id: '2',
      petName: 'Max',
      ownerName: 'Maria R.',
      type: 'Cirugía',
      doctor: 'Dr. Pérez',
      assistant: 'Juan K.',
      startTime: new Date(new Date().setHours(11, 0, 0, 0)),
      duration: 120
    }
  ]);

  const login = () => {
    localStorage.setItem("vet_auth", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("vet_auth");
    setIsAuthenticated(false);
  };

  // Citas para hoy (inteligente)
  const todayCount = appointments.filter(app => {
    const today = new Date();
    return app.startTime.toDateString() === today.toDateString();
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
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
        <Sidebar onLogout={logout} agendaCounter={todayCount} />
        <main className="flex-1 overflow-y-auto relative z-10 transition-colors duration-500">
          <div className="absolute inset-0 z-0 bg-white/40 pointer-events-none"></div>

          <div className="relative z-10 min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/owners" element={<Owners />} />
              <Route path="/schedule" element={<Schedule appointments={appointments} setAppointments={setAppointments} />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/users" element={<Users />} />
              <Route path="/records" element={<MedicalRecords />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
