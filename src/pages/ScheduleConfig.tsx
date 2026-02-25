
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { configService, AppointmentTypeConfig } from '../services/configService';
import { Clock, Save, RotateCcw, Stethoscope, Syringe, Activity, Microscope } from 'lucide-react';

export default function ScheduleConfig() {
  const [types, setTypes] = useState<AppointmentTypeConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTypes(configService.getAppointmentTypes());
  }, []);

  const handleDurationChange = (id: string, newDuration: number) => {
    setTypes(prev => prev.map(t => t.id === id ? { ...t, duration: newDuration } : t));
    setHasChanges(true);
  };

  const handleSave = () => {
    configService.saveAppointmentTypes(types);
    setHasChanges(false);
    alert("Configuración de agenda guardada exitosamente.");
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de restablecer los valores predeterminados?")) {
      localStorage.removeItem('vet_appointment_types');
      setTypes(configService.getAppointmentTypes());
      setHasChanges(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'stethoscope': return <Stethoscope className="size-5" />;
      case 'vaccines': return <Syringe className="size-5" />;
      case 'precision_manufacturing': return <Activity className="size-5" />;
      case 'biotech': return <Microscope className="size-5" />;
      default: return <Clock className="size-5" />;
    }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen font-display">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black text-slate-900 tracking-tighter mb-2"
          >
            Gestión de Agenda
          </motion.h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-70">Configuración de Tiempos y Servicios</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={handleReset}
             className="px-6 py-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2"
           >
             <RotateCcw className="size-4" /> Reset
           </button>
           <button 
             onClick={handleSave}
             disabled={!hasChanges}
             className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-xl
               ${hasChanges ? 'bg-slate-900 text-white shadow-slate-200 hover:bg-primary' : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'}`}
           >
             <Save className="size-4" /> Guardar Cambios
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-premium"
         >
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
               <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Clock className="size-6" />
               </div>
               Tiempos por Servicio
            </h2>
            
            <div className="space-y-6">
               {types.map((type) => (
                 <div key={type.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all hover:border-primary/20">
                    <div className="flex items-center gap-4">
                       <div className={`size-12 rounded-2xl ${type.color} text-white flex items-center justify-center shadow-lg`}>
                          {getIcon(type.icon)}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{type.label}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duración por defecto</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-2 shrink-0">
                       <input 
                         type="number" 
                         value={type.duration}
                         onChange={(e) => handleDurationChange(type.id, parseInt(e.target.value) || 0)}
                         className="w-16 text-center font-black text-slate-900 bg-transparent outline-none text-lg"
                       />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">MIN</span>
                    </div>
                 </div>
               ))}
            </div>
         </motion.div>

         <div className="space-y-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
               <h3 className="text-xl font-black tracking-tight mb-4 relative z-10">¿Cómo afecta esto a la Agenda?</h3>
               <p className="text-slate-400 font-bold text-sm leading-relaxed mb-6 relative z-10">
                 Los cambios realizados aquí se aplicarán automáticamente a las nuevas citas que agendes. La duración define el bloque de tiempo que ocupará la cita en la vista de calendario.
               </p>
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Tip de Optimización</p>
                  <p className="text-xs font-bold text-slate-300 italic leading-relaxed">"Recomendamos usar intervalos múltiplos de 15 o 30 minutos para mantener una cuadrícula limpia y profesional."</p>
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-emerald-500 rounded-[3rem] p-10 text-white shadow-xl shadow-emerald-100"
            >
               <h3 className="text-xl font-black tracking-tight mb-2">Vista en Vivo</h3>
               <p className="text-emerald-100 font-bold text-xs uppercase tracking-widest mb-6 opacity-80">Intervalos de 30 minutos habilitados</p>
               <div className="bg-white/20 rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                          <span className="text-[10px] font-black">0{i+8}:00</span>
                          <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-white w-1/2"></div>
                          </div>
                          <span className="text-[10px] font-black opacity-60">0{i+8}:30</span>
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
