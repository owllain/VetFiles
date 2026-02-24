import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ownerService, Owner } from '../services/ownerService';

export default function Owners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    cedula: '',
    full_name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const data = await ownerService.getAll();
      setOwners(data);
    } catch (error) {
      console.error("Error loading owners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ownerService.create(formData);
      setIsModalOpen(false);
      setFormData({ cedula: '', full_name: '', phone: '', email: '', address: '' });
      loadOwners();
    } catch (error) {
      alert("Error al guardar el propietario");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este propietario?")) {
      await ownerService.delete(id);
      loadOwners();
    }
  };

  const filteredOwners = owners.filter(o => 
    o.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.cedula.includes(searchTerm)
  );

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Propietarios</h1>
          <p className="text-slate-500 font-medium">Gestión de clientes y responsables de mascotas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-primary/20 self-start group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">person_add</span>
          Nuevo Propietario
        </button>
      </header>

      <div className="mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center text-slate-500 uppercase font-black text-xs tracking-widest">Cargando propietarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cédula</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOwners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5 font-bold text-slate-900">{owner.full_name}</td>
                    <td className="px-8 py-5 font-mono text-xs text-slate-500">{owner.cedula}</td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-600">{owner.phone}</p>
                      <p className="text-[10px] text-slate-400">{owner.email}</p>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 truncate max-w-xs">{owner.address}</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(owner.id)} className="size-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center ml-auto">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-10 shadow-premium">
              <form onSubmit={handleSave} className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nuevo Propietario</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Cédula / ID</label>
                    <input className="input-medical" placeholder="1-1111-1111" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Nombre Completo</label>
                    <input className="input-medical" placeholder="Maria Rodriguez" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Teléfono</label>
                    <input className="input-medical" placeholder="8888-8888" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Email</label>
                    <input type="email" className="input-medical" placeholder="maria@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Dirección Física</label>
                   <textarea className="input-medical h-24 pt-3" placeholder="San José, Costa Rica..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4.5 rounded-2xl font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-slate-200">Registrar Propietario</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .input-medical { width: 100%; background-color: #f8fafc; border: 2px solid #f1f5f9; border-radius: 1rem; padding: 0.85rem 1.25rem; font-size: 0.85rem; font-weight: 700; color: #1e293b; outline: none; transition: all 0.2s; }
        .input-medical:focus { border-color: #06b6d4; background-color: white; shadow: 0 0 0 4px rgba(6,182,212,0.1); }
      `}</style>
    </div>
  );
}