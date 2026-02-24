import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment } from '../services/appointmentService';
import { hospitalizationService, Hospitalization } from '../services/hospitalizationService';
import { Calendar, Activity, Clock, AlertCircle, TriangleAlert, Bell, ChevronRight, Syringe, Pill, Thermometer, TrendingUp } from 'lucide-react';

interface DashboardProps {
  appointments: Appointment[];
}

export default function Dashboard({ appointments }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [now] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        const hData = await hospitalizationService.getAll();
        setHospitalizations(hData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    loadData();
  }, []);

  const todayStr = now.toDateString();
  const appointmentsToday = appointments.filter(app => 
    new Date(app.start_time).toDateString() === todayStr
  );

  const pendingAppointments = appointmentsToday.filter(app => 
    new Date(app.start_time) > now
  );

  const pendingSurgeries = appointmentsToday.filter(app => 
    app.type === 'Cirugía' && new Date(app.start_time) > now
  );

  const criticalHospitalizations = hospitalizations.filter(h => h.status === 'Crítico');
  const followUpHospitalizations = hospitalizations.filter(h => h.status !== 'Crítico' && h.status !== 'Alta');

  const stats = [
    { label: 'Pacientes Hoy', value: appointmentsToday.length, icon: Calendar, color: 'bg-primary/10 text-primary', sub: 'Día tranquilo' },
    { label: 'Citas Pendientes', value: pendingAppointments.length, icon: Clock, color: 'bg-accent/10 text-accent', sub: 'Próximas horas' },
    { label: 'Cirugías Hoy', value: pendingSurgeries.length, icon: Activity, color: 'bg-secondary/10 text-secondary', sub: 'Sin cirugías' },
  ];

  return (
    <div className="p-10 bg-slate-50 min-h-screen font-display">
      
      <div className="flex flex-col xl:flex-row gap-10">
        
        {/* Left/Central Main Content */}
        <div className="flex-1 max-w-[1200px]">
          
          <header className="mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black text-slate-900 tracking-tighter mb-4"
            >
              Control Central
            </motion.h1>
            
            {/* Stats Compacted & Aligned Left */}
            <div className="flex flex-wrap gap-4 mb-10">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4 min-w-[220px]"
                  >
                    <div className={`size-12 rounded-2xl ${stat.color} flex items-center justify-center shrink-0`}>
                      <stat.icon className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                    </div>
                  </motion.div>
                ))}
            </div>
          </header>

          {/* URGANCIAS CARD - THE MOST IMPORTANT */}
          <div className="grid grid-cols-1 gap-8">
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white border-2 border-slate-200 rounded-[3.5rem] p-12 shadow-premium relative overflow-hidden flex flex-col min-h-[850px]"
             >
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full -ml-40 -mb-40 blur-3xl opacity-50"></div>

                <div className="flex items-center justify-between mb-12 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="size-16 bg-red-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-red-200 animate-pulse">
                         <Bell className="size-8" />
                      </div>
                      <div>
                         <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Panel de Urgencias</h2>
                         <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Monitoreo Clínico de Internación</p>
                      </div>
                   </div>
                   <div className="hidden md:flex gap-2">
                       <span className="px-4 py-2 bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-200">
                         {criticalHospitalizations.length} Críticos
                       </span>
                       <span className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                         {hospitalizations.length} Hospitalizados
                       </span>
                   </div>
                </div>

                {/* Section 1: PACIENTES CRÍTICOS */}
                <div className="mb-14 relative z-10">
                   <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                      <span className="size-2 bg-red-500 rounded-full animate-ping"></span>
                      Prioridad Inmediata: Pacientes Críticos
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {criticalHospitalizations.length > 0 ? (
                        criticalHospitalizations.map(h => (
                          <motion.div 
                            key={h.id}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.8rem] bg-red-50 border-2 border-red-100 shadow-sm relative overflow-hidden group"
                          >
                             <div className="absolute top-6 right-6 px-3 py-1 bg-white border border-red-100 rounded-full text-[9px] font-black text-red-600">
                               ID #{h.id}
                             </div>
                             <div className="flex items-center gap-5 mb-6">
                                <div className="size-14 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:rotate-6 transition-transform">
                                  {h.patient_name[0]}
                                </div>
                                <div>
                                   <p className="text-2xl font-black text-slate-900 tracking-tight">{h.patient_name}</p>
                                   <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.1em]">{h.reason}</p>
                                </div>
                             </div>
                             <div className="bg-white/80 p-5 rounded-2xl border border-red-50 mb-4">
                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                   <TriangleAlert className="size-4" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Alerta Crítica</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{h.alert_message}"</p>
                             </div>
                             <div className="flex justify-between items-center text-red-500 font-black text-xs">
                                <span>Dr. {h.doctor_name}</span>
                                <div className="flex items-center gap-1">
                                   <Clock className="size-3" />
                                   <span>Revisión: {h.alert_time}</span>
                                </div>
                             </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-2 py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                           <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No hay emergencias críticas en curso</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Section 2: PRÓXIMOS SEGUIMIENTOS */}
                <div className="relative z-10 flex-1">
                   <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Clock className="size-4" />
                      Próximos Seguimientos y Medicación
                   </h3>
                   <div className="space-y-4">
                      {followUpHospitalizations.slice(0, 4).map((h, idx) => (
                        <div key={h.id} className="flex items-center gap-6 p-6 rounded-[2.2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all group">
                           <div className="size-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-primary/50">
                              {idx % 2 === 0 ? <Syringe className="text-primary size-6" /> : <Pill className="text-accent size-6" />}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                 <p className="font-black text-slate-800 text-lg">{h.patient_name}</p>
                                 <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${h.status === 'Observación' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                   {h.status}
                                 </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-500 leading-tight">{h.alert_message}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xl font-black text-slate-900 tracking-tighter">{h.alert_time}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Programado</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   <button className="w-full mt-10 py-5 bg-slate-900 hover:bg-primary text-white font-black rounded-3xl transition-all shadow-xl shadow-slate-200 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98]">
                      Ver Todos los Internamientos <ChevronRight className="size-4" />
                   </button>
                </div>
             </motion.div>

             {/* EVOLUCIÓN INTERNAMIENTOS - BELOW CLINICAL CARD */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-30"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="max-w-md">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="size-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                            <TrendingUp className="size-6" />
                         </div>
                         <h3 className="text-2xl font-black tracking-tight">Evolución de Ocupación</h3>
                      </div>
                      <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8">Estado actual de la clínica. El monitoreo de ocupación influye en la disponibilidad de urgencias y triage.</p>
                      
                      <div className="space-y-8">
                         <div>
                            <div className="flex justify-between items-end mb-4">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Capacidad en Internamiento</span>
                               <span className="text-2xl font-black tracking-tighter">{Math.min(100, (hospitalizations.length / 25) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-1">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(hospitalizations.length / 25) * 100}%` }}
                                 transition={{ duration: 2 }}
                                 className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                               />
                            </div>
                         </div>

                         <div className="flex gap-10">
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Hoy</p>
                               <p className="text-2xl font-black text-white">{hospitalizations.length}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Altas Previstas</p>
                               <p className="text-2xl font-black text-primary">4</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Médicos Activos</p>
                               <p className="text-2xl font-black text-white">3</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 max-w-sm hidden lg:block">
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
                         <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-emerald-500 size-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Estado del Sistema</span>
                         </div>
                         <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="flex items-center justify-between text-xs font-bold text-slate-400">
                                 <span>Nodo de Datos {i}</span>
                                 <span className="text-emerald-500 flex items-center gap-1">Online <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div></span>
                              </div>
                            ))}
                         </div>
                         <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Sync Latency: 45ms</p>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>

        {/* SIDE BAR/AGENDA (Independent Column) */}
        <div className="xl:w-[400px] shrink-0">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-slate-900 xl:sticky xl:top-10 rounded-[3.5rem] p-10 text-white min-h-[600px] shadow-2xl overflow-hidden flex flex-col"
           >
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-4xl font-black tracking-tighter">Agenda</h2>
                 <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Calendar className="text-primary size-6" />
                 </div>
              </div>

              <div className="space-y-6 flex-1">
                 {appointmentsToday.length > 0 ? (
                   appointmentsToday.slice(0, 8).sort((a,b) => a.start_time.localeCompare(b.start_time)).map((app) => (
                     <div key={app.id} className="group flex items-start gap-5 hover:bg-white/5 p-4 rounded-3xl transition-all cursor-pointer border border-transparent hover:border-white/10">
                        <div className="text-primary font-black text-sm tracking-tight pt-1 w-12 text-center">
                           {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-black text-white text-lg tracking-tight truncate group-hover:text-primary transition-colors">{app.patient_name}</p>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-white/10 text-white/60 text-[8px] font-black uppercase rounded-lg tracking-widest">{app.type}</span>
                              <span className="text-[10px] font-bold text-white/30 truncate">Dr. {app.doctor_name}</span>
                           </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center py-20 opacity-20">
                      <Clock className="size-16 mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Sin citas programadas</p>
                   </div>
                 )}
              </div>

              <div className="mt-12 bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                 <div className="flex items-center gap-3 mb-4">
                    <Thermometer className="text-accent size-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Info Quirófano</span>
                 </div>
                 <p className="text-sm font-bold opacity-80 leading-relaxed italic">{pendingSurgeries.length > 0 ? `Atención: Cirugía de ${pendingSurgeries[0].patient_name} hoy.` : 'No hay procedimientos quirúrgicos en cola.'}</p>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
}