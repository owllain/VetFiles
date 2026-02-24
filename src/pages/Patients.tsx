import React from 'react';
import { motion } from 'framer-motion';

export default function Patients() {
  const patients = [
    { id: 1, name: 'Luna', species: 'Canino', breed: 'Husky', owner: 'Juan Pérez', visit: '15/02/2026', status: 'Activo', initial: 'L', color: 'bg-primary' },
    { id: 2, name: 'Max', species: 'Canino', breed: 'Golden Ret.', owner: 'Maria R.', visit: '10/02/2026', status: 'Activo', initial: 'M', color: 'bg-secondary' },
    { id: 3, name: 'Bella', species: 'Felino', breed: 'Persa', owner: 'Juan P.', visit: '20/02/2026', status: 'En Tratamiento', initial: 'B', color: 'bg-accent' },
    { id: 4, name: 'Rocky', species: 'Canino', breed: 'Boxer', owner: 'Luis M.', visit: '12/01/2026', status: 'Alta', initial: 'R', color: 'bg-emerald-500' },
    { id: 5, name: 'Coco', species: 'Ave', breed: 'Loro', owner: 'Ana G.', visit: '05/02/2026', status: 'Activo', initial: 'C', color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Pacientes</h1>
          <p className="text-slate-500 font-medium">Gestión de expedientes clínicos y mascotas registradas.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-primary/20 self-start group">
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
          Nuevo Registro
        </button>
      </header>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre, dueño o especie..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
          <span className="material-symbols-outlined">filter_list</span>
          Filtros
        </button>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Especie / Raza</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Propietario</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Visita</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((patient, index) => (
                <motion.tr 
                  key={patient.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-all group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl ${patient.color} text-white flex items-center justify-center font-black text-lg shadow-lg shadow-slate-200`}>
                        {patient.initial}
                      </div>
                      <div>
                        <span className="text-slate-900 font-black block">{patient.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: 00{patient.id}2026</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-slate-600 font-bold text-sm block">{patient.species}</span>
                    <span className="text-slate-400 text-xs font-medium">{patient.breed}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">person</span>
                      <span className="text-slate-600 font-bold text-sm">{patient.owner}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-slate-500 text-sm font-black font-mono">{patient.visit}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      patient.status === 'Activo' ? 'bg-emerald-100 text-emerald-600' : 
                      patient.status === 'En Tratamiento' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="size-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all flex items-center justify-center ml-auto">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}