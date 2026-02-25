import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { hospitalizationService, Hospitalization } from '../services/hospitalizationService';
import { patientService, Patient } from '../services/patientService';
import { userService, User } from '../services/userService';
import { 
  Activity, 
  Thermometer, 
  Heart, 
  TriangleAlert, 
  CircleCheck, 
  EllipsisVertical, 
  Plus, 
  Clock, 
  X, 
  Edit2, 
  Trash2, 
  User as UserIcon,
  Stethoscope,
  ClipboardList,
  ChevronRight,
  Search
} from 'lucide-react';

export default function HospitalizationPage() {
  const [data, setData] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [now, setNow] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospitalization, setEditingHospitalization] = useState<Hospitalization | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    patient_id: 0,
    doctor_id: 0,
    reason: '',
    diagnosis_preliminary: '',
    alert_message: '',
    alert_time: '',
    status: 'Observación' as Hospitalization['status'],
    treatment_plan: '',
    notes: '',
    weight_entry: 0
  });
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setNow(new Date()), 60000); // Actualizar cada minuto
    return () => clearInterval(timer);
  }, []);



  const loadData = async () => {
    try {
      setLoading(true);
      const [hData, pData, uData] = await Promise.all([
        hospitalizationService.getAll(),
        patientService.getAll(),
        userService.getAll()
      ]);
      setData(hData);
      setPatients(pData);
      setDoctors(uData.filter(u => u.role === 'Doctor'));
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleOpenAddModal = () => {
    setEditingHospitalization(null);
    setSelectedPatient(null);
    setPatientSearch('');
    setFormData({
      patient_id: 0,
      doctor_id: doctors[0]?.id || 0,
      reason: '',
      diagnosis_preliminary: '',
      alert_message: '',
      alert_time: '',
      status: 'Observación',
      treatment_plan: '',
      notes: '',
      weight_entry: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (h: Hospitalization) => {
    setEditingHospitalization(h);
    const patientObj = patients.find(p => p.id === h.patient_id);
    setSelectedPatient(patientObj || null);
    setFormData({
      patient_id: h.patient_id,
      doctor_id: h.doctor_id,
      reason: h.reason,
      diagnosis_preliminary: h.diagnosis_preliminary,
      alert_message: h.alert_message || '',
      alert_time: h.alert_time || '',
      status: h.status,
      treatment_plan: h.treatment_plan || '',
      notes: h.notes || '',
      weight_entry: h.weight_entry || 0
    });
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHospitalization) {
        await hospitalizationService.update(editingHospitalization.id, formData);
      } else {
        await hospitalizationService.create({
          ...formData,
          entry_date: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el internamiento");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desea dar de alta este paciente? Esto eliminará el registro de internamiento activo.')) return;
    try {
      await hospitalizationService.delete(id);
      loadData();
      setActiveMenuId(null);
    } catch (error) {
      console.error(error);
      alert("Error al dar de alta");
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
              onClick={handleOpenAddModal}
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
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === h.id ? null : h.id)}
                        className="text-slate-300 hover:text-slate-600 transition-colors"
                      >
                          <EllipsisVertical className="size-5" />
                      </button>
                      <AnimatePresence>
                        {activeMenuId === h.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-8 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                          >
                            <button onClick={() => handleOpenEditModal(h)} className="w-full px-6 py-3 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                              <Edit2 className="size-4 text-primary" /> Editar Registro
                            </button>
                            <button onClick={() => handleDelete(h.id)} className="w-full px-6 py-3 text-left text-xs font-black text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                              <Trash2 className="size-4" /> Dar de Alta
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
                      <td className="px-10 py-6 text-right relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === h.id ? null : h.id)}
                          className="text-slate-300 hover:text-slate-600 transition-colors"
                        >
                          <EllipsisVertical className="size-5 ml-auto" />
                        </button>
                        <AnimatePresence>
                          {activeMenuId === h.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, x: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9, x: -20 }}
                              className="absolute right-20 top-4 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                            >
                              <button onClick={() => handleOpenEditModal(h)} className="w-full px-6 py-3 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                <Edit2 className="size-4 text-primary" /> Editar Registro
                              </button>
                              <button onClick={() => handleDelete(h.id)} className="w-full px-6 py-3 text-left text-xs font-black text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                <Trash2 className="size-4" /> Dar de Alta
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <button onClick={() => setActiveMenuId(null)} className={`fixed inset-0 z-40 ${activeMenuId ? 'block' : 'hidden'}`} />

      {/* Modal para Registrar/Editar Ingreso */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-premium overflow-hidden">
               <form onSubmit={handleSave} className="flex flex-col max-h-[90vh]">
                  {/* Header Modal */}
                  <div className="bg-slate-900 p-10 pb-12 relative overflow-hidden shrink-0">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                     <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                           {editingHospitalization ? 'Editar Internamiento' : 'Registrar Ingreso'}
                        </h2>
                        <p className="text-primary font-bold text-xs uppercase tracking-[0.3em]">
                           {editingHospitalization ? `Modificando registro ID #${editingHospitalization.id}` : 'Monitoreo clínico de paciente activo'}
                        </p>
                     </div>
                     <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }} 
                        className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-[60]"
                     >
                        <X className="size-8" />
                     </button>
                  </div>

                  {/* Body Modal */}
                  <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Paciente</label>
                           {selectedPatient ? (
                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-[2rem] border-2 border-primary/20 shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl">
                                     {selectedPatient.name[0]}
                                  </div>
                                  <div>
                                     <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">{selectedPatient.name}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedPatient.owner_name}</p>
                                  </div>
                               </div>
                               {!editingHospitalization && (
                                 <button type="button" onClick={() => {setSelectedPatient(null); setFormData({...formData, patient_id: 0});}} className="size-10 rounded-xl hover:bg-white text-primary flex items-center justify-center transition-colors shadow-sm">
                                    <X className="size-5" />
                                 </button>
                               )}
                            </div>
                           ) : (
                            <div className="relative group">
                               <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-primary size-5" />
                               <input 
                                 className="input-master !pl-20 py-5" 
                                 placeholder="Buscar paciente por nombre..." 
                                 value={patientSearch} 
                                 onChange={e => {setPatientSearch(e.target.value); setShowPatientResults(true);}} 
                               />
                               <AnimatePresence>
                                 {showPatientResults && patientSearch && (
                                   <motion.div 
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 5 }}
                                     exit={{ opacity: 0, scale: 0.95 }}
                                     className="absolute z-50 left-0 right-0 top-full bg-white border border-slate-100 rounded-[2.5rem] shadow-premium-dark p-4 overflow-hidden"
                                   >
                                      {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).slice(0, 5).map(p => (
                                        <button 
                                          key={p.id} 
                                          type="button" 
                                          onClick={() => {
                                            setSelectedPatient(p); 
                                            setFormData({...formData, patient_id: p.id});
                                            setShowPatientResults(false);
                                          }} 
                                          className="w-full p-4 text-left hover:bg-slate-50 rounded-3xl flex items-center justify-between group transition-all"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors uppercase">
                                              {p.name[0]}
                                            </div>
                                            <div>
                                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-primary">{p.name}</p>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.owner_name}</p>
                                            </div>
                                          </div>
                                          <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                             <ChevronRight className="size-4" />
                                          </div>
                                        </button>
                                      ))}
                                      {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                                        <div className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No se encontraron mascotas</div>
                                      )}
                                   </motion.div>
                                 )}
                               </AnimatePresence>
                            </div>
                           )}
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Médico Responsable</label>
                           <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                                className="input-master !pl-20 text-left flex items-center justify-between group"
                              >
                                <Stethoscope className="absolute left-7 top-1/2 -translate-y-1/2 text-primary size-5" />
                                <span className={formData.doctor_id ? 'text-slate-900' : 'text-slate-400 font-bold'}>
                                  {doctors.find(d => d.id === formData.doctor_id)?.full_name || 'Seleccionar Doctor'}
                                </span>
                                <ChevronRight className={`size-4 text-slate-300 transition-transform ${isDoctorDropdownOpen ? 'rotate-90' : ''}`} />
                              </button>

                              <AnimatePresence>
                                {isDoctorDropdownOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute z-[110] w-full left-0 bg-white rounded-[2rem] shadow-premium-dark border border-slate-100 overflow-hidden py-3"
                                  >
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                      {doctors.map(doctor => (
                                        <button
                                          key={doctor.id}
                                          type="button"
                                          onClick={() => {
                                             setFormData({...formData, doctor_id: doctor.id});
                                             setIsDoctorDropdownOpen(false);
                                          }}
                                          className={`w-full px-8 py-4 text-left text-sm transition-all flex items-center gap-4
                                            ${formData.doctor_id === doctor.id 
                                              ? 'bg-primary/10 text-primary font-black' 
                                              : 'text-slate-600 font-bold hover:bg-slate-50 hover:text-primary'}`}
                                        >
                                          <div className={`size-8 rounded-xl flex items-center justify-center font-black text-xs
                                            ${formData.doctor_id === doctor.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {doctor.full_name[0]}
                                          </div>
                                          {doctor.full_name}
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Motivo de Ingreso</label>
                           <div className="relative">
                              <ClipboardList className="absolute left-7 top-1/2 -translate-y-1/2 text-primary size-5" />
                              <input 
                                className="input-master !pl-20" 
                                value={formData.reason} 
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                                required
                                placeholder="Ej: Vómitos persistentes, Cirugía post-op..."
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Estado Actual</label>
                           <select 
                             className="input-master" 
                             value={formData.status} 
                             onChange={e => setFormData({...formData, status: e.target.value as any})}
                           >
                              <option value="Observación">Observación</option>
                              <option value="Estable">Estable</option>
                              <option value="Crítico">Crítico</option>
                              <option value="Alta">Alta</option>
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Hora de Alerta</label>
                           <input 
                             type="time"
                             className="input-master" 
                             value={formData.alert_time} 
                             onChange={e => setFormData({...formData, alert_time: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Mensaje de Alerta</label>
                           <input 
                             className="input-master" 
                             value={formData.alert_message} 
                             onChange={e => setFormData({...formData, alert_message: e.target.value})}
                             placeholder="Ej: Administrar medicamento vía IV..."
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Plan de Tratamiento</label>
                        <textarea 
                           className="input-master h-28 pt-4" 
                           placeholder="Describa el protocolo médico a seguir..." 
                           value={formData.treatment_plan} 
                           onChange={e => setFormData({...formData, treatment_plan: e.target.value})} 
                        />
                     </div>
                  </div>

                  {/* Footer Modal */}
                  <div className="p-10 border-t border-slate-50 flex gap-4 shrink-0">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-[1.5rem] font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50 transition-colors">Cancelar</button>
                     <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-primary transition-all">
                        {editingHospitalization ? 'Actualizar Internamiento' : 'Confirmar Ingreso'}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .input-master { 
          width: 100%; 
          background-color: #ffffff; 
          border: 2px solid #f1f5f9; 
          border-radius: 1.5rem; 
          padding: 1rem 1.5rem; 
          font-size: 0.9rem; 
          font-weight: 700; 
          color: #1e293b; 
          outline: none; 
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); 
        }
        .input-master:focus { 
          border-color: #06b6d4; 
          background-color: #fff; 
          box-shadow: 0 10px 30px -10px rgba(6,182,212,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
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
        .shadow-premium-dark {
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
        }
      `}</style>
    </div>
  );
}
