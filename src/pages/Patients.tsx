import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cat, Dog, Bird, Bug, HelpCircle, Search, User, X, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { patientService, Patient } from '../services/patientService';
import { ownerService, Owner } from '../services/ownerService';

const SPECIES_OPTIONS = [
  { id: 'Canino', icon: Dog },
  { id: 'Felino', icon: Cat },
  { id: 'Ave', icon: Bird },
  { id: 'Reptil', icon: Bug }, // Bug is a bit off but sometimes used, or we can use generic
  { id: 'Otro', icon: HelpCircle }
];

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 400, damping: 30 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 30, 
    transition: { duration: 0.2, ease: 'easeIn' } 
  }
};

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showOwnerResults, setShowOwnerResults] = useState(false);
  const ownerInputRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    species: 'Canino',
    breed: '',
    age_months: 0,
    weight_kg: 0
  });

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
      if (ownerInputRef.current && !ownerInputRef.current.contains(event.target as Node)) {
        setShowOwnerResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, oData] = await Promise.all([
        patientService.getAll(),
        ownerService.getAll()
      ]);
      setPatients(pData);
      setOwners(oData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      age_months: patient.age_months,
      weight_kg: patient.weight_kg
    });
    const owner = owners.find(o => o.id === patient.owner_id);
    if (owner) setSelectedOwner(owner);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) {
      alert("Debe seleccionar un propietario");
      return;
    }
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, {
          owner_id: selectedOwner.id,
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age_months: Number(formData.age_months),
          weight_kg: Number(formData.weight_kg)
        });
      } else {
        await patientService.create({
          owner_id: selectedOwner.id,
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age_months: Number(formData.age_months),
          weight_kg: Number(formData.weight_kg)
        });
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      alert("Error al guardar el paciente");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', species: 'Canino', breed: '', age_months: 0, weight_kg: 0 });
    setSelectedOwner(null);
    setOwnerSearch('');
    setEditingPatient(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      await patientService.delete(id);
      loadData();
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOwners = owners.filter(o => 
    o.full_name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    o.cedula.includes(ownerSearch)
  ).slice(0, 5);

  return (
    <div className="p-8 bg-slate-50 min-h-full font-display">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Pacientes</h1>
          <div className="flex items-center gap-2">
            <span className="size-2 bg-primary rounded-full animate-pulse"></span>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] opacity-80">
              Gestión Integral de Mascotas
            </p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 25px -5px rgb(6 182 212 / 0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-white font-bold py-4 px-10 rounded-[2rem] transition-all flex items-center gap-3 shadow-xl shadow-primary/10 self-start group"
        >
          <PlusCircle className="group-hover:rotate-90 transition-transform text-2xl" />
          <span className="uppercase tracking-widest text-xs font-black">Nuevo Registro</span>
        </motion.button>
      </header>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors size-5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, raza o dueño..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2.2rem] text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm shadow-slate-200/50"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.8rem] overflow-hidden shadow-premium">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-8 py-8 flex items-center gap-4 shimmer h-24 opacity-30"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto overflow-visible">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Mascota</th>
                  <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Especie / Raza</th>
                  <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Propietario</th>
                  <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Edad / Peso</th>
                  <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredPatients.map((patient, index) => (
                    <motion.tr 
                      layout
                      key={patient.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50/50 transition-all group"
                    >
                      <td className="px-12 py-7">
                        <div className="flex items-center gap-6">
                          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                            {patient.name[0]}
                          </div>
                          <div>
                            <span className="text-slate-900 font-bold text-lg block tracking-tight">{patient.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {patient.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-7">
                        <span className="text-slate-700 font-bold text-sm block tracking-tight mb-0.5">{patient.species}</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{patient.breed}</span>
                      </td>
                      <td className="px-12 py-7">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center">
                            <User className="size-4 text-slate-400" />
                          </div>
                          <span className="text-slate-600 font-semibold text-sm">{patient.owner_name}</span>
                        </div>
                      </td>
                      <td className="px-12 py-7">
                        <span className="text-slate-900 font-bold text-sm">{patient.age_months}m</span>
                        <span className="text-slate-400 font-bold text-xs ml-2">/ {patient.weight_kg}kg</span>
                      </td>
                      <td className="px-12 py-7 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.button 
                            whileHover={{ scale: 1.15, backgroundColor: '#f1f5f9' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(patient)}
                            className="size-11 rounded-2xl text-slate-400 hover:text-primary transition-all flex items-center justify-center p-0"
                          >
                            <Edit3 className="size-5" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.15, backgroundColor: '#fef2f2' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(patient.id)}
                            className="size-11 rounded-2xl text-slate-400 hover:text-red-500 transition-all flex items-center justify-center p-0"
                          >
                            <Trash2 className="size-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-xl bg-white rounded-[3.5rem] p-12 shadow-2xl overflow-visible"
            >
              <form onSubmit={handleSave} className="space-y-8">
                <div className="relative mb-8">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 leading-none">
                    {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
                  </h2>
                  <p className="text-slate-500 font-semibold text-sm">Gestiona la identidad clínica de la mascota.</p>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute -top-4 -right-4 size-10 rounded-full bg-slate-50 text-slate-300 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all shadow-sm"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-3 relative" ref={ownerInputRef}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 block">Dueño del Paciente</label>
                  {selectedOwner ? (
                    <motion.div 
                      layout
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                      className="flex items-center justify-between p-5 bg-primary/5 border-2 border-primary/20 rounded-[2rem] shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                          <User className="size-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1 text-base">{selectedOwner.full_name}</p>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedOwner.cedula}</p>
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button" 
                        onClick={() => { setSelectedOwner(null); setOwnerSearch(''); }} 
                        className="size-9 rounded-xl hover:bg-white text-primary flex items-center justify-center transition-colors shadow-sm"
                      >
                        <X className="size-4" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors size-5" />
                      <input 
                        className="input-medical pl-16 py-5" 
                        placeholder="Buscar por nombre o cédula..." 
                        value={ownerSearch} 
                        onFocus={() => setShowOwnerResults(true)} 
                        onChange={e => { setOwnerSearch(e.target.value); setShowOwnerResults(true); }} 
                        required 
                      />
                      <AnimatePresence>
                        {showOwnerResults && ownerSearch.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute z-50 left-0 right-0 top-[calc(100%+12px)] bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-3 overflow-hidden">
                            {filteredOwners.length > 0 ? filteredOwners.map(o => (
                              <button key={o.id} type="button" onClick={() => { setSelectedOwner(o); setShowOwnerResults(false); }} className="w-full p-4 text-left hover:bg-slate-50 transition-all rounded-2xl flex items-center justify-between group">
                                <div>
                                  <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tight">{o.full_name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{o.cedula}</p>
                                </div>
                                <PlusCircle className="size-5 text-slate-200 group-hover:text-primary transition-colors" />
                              </button>
                            )) : (
                              <div className="p-8 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Sin resultados encontrados</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 block">Especie Mascota</label>
                  <div className="grid grid-cols-5 gap-3">
                    {SPECIES_OPTIONS.map(opt => (
                      <motion.button
                        key={opt.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData({...formData, species: opt.id})}
                        className={`flex flex-col items-center gap-2 p-4 rounded-[1.8rem] border-2 transition-all ${
                          formData.species === opt.id 
                            ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                            : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <opt.icon className={`size-7 ${formData.species === opt.id ? 'animate-pulse' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{opt.id}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 block">Nombre Mascota</label>
                    <input className="input-medical px-6 py-4" placeholder="Ej: Piru" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 block">Raza</label>
                    <input className="input-medical px-6 py-4" placeholder="Ej: Schnauzer" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 block">Edad (meses)</label>
                    <input type="number" className="input-medical px-6 py-4" value={formData.age_months} onChange={e => setFormData({...formData, age_months: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1 block">Peso (kg)</label>
                    <input type="number" step="0.1" className="input-medical px-6 py-4" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-3xl font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">Cerrar</button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 25px -5px rgb(15 23 42 / 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all"
                  >
                    {editingPatient ? 'Guardar Cambios' : 'Confirmar Registro'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .input-medical { 
          width: 100%; 
          background-color: #f8fafc; 
          border: 2px solid #f8fafc; 
          border-radius: 1.8rem; 
          font-size: 0.875rem; 
          font-weight: 700; 
          color: #1e293b; 
          outline: none; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .input-medical:focus { 
          border-color: #06b6d4; 
          background-color: white; 
          box-shadow: 0 15px 30px -10px rgba(6,182,212,0.15); 
        }
        .input-medical::placeholder { color: #94a3b8; font-weight: 600; }
      `}</style>
    </div>
  );
}