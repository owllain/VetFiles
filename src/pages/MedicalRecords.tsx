import React from 'react';
import { motion } from 'framer-motion';

export default function MedicalRecords() {
  const records = [
    { id: 'EXP-001', petName: 'Luna', species: 'Canino', breed: 'Husky', owner: 'Carlos Gómez', lastVisit: '15 Feb 2026', status: 'Completo' },
    { id: 'EXP-002', petName: 'Max', species: 'Canino', breed: 'Golden', owner: 'Maria R.', lastVisit: '10 Feb 2026', status: 'En Proceso' },
    { id: 'EXP-003', petName: 'Bella', species: 'Felino', breed: 'Persa', owner: 'Juan P.', lastVisit: '20 Feb 2026', status: 'Incompleto' },
  ];

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Expedientes Médicos</h1>
          <p className="text-slate-500 font-medium">Historiales de salud integrados con Pacientes y Propietarios.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-primary/20 self-start group">
          <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">folder_shared</span>
          Nuevo Expediente
        </button>
      </header>

      {/* Stats for Records */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Expedientes', value: '1,240', color: 'bg-primary' },
          { label: 'Actualizados Hoy', value: '28', color: 'bg-secondary' },
          { label: 'En tratamiento', value: '45', color: 'bg-accent' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <div className="flex items-center gap-3">
                <span className={`size-3 rounded-full ${stat.color}`}></span>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex gap-4">
            <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="Buscar expediente por código o mascota..." />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mascota</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Propietario</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Atención</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record, index) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-all group"
                >
                  <td className="px-8 py-5">
                    <span className="text-primary font-black text-xs font-mono">{record.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-lg">pets</span>
                      </div>
                      <span className="text-slate-900 font-bold">{record.petName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-600 font-medium text-sm">
                    {record.owner}
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-black font-mono text-xs">
                    {record.lastVisit}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      record.status === 'Completo' ? 'bg-emerald-100 text-emerald-600' : 
                      record.status === 'En Proceso' ? 'bg-accent/10 text-accent' : 'bg-red-50 text-red-500'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-primary transition-colors uppercase tracking-widest">
                      Abrir
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
