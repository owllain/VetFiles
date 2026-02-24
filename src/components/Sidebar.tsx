import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
    <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 h-screen shrink-0 relative z-20 shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="size-10 flex items-center justify-center bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-2xl">pets</span>
        </div>
        <div>
          <h1 className="text-slate-900 text-lg font-bold tracking-tight">
            VetFiles
          </h1>
          <p className="text-primary font-bold text-[10px] uppercase tracking-widest">
            Medical Center
          </p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menú Principal</p>
        
        <SidebarLink to="/" icon="dashboard" label="Panel Principal" active={path === '/'} />
        <SidebarLink to="/patients" icon="pets" label="Pacientes" active={path === '/patients'} />
        <SidebarLink to="/owners" icon="group" label="Propietarios" active={path === '/owners'} />
        <SidebarLink to="/records" icon="folder_shared" label="Expedientes" active={path === '/records'} />
        <SidebarLink to="/schedule" icon="calendar_today" label="Agenda" active={path === '/schedule'} counter={agendaCounter} />
        <SidebarLink to="/inventory" icon="inventory_2" label="Inventario" active={path === '/inventory'} />
        <SidebarLink to="/staff" icon="medical_services" label="Personal Médico" active={path === '/staff'} />
        
        <div className="my-4 border-t border-slate-100 mx-2"></div>
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sistema</p>
        
        <SidebarLink to="/users" icon="manage_accounts" label="Usuarios" active={path === '/users'} />
        <SidebarLink to="/settings" icon="settings" label="Configuración" active={path === '/settings'} />
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:text-secondary hover:bg-secondary/5 transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">logout</span>
          <span className="font-semibold text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label, active, counter }: { to: string; icon: string; label: string; active: boolean; counter?: number }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        active
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-slate-600 hover:text-primary hover:bg-slate-50'
      }`}
    >
      <span className={`material-symbols-outlined text-xl ${active ? 'fill-1' : 'group-hover:scale-110 transition-transform'}`}>
        {icon}
      </span>
      <span className="font-bold text-sm">{label}</span>
      {counter !== undefined && counter > 0 && (
        <span className="ml-auto bg-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-secondary/30">
          {counter}
        </span>
      )}
    </Link>
  );
}
