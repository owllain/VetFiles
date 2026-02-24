import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hospitalizationService, Hospitalization } from '../services/hospitalizationService';
import { Activity, Thermometer, Heart, TriangleAlert, CircleCheck, EllipsisVertical, Plus, Clock } from 'lucide-react';

export default function HospitalizationPage() {
  const [data, setData] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setNow(new Date()), 60000); // Actualizar cada minuto
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await hospitalizationService.getAll();
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const getDaysElapsed = (dateStr: string) => {
    const start = new Date(dateStr);
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Ingresó hoy";
    if (diffDays === 1) return "Ingresó ayer";
    return `Ingresó hace ${diffDays} días`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Crítico': return 'text-red-600 bg-red-50 border-red-100 animate-pulse-slow';
      case 'Estable': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Alta': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Observación': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const isAlertActive = (alertTime?: string) => {
    if (!alertTime) return false;
    // Si la hora de la alerta coincide con la hora actual (formato HH:mm)
    const currentHourMin = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return alertTime === currentHourMin;
  };

  return (
    <div className="p-8 bg-slate-50 min-h-full font-display">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Internamiento</h1>
          <div className="flex items-center gap-2">
            <div className="size-2 bg-secondary rounded-full animate-pulse" />
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Monitoreo de Pacientes Hospitalizados</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
                <button 
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'cards' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Mosaico
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Listado
                </button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-900 text-white font-black py-3.5 px-8 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center gap-2 text-xs uppercase tracking-widest"
            >
              <Plus className="size-4" /> Registrar Ingreso
            </motion.button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="h-72 rounded-[3rem] shimmer opacity-20" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div 
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {data.map((h, i) => (
                <motion.div 
                  key={h.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white border-2 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group ${isAlertActive(h.alert_time) ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(h.status)}`}>
                        {h.status}
                    </div>
                    <button className="text-slate-300 hover:text-slate-600 transition-colors">
                        <EllipsisVertical className="size-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="size-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 font-black text-2xl group-hover:scale-110 transition-transform">
                      {h.patient_name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">{h.patient_name}</h3>
                      <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">
                        {getDaysElapsed(h.entry_date)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                        <Thermometer className="size-4 text-primary" />
                        <span className="text-sm font-bold tracking-tight">Evolución: {h.reason}</span>
                    </div>
                    
                    <div className={`p-5 rounded-3xl transition-all ${isAlertActive(h.alert_time) ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <TriangleAlert className={`size-3 ${isAlertActive(h.alert_time) ? 'text-white' : 'text-amber-500'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isAlertActive(h.alert_time) ? 'text-white' : 'text-slate-400'}`}>Alerta Programada</span>
                            </div>
                            <span className={`text-[10px] font-black ${isAlertActive(h.alert_time) ? 'text-white/80' : 'text-slate-400'}`}>{h.alert_time}</span>
                        </div>
                        <p className={`text-xs font-bold leading-relaxed ${isAlertActive(h.alert_time) ? 'text-white' : 'text-slate-700'}`}>{h.alert_message}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                    <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Médico Cargo</p>
                        <p className="text-xs font-bold text-slate-600">Dr. {h.doctor_name}</p>
                    </div>
                    <button className="bg-slate-900 text-white rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95">
                        Ver Detalles
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-[2.8rem] overflow-hidden shadow-premium"
            >
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Hosp.</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerta</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map(h => (
                    <tr key={h.id} className={`hover:bg-slate-50/50 transition-colors group ${isAlertActive(h.alert_time) ? 'bg-primary/5' : ''}`}>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                            {h.patient_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{h.patient_name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black">{h.reason}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusStyle(h.status)}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-sm font-bold text-slate-500">
                        {getDaysElapsed(h.entry_date)}
                      </td>
                      <td className="px-10 py-6">
                        <div className={`flex items-center gap-2 ${isAlertActive(h.alert_time) ? 'text-primary' : 'text-slate-400'}`}>
                          <Clock className={`size-4 ${isAlertActive(h.alert_time) ? 'animate-spin-slow' : ''}`} />
                          <span className="text-xs font-black">{h.alert_time}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <CircleCheck className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
