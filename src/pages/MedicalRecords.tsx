import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { medicalRecordService, MedicalRecord } from '../services/medicalRecordService';
import { patientService, Patient } from '../services/patientService';
import { userService, User } from '../services/userService';

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    patient_id: 0,
    doctor_id: 0,
    observations: '',
    diagnosis: '',
    treatment: '',
    file_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, pData, uData] = await Promise.all([
        medicalRecordService.getAll(),
        patientService.getAll(),
        userService.getAll()
      ]);
      setRecords(rData);
      setPatients(pData);
      setDoctors(uData.filter(u => u.role === 'Doctor'));
      
      if (pData.length > 0 && uData.length > 0) {
        setFormData(prev => ({ 
            ...prev, 
            patient_id: pData[0].id, 
            doctor_id: uData.find(u => u.role === 'Doctor')?.id || 0 
        }));
      }
    } catch (error) {
      console.error("Error loading clinical data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicalRecordService.create({
        ...formData,
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        visit_date: Date.now(),
      });
      setIsModalOpen(false);
      setFormData({ 
        patient_id: patients[0]?.id || 0, 
        doctor_id: doctors[0]?.id || 0, 
        observations: '', 
        diagnosis: '', 
        treatment: '', 
        file_url: '' 
      });
      loadData();
    } catch (error) {
      alert("Error al guardar el expediente");
      console.error(error);
    }
  };

  const filteredRecords = records.filter(r => 
    r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Expedientes Clínicos</h1>
          <p className="text-slate-500 font-medium tracking-tight">Historial médico completo de todos los pacientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-primary/20 self-start group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_notes</span>
          Nueva Entrada
        </button>
      </header>

      <div className="mb-8 relative max-w-2xl">
        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          type="text" 
          placeholder="Buscar por paciente o diagnóstico..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-black uppercase text-xs tracking-widest">Consultando expedientes...</div>
        ) : filteredRecords.map((record) => (
          <motion.div 
            key={record.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-start"
          >
            <div className="w-full md:w-64 shrink-0">
               <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                     {record.patient_name?.[0]}
                  </div>
                  <div>
                     <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none">{record.patient_name}</h3>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                        {new Date(record.visit_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </span>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor a cargo</p>
                  <p className="text-sm font-bold text-slate-700">{record.doctor_name || 'Sin asignar'}</p>
               </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Diagnóstico</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{record.diagnosis}</p>
                 </div>
                 <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">Tratamiento</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{record.treatment}</p>
                 </div>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Observaciones Clínicas</p>
                <p className="text-sm font-medium text-slate-600 italic">"{record.observations}"</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-premium overflow-hidden">
              <form onSubmit={handleSave} className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nueva Entrada Médica</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Paciente</label>
                    <select className="input-medical" value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: Number(e.target.value)})}>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Doctor</label>
                    <select className="input-medical" value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: Number(e.target.value)})}>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Diagnóstico Principal</label>
                  <input className="input-medical" placeholder="P. ej. Dermatitis atópica" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Tratamiento Recomendado</label>
                  <input className="input-medical" placeholder="P. ej. Apoquel 5.4mg cada 12h" value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Observaciones Detalladas</label>
                  <textarea className="input-medical h-32 pt-4" placeholder="Detalles del examen físico..." value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4.5 rounded-2xl font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-slate-200">Guardar en Turso</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .input-medical { width: 100%; background-color: #f8fafc; border: 2px solid #f1f5f9; border-radius: 1.25rem; padding: 0.9rem 1.25rem; font-size: 0.85rem; font-weight: 700; color: #1e293b; outline: none; transition: all 0.2s; }
        .input-medical:focus { border-color: #06b6d4; background-color: white; shadow: 0 0 0 4px rgba(6,182,212,0.1); }
      `}</style>
    </div>
  );
}
