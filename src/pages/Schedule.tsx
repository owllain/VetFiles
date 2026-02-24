import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
  id: string;
  petName: string;
  ownerName: string;
  type: 'Consulta' | 'Vacuna' | 'Cirugía' | 'Examen';
  doctor: string;
  assistant: string;
  startTime: Date;
  duration: number;
}

interface ScheduleProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

const APPOINTMENT_TYPES = {
  Consulta: { duration: 39, color: 'bg-primary', icon: 'stethoscope' },
  Vacuna: { duration: 20, color: 'bg-emerald-500', icon: 'vaccines' },
  Cirugía: { duration: 120, color: 'bg-secondary', icon: 'precision_manufacturing' },
  Examen: { duration: 30, color: 'bg-accent', icon: 'biotech' },
};

export default function Schedule({ appointments, setAppointments }: ScheduleProps) {
  const [view, setView] = useState<'Día' | 'Semana' | 'Mes'>('Semana');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    type: 'Consulta' as keyof typeof APPOINTMENT_TYPES,
    doctor: '',
    assistant: '',
    time: '09:00',
    date: new Date().toISOString().split('T')[0]
  });

  const handleOpenModal = (app: Appointment | null = null) => {
    if (app) {
      setEditingAppointment(app);
      setFormData({
        petName: app.petName,
        ownerName: app.ownerName,
        type: app.type,
        doctor: app.doctor,
        assistant: app.assistant,
        time: `${app.startTime.getHours().toString().padStart(2, '0')}:${app.startTime.getMinutes().toString().padStart(2, '0')}`,
        date: app.startTime.toISOString().split('T')[0]
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        petName: '',
        ownerName: '',
        type: 'Consulta',
        doctor: '',
        assistant: '',
        time: '09:00',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (editingAppointment && window.confirm(`¿Seguro que desea eliminar la cita de ${editingAppointment.petName}?`)) {
      setAppointments(appointments.filter(a => a.id !== editingAppointment.id));
      setIsModalOpen(false);
    }
  };

  const getDaysToShow = () => {
    if (view === 'Día') return [new Date(currentDate)];
    if (view === 'Semana') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
      });
    }
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const daysToShow = getDaysToShow();
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const handleNavigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'Día') newDate.setDate(currentDate.getDate() + direction);
    else if (view === 'Semana') newDate.setDate(currentDate.getDate() + (direction * 7));
    else if (view === 'Mes') newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = formData.time.split(':').map(Number);
    const start = new Date(formData.date);
    start.setHours(hours, minutes, 0, 0);

    const appData: Appointment = {
      id: editingAppointment ? editingAppointment.id : Math.random().toString(36).substr(2, 9),
      petName: formData.petName,
      ownerName: formData.ownerName,
      type: formData.type,
      doctor: formData.doctor,
      assistant: formData.assistant,
      startTime: start,
      duration: APPOINTMENT_TYPES[formData.type].duration
    };

    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === editingAppointment.id ? appData : a));
    } else {
      setAppointments([...appointments, appData]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="px-8 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agenda</h1>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['Día', 'Semana', 'Mes'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  view === v ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 gap-4">
             <button onClick={() => handleNavigate(-1)} className="material-symbols-outlined text-slate-400 hover:text-primary">chevron_left</button>
             <span className="text-sm font-black text-slate-700 min-w-40 text-center uppercase tracking-widest">
               {view === 'Mes' 
                 ? currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                 : view === 'Día'
                 ? currentDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', weekday: 'short' })
                 : `${daysToShow[0].toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${daysToShow[6].toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`}
             </span>
             <button onClick={() => handleNavigate(1)} className="material-symbols-outlined text-slate-400 hover:text-primary">chevron_right</button>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-hover text-white font-black py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-xl">add_circle</span>
            Nueva Cita
          </button>
        </div>
      </header>

      {view !== 'Mes' ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex border-b border-slate-200 bg-slate-50/50 shrink-0">
            <div className="w-20 shrink-0 border-r border-slate-200"></div>
            {daysToShow.map((day) => (
              <div key={day.toISOString()} className={`flex-1 py-4 text-center border-r border-slate-200 last:border-0 ${day.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                <p className={`text-xl font-black ${day.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-slate-900'}`}>{day.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto relative scrollbar-hide">
            <div className="flex min-h-full relative">
              <div className="w-20 shrink-0 bg-white border-r border-slate-200">
                {timeSlots.map(hour => (
                  <div key={hour} className="h-24 px-3 py-2 text-right">
                    <span className="text-[10px] font-black text-slate-300 font-mono">{hour.toString().padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 flex relative">
                {daysToShow.map((day) => (
                  <div key={day.toISOString()} className="flex-1 border-r border-slate-100 last:border-0 relative">
                    {timeSlots.map(hour => <div key={hour} className="h-24 border-b border-slate-50"></div>)}
                    {appointments.filter(app => app.startTime.toDateString() === day.toDateString()).map(app => (
                        <motion.div key={app.id} 
                          onClick={() => handleOpenModal(app)}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          style={{ top: (app.startTime.getHours() * 96) + (app.startTime.getMinutes() * 96 / 60) + 4, height: (app.duration * 96 / 60) - 8 }}
                          className={`absolute left-2 right-2 rounded-xl p-3 shadow-lg border-l-4 overflow-hidden z-10 cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all ${APPOINTMENT_TYPES[app.type].color} text-white`}>
                          <div className="flex justify-between items-start gap-1 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-80 truncate">{app.type}</span>
                            <span className="material-symbols-outlined text-sm">{APPOINTMENT_TYPES[app.type].icon}</span>
                          </div>
                          <h4 className="text-xs font-black truncate uppercase">{app.petName}</h4>
                          <p className="text-[8px] font-bold opacity-80 truncate uppercase">{app.ownerName}</p>
                        </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="bg-slate-50 p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
            {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white/50 h-32"></div>
            ))}
            {daysToShow.map(day => (
              <div key={day.toISOString()} className={`bg-white h-32 p-3 border-slate-100 relative group transition-colors hover:bg-slate-50 ${day.toDateString() === new Date().toDateString() ? 'ring-2 ring-inset ring-primary' : ''}`}>
                <span className={`text-xs font-black ${day.getMonth() !== currentDate.getMonth() ? 'text-slate-300' : 'text-slate-900'}`}>{day.getDate()}</span>
                <div className="mt-1 space-y-1">
                  {appointments.filter(app => app.startTime.toDateString() === day.toDateString()).map(app => (
                    <div key={app.id} 
                      onClick={() => handleOpenModal(app)}
                      className={`${APPOINTMENT_TYPES[app.type].color} text-[8px] text-white p-1 rounded font-black uppercase truncate cursor-pointer hover:brightness-110`}>
                      {app.startTime.getHours()}:{app.startTime.getMinutes().toString().padStart(2, '0')} {app.petName}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Nueva / Editar Cita */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-10 shadow-premium">
              <form onSubmit={handleSaveAppointment} className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingAppointment ? 'Editar Cita' : 'Agendar Cita'}</h2>
                    <p className="text-slate-500 font-medium">{editingAppointment ? 'Modifica los detalles del turno.' : 'Asigna servicios al calendario clínico.'}</p>
                  </div>
                  {editingAppointment && (
                    <button type="button" onClick={handleDelete} className="size-12 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center group">
                      <span className="material-symbols-outlined group-hover:scale-110 transition-transform">delete</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Paciente</label>
                    <input className="input-medical" placeholder="Luna" value={formData.petName} onChange={e => setFormData({...formData, petName: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Propietario</label>
                    <input className="input-medical" placeholder="Carlos G." value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fecha</label>
                    <input type="date" className="input-medical" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hora</label>
                    <input type="time" className="input-medical" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipo de Servicio</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(APPOINTMENT_TYPES).map(t => (
                      <button key={t} type="button" onClick={() => setFormData({...formData, type: t as any})}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${formData.type === t ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-sm">{APPOINTMENT_TYPES[t as keyof typeof APPOINTMENT_TYPES].icon}</span>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none">{t}</p>
                          <p className="text-[8px] font-bold opacity-70">{APPOINTMENT_TYPES[t as keyof typeof APPOINTMENT_TYPES].duration} min</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Doctor</label>
                    <input className="input-medical" placeholder="Dr. Pérez" value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Asistente</label>
                    <input className="input-medical" placeholder="Marta" value={formData.assistant} onChange={e => setFormData({...formData, assistant: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4.5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 hover:bg-primary transition-all">
                    {editingAppointment ? 'Guardar Cambios' : 'Agendar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .input-medical { width: 100%; background-color: #f8fafc; border: 2px solid #f1f5f9; border-radius: 1rem; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 700; color: #1e293b; outline: none; transition: all 0.2s; }
        .input-medical:focus { border-color: #06b6d4; background-color: white; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}