import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { medicalRecordService, MedicalRecord } from '../services/medicalRecordService';
import { patientService, Patient } from '../services/patientService';
import { userService, User } from '../services/userService';
import { uploadFileAndGetUrl } from '../lib/storage';
import { 
  Search, 
  Plus, 
  Stethoscope, 
  User as UserIcon, 
  Clock, 
  ChevronRight, 
  FileText, 
  Pill, 
  Activity,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  History,
  ClipboardList,
  Upload,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);

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
      const docList = uData.filter(u => u.role === 'Doctor');
      setDoctors(docList);
      
      // Intentar pre-seleccionar el primer paciente si no hay uno seleccionado
      if (pData.length > 0 && !selectedPatientId) {
        setSelectedPatientId(pData[0].id);
      }
    } catch (error) {
      console.error("Error loading clinical data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (pId?: number) => {
    setEditingRecord(null);
    setFormData({
      patient_id: pId || selectedPatientId || (patients[0]?.id || 0),
      doctor_id: doctors[0]?.id || 0,
      observations: '',
      diagnosis: '',
      treatment: '',
      file_url: ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: MedicalRecord) => {
    setEditingRecord(record);
    setFormData({
      patient_id: record.patient_id,
      doctor_id: record.doctor_id,
      observations: record.observations,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      file_url: record.file_url || ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let finalFileUrl = formData.file_url;

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        finalFileUrl = await uploadFileAndGetUrl(selectedFile);
      }

      if (editingRecord) {
        await medicalRecordService.update(editingRecord.id, {
          ...formData,
          file_url: finalFileUrl,
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
        });
      } else {
        await medicalRecordService.create({
          ...formData,
          file_url: finalFileUrl,
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
          visit_date: Date.now(),
        });
      }
      setIsModalOpen(false);
      setSelectedFile(null);
      loadData();
    } catch (error: any) {
      const errorMsg = error.message || (typeof error === 'string' ? error : 'Error desconocido');
      alert(`Error al guardar: ${errorMsg}`);
      console.error("Error completo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta entrada?')) return;
    try {
      await medicalRecordService.delete(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientRecords = useMemo(() => {
    return records.filter(r => r.patient_id === selectedPatientId);
  }, [records, selectedPatientId]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen bg-slate-50 overflow-hidden">
      
      {/* Header Fijo */}
      <header className="shrink-0 p-8 pb-4 flex items-center justify-between">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <ClipboardList className="size-10 text-primary" />
             Expedientes Maestros
           </h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Gestión Centralizada de Historial Clínico</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-black text-slate-900 uppercase">{patients.length} Pacientes</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{records.length} Entradas Totales</span>
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-8 pt-4 gap-8">
        
        {/* Lado Izquierdo: Lista de Pacientes */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6">
           <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              />
           </div>

           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredPatients.map(patient => (
                <motion.button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  whileHover={{ x: 5 }}
                  className={`w-full p-5 rounded-[2rem] border transition-all flex items-center gap-4 text-left group
                    ${selectedPatientId === patient.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200/50' 
                      : 'bg-white border-slate-100 hover:border-primary/30 shadow-sm'}`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0
                    ${selectedPatientId === patient.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors'}`}>
                    {patient.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black tracking-tight truncate ${selectedPatientId === patient.id ? 'text-white' : 'text-slate-900'}`}>{patient.name}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${selectedPatientId === patient.id ? 'text-primary/70' : 'text-slate-400'}`}>
                      {patient.species} • {patient.breed}
                    </p>
                  </div>
                  <ChevronRight className={`size-4 transition-transform ${selectedPatientId === patient.id ? 'text-primary rotate-90' : 'text-slate-300 group-hover:text-primary'}`} />
                </motion.button>
              ))}
           </div>
        </div>

        {/* Lado Derecho: Contenido del Expediente */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden flex flex-col relative">
           {selectedPatient ? (
             <>
               {/* Cabecera del Paciente Selecciónado */}
               <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shrink-0 bg-slate-50/40">
                  <div className="flex items-start lg:items-center gap-6">
                     <div className="size-24 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-slate-300 ring-8 ring-white shrink-0">
                        {selectedPatient.name[0]}
                     </div>
                     <div className="space-y-3">
                        <div>
                           <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{selectedPatient.name}</h2>
                           <p className="text-primary font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                             <UserIcon className="size-3" /> Propietario: <span className="text-slate-900">{selectedPatient.owner_name || 'Desconocido'}</span>
                           </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <div className="size-1.5 bg-slate-300 rounded-full"></div> {selectedPatient.species}
                           </span>
                           <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             {selectedPatient.breed}
                           </span>
                           <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             {selectedPatient.age_months} Meses
                           </span>
                           <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             {selectedPatient.weight_kg} Kg
                           </span>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => handleOpenAddModal()}
                    className="bg-primary hover:bg-slate-900 text-white font-black py-4.5 px-10 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 group uppercase text-xs tracking-widest"
                  >
                    <Plus className="size-5 group-hover:rotate-90 transition-transform" />
                    Nueva Entrada
                  </button>
               </div>

               {/* Timeline de Entradas */}
               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
                  {patientRecords.length > 0 ? (
                    <div className="relative pl-8 border-l-2 border-slate-100 space-y-12 py-4">
                       {patientRecords.map((record, index) => (
                         <motion.div 
                           key={record.id}
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: index * 0.05 }}
                           className="relative"
                         >
                            {/* Punto en el Timeline */}
                            <div className="absolute -left-[41px] top-0 size-5 rounded-full border-4 border-white bg-primary shadow-sm ring-4 ring-slate-50"></div>
                            
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                               <div className="w-full lg:w-48 shrink-0">
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                     <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Calendar className="size-3" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">Fecha de Visita</span>
                                     </div>
                                     <p className="text-base font-black text-slate-900">
                                        {new Date(record.visit_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                     </p>
                                     <div className="mt-3 pt-3 border-t border-slate-200/50">
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                           <Stethoscope className="size-3" />
                                           <span className="text-[9px] font-black uppercase tracking-[0.1em]">Atendido por</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 truncate">{record.doctor_name || 'Dr. Sin Asignar'}</p>
                                     </div>
                                  </div>
                               </div>

                               <div className="flex-1 bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all group relative">
                                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => handleOpenEditModal(record)} className="size-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                                        <Edit2 className="size-4" />
                                     </button>
                                     <button onClick={() => handleDelete(record.id)} className="size-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                                        <Trash2 className="size-4" />
                                     </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                     <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                           <div className="size-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                              <Activity className="size-4" />
                                           </div>
                                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Diagnóstico Clínico</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-900 tracking-tight leading-snug">{record.diagnosis}</p>
                                     </div>

                                     <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                           <div className="size-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                              <Pill className="size-4" />
                                           </div>
                                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Plan Terapéutico</span>
                                        </div>
                                        <p className="font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-200 pl-4 bg-indigo-50/30 py-2 rounded-r-xl">{record.treatment}</p>
                                     </div>
                                  </div>

                                  <div className="space-y-3">
                                     <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-slate-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Observaciones Detalladas</span>
                                     </div>
                                     <div className="p-6 bg-white border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 leading-relaxed shadow-inner">
                                        {record.observations || 'Sin observaciones detalladas registradas para esta visita.'}
                                     </div>
                                  </div>
                                  
                                  {record.file_url && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Adjuntos: 01 ARCHIVO CLÍNICO</span>
                                       <a href={record.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-primary hover:underline uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                                          Visualizar Documento <ChevronRight className="size-3" />
                                       </a>
                                    </div>
                                  )}
                               </div>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 py-20">
                       <div className="size-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100">
                          <History className="size-14 text-slate-200" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Historial Vacío</h3>
                       <p className="text-slate-400 font-bold text-sm max-w-xs leading-relaxed">Este paciente aún no registra entradas en su historial médico digital.</p>
                       <button 
                         onClick={() => handleOpenAddModal()}
                         className="mt-8 px-8 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                       >
                         Crear Primera Entrada
                       </button>
                    </div>
                  )}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                <div className="size-40 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 relative">
                   <Stethoscope className="size-16 text-slate-200" />
                   <div className="absolute inset-0 border-4 border-dashed border-slate-100 rounded-full animate-spin-slow"></div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Selecciona un Paciente</h2>
                <p className="max-w-md text-slate-400 font-bold text-sm leading-relaxed">Utiliza la lista de la izquierda para acceder al historial clínico maestro de cada paciente.</p>
             </div>
           )}
        </div>

      </div>

      {/* Modal para Agregar/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-[3.5rem] shadow-premium overflow-hidden">
              <form onSubmit={handleSave} className="flex flex-col max-h-[90vh]">
                 {/* Header Modal */}
                 <div className="bg-slate-900 p-10 pb-12 relative overflow-hidden shrink-0">
                     <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                           {editingRecord ? 'Editar Consulta' : 'Nueva Consulta Clínica'}
                        </h2>
                        <p className="text-primary font-bold text-xs uppercase tracking-[0.3em]">
                           {editingRecord ? `Modificando registro ID #${editingRecord.id}` : `Expediente de ${selectedPatient?.name}`}
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
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Médico Tratante</label>
                           <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                                className="input-master !pl-20 text-left flex items-center justify-between group"
                              >
                                <UserIcon className="absolute left-7 top-1/2 -translate-y-1/2 text-primary size-5" />
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
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Paciente de Referencia</label>
                          <div className="relative">
                             <ClipboardList className="absolute left-7 top-1/2 -translate-y-1/2 text-primary size-5" />
                             <select 
                               className="input-master !pl-20 opacity-80 pointer-events-none bg-slate-50" 
                               value={formData.patient_id} 
                               disabled
                             >
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Diagnóstico Médico</label>
                       <div className="relative">
                          <Activity className="absolute left-7 top-10 text-emerald-500 size-5" />
                          <textarea 
                             className="input-master !pl-20 h-32 !pt-10 leading-relaxed" 
                             placeholder="Describa el diagnóstico final tras la evaluación..." 
                             value={formData.diagnosis} 
                             onChange={e => setFormData({...formData, diagnosis: e.target.value})} 
                             required 
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Tratamiento y Receta</label>
                       <div className="relative">
                          <Pill className="absolute left-7 top-10 text-indigo-500 size-5" />
                          <textarea 
                             className="input-master !pl-20 h-32 !pt-10 leading-relaxed bg-indigo-50/10" 
                             placeholder="Medicamentos, dosis y frecuencia..." 
                             value={formData.treatment} 
                             onChange={e => setFormData({...formData, treatment: e.target.value})} 
                             required 
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Observaciones Clínicas (Uso Interno)</label>
                       <textarea 
                          className="input-master h-32 pt-5 leading-relaxed" 
                          placeholder="Detalles adicionales del examen físico, comportamiento o hallazgos secundarios..." 
                          value={formData.observations} 
                          onChange={e => setFormData({...formData, observations: e.target.value})} 
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block">Documentación Adjunta (PDF o Imagen)</label>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                             <input 
                               type="file"
                               id="file-upload"
                               className="hidden"
                               accept=".pdf,image/*"
                               onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                             />
                             <label 
                               htmlFor="file-upload" 
                               className={`flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                                 ${selectedFile 
                                   ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                   : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-white hover:border-primary/30'}`}
                             >
                                {selectedFile ? <CheckCircle2 className="size-5" /> : <Upload className="size-5" />}
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                   {selectedFile ? 'Archivo Seleccionado' : 'Subir Documento'}
                                </span>
                             </label>
                          </div>

                          <div className="relative">
                             <FileText className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 size-5" />
                             <input 
                                type="url"
                                className="input-master !pl-20 text-[10px]" 
                                placeholder="O pegue URL externa..." 
                                value={formData.file_url} 
                                onChange={e => setFormData({...formData, file_url: e.target.value})} 
                             />
                          </div>
                       </div>
                       
                       {selectedFile && (
                         <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                            <span className="text-[9px] font-bold text-slate-500 truncate max-w-[200px]">{selectedFile.name}</span>
                            <button type="button" onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-500">
                               <X className="size-4" />
                            </button>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Footer Modal */}
                 <div className="p-10 border-t border-slate-50 flex gap-4 shrink-0">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-[1.5rem] font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50 transition-colors" disabled={isUploading}>Cerrar</button>
                    <button 
                      type="submit" 
                      className={`flex-[2] py-5 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3
                        ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 shadow-slate-200 hover:bg-primary'}`}
                      disabled={isUploading}
                    >
                       {isUploading ? (
                         <>
                           <Loader2 className="size-5 animate-spin" />
                           Subiendo a Supabase...
                         </>
                       ) : (
                         editingRecord ? 'Actualizar Registro Maestro' : 'Publicar Entrada Clínica'
                       )}
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
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .shadow-premium-dark {
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
        }
      `}</style>
    </div>
  );
}
