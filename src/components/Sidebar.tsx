import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, PawPrint, Users, Folder, CalendarDays, Box, Stethoscope, Settings, LogOut, Users2, Activity } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  agendaCounter?: number;
}

export default function Sidebar({ onLogout, agendaCounter }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <aside className="flex w-72 flex-col bg-white border-r border-slate-200 h-screen shrink-0 relative z-20 shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="size-10 flex items-center justify-center bg-primary rounded-xl text-white shadow-lg shadow-primary/20"
        >
          <PawPrint size={24} />
        </motion.div>
        <div>
          <h1 className="text-slate-900 text-lg font-black tracking-tight">
            VetFiles
          </h1>
          <p className="text-primary font-bold text-[10px] uppercase tracking-widest leading-tight">
            Medical Center
          </p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 opacity-70">Menú Principal</p>
        
        <SidebarLink to="/" icon={LayoutDashboard} label="Panel Principal" active={path === '/'} />
        <SidebarLink to="/patients" icon={PawPrint} label="Pacientes" active={path === '/patients'} />
        <SidebarLink to="/owners" icon={Users} label="Propietarios" active={path === '/owners'} />
        <SidebarLink to="/records" icon={Folder} label="Expedientes" active={path === '/records'} />
        <SidebarLink to="/schedule" icon={CalendarDays} label="Agenda" active={path === '/schedule'} counter={agendaCounter} />
        <SidebarLink to="/hospitalization" icon={Activity} label="Internamiento" active={path === '/hospitalization'} />
        <SidebarLink to="/staff" icon={Stethoscope} label="Personal Médico" active={path === '/staff'} />
        
        <div className="my-6 border-t border-slate-100 mx-4"></div>
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 opacity-70">Administración</p>
        
        <SidebarLink to="/inventory" icon={Box} label="Gestión de Insumos" active={path === '/inventory'} />
        <SidebarLink to="/schedule-config" icon={CalendarDays} label="Gestión de Agenda" active={path === '/schedule-config'} />
        <SidebarLink to="/users" icon={Users2} label="Gestión de Usuarios" active={path === '/users'} />
        <SidebarLink to="/settings" icon={Settings} label="Configuración" active={path === '/settings'} />
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <motion.button
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 group font-bold text-sm"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span>Cerrar Sesión</span>
        </motion.button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon: Icon, label, active, counter }: { to: string; icon: any; label: string; active: boolean; counter?: number }) {
  return (
    <Link to={to} className="relative group">
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative z-10 ${
          active
            ? 'text-primary'
            : 'text-slate-500 hover:text-slate-900 group-hover:bg-slate-50'
        }`}
      >
        <Icon size={20} className={`transition-all duration-500 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`} />
        <span className={`text-sm tracking-tight transition-all ${active ? 'font-black' : 'font-bold opacity-80'}`}>{label}</span>
        
        {counter !== undefined && counter > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto bg-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-secondary/20"
          >
            {counter}
          </motion.span>
        )}

        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 border border-primary/20 shadow-sm"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}
