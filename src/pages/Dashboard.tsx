import React from 'react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const stats = [
    { label: 'Pacientes Hoy', value: '12', icon: 'pets', color: 'bg-primary/20 text-primary' },
    { label: 'Citas Pendientes', value: '4', icon: 'calendar_month', color: 'bg-accent/20 text-accent' },
    { label: 'Cirugías', value: '2', icon: 'medical_services', color: 'bg-secondary/20 text-secondary' },
    { label: 'Ingresos Día', value: '$1,250', icon: 'payments', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="p-8 bg-[#f8fafc]">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            Status: Clinic Active
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Panel de Control</h1>
        <p className="text-slate-500 font-medium">Dr. Identifier, tienes 3 recordatorios importantes para hoy.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`size-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">trending_up</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointments */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Agenda Próxima</h2>
              <p className="text-sm text-slate-500 font-medium">Hoy, Lunes 23 de Febrero</p>
            </div>
            <button className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-xs px-5 py-2.5 rounded-xl transition-colors border border-slate-200">
              Ver Calendario
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Luna', breed: 'Husky', owner: 'Carlos G.', time: '10:30 AM', type: 'Vacunación', color: 'bg-primary' },
              { name: 'Max', breed: 'Golden Ret.', owner: 'Maria R.', time: '11:15 AM', type: 'Cirugía', color: 'bg-secondary' },
              { name: 'Bella', breed: 'Gato Persa', owner: 'Juan P.', time: '12:00 PM', type: 'Check-up', color: 'bg-accent' },
            ].map((pet, i) => (
              <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                <div className={`size-14 rounded-2xl ${pet.color} text-white flex items-center justify-center font-black text-xl shadow-lg shadow-${pet.color.split('-')[1]}/30`}>
                  {pet.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900 font-black text-lg">{pet.name}</h4>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold rounded uppercase">{pet.breed}</span>
                  </div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">Propietario: {pet.owner} • <span className="text-primary">{pet.type}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900 font-black text-base">{pet.time}</p>
                  <div className="flex justify-end gap-1 mt-1">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] uppercase font-black text-emerald-600">Confirmado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Alerts - Triadic Contrast */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16"></div>
             <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-secondary">notifications_active</span>
               Alertas Críticas
             </h2>
             <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
                   <p className="text-secondary font-black text-sm mb-1 uppercase tracking-tight">Inventario Crítico</p>
                   <p className="text-slate-600 text-xs font-medium">Vacunas Rabia: Quedan sólo 3 dosis en stock.</p>
                </div>
                <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                   <p className="text-accent font-black text-sm mb-1 uppercase tracking-tight">Recordatorio Cita</p>
                   <p className="text-slate-600 text-xs font-medium">Confirmar cirugía de 'Max' para mañana 08:00 AM.</p>
                </div>
             </div>
             <button className="w-full mt-8 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors duration-300 shadow-xl shadow-slate-200">
               Gestionar Alertas
             </button>
          </div>

          <div className="bg-primary rounded-3xl p-8 text-white shadow-lg shadow-primary/20">
             <h3 className="text-xl font-black mb-2">Vet-Cloud Sync</h3>
             <p className="text-primary-light text-xs font-bold uppercase tracking-widest mb-6">Backup 100% Completo</p>
             <div className="w-full bg-primary-hover/50 h-2 rounded-full mb-4">
                <div className="bg-white w-full h-full rounded-full shadow-[0_0_10px_white]"></div>
             </div>
             <p className="text-[10px] font-medium opacity-80">Última sincronización: Hace 2 minutos</p>
          </div>
        </div>
      </div>
    </div>
  );
}