import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  email: string;
  idNumber: string; // Cédula
  firstName: string;
  lastName: string;
  role: 'Doctor' | 'Asistente' | 'Administrativo';
  phone: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', email: 'dr.perez@vet.com', idNumber: '1-2345-6789', firstName: 'Ricardo', lastName: 'Pérez', role: 'Doctor', phone: '8888-1111' },
    { id: '2', email: 'ana.vet@vet.com', idNumber: '2-0345-0987', firstName: 'Ana', lastName: 'García', role: 'Administrativo', phone: '2222-3333' },
    { id: '3', email: 'marta.asist@vet.com', idNumber: '3-0123-0456', firstName: 'Marta', lastName: 'Rodríguez', role: 'Asistente', phone: '7777-4444' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    idNumber: '',
    firstName: '',
    lastName: '',
    role: 'Asistente' as User['role'],
    phone: ''
  });

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '', 
        idNumber: user.idNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        idNumber: '',
        firstName: '',
        lastName: '',
        role: 'Asistente',
        phone: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const roles = [
    { name: 'Doctor', icon: 'stethoscope', color: 'bg-primary' },
    { name: 'Asistente', icon: 'medical_services', color: 'bg-accent' },
    { name: 'Administrativo', icon: 'badge', color: 'bg-secondary' }
  ];

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Equipo Médico</h1>
          <p className="text-slate-500 font-medium">Gestiona el personal y sus niveles de acceso al sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-primary/20 self-start group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">person_add</span>
          Nuevo Ingreso
        </button>
      </header>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-all group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl bg-white text-primary flex items-center justify-center font-black text-lg border border-slate-100 shadow-sm shadow-slate-200`}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <span className="text-slate-900 font-black block">{user.firstName} {user.lastName}</span>
                        <span className="text-[11px] font-bold text-slate-400 lowercase">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-slate-600 font-bold text-sm block">{user.idNumber}</span>
                  </td>
                  <td className="px-8 py-5 text-slate-600 font-medium text-sm">
                    {user.phone}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.role === 'Doctor' ? 'bg-primary/10 text-primary' : 
                      user.role === 'Asistente' ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleOpenModal(user)}
                        className="size-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all flex items-center justify-center"
                       >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="size-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Slide-over Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-premium overflow-hidden h-[90vh] flex flex-col"
            >
              <form onSubmit={handleSave} className="flex flex-col h-full">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {editingUser ? 'Editar Perfil' : 'Registro de Equipo'}
                    </h2>
                    <p className="text-slate-500 text-xs font-medium">Completa la ficha del colaborador.</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="size-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                  {/* SECCIÓN 1: DATOS PERSONALES */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="size-2 bg-primary rounded-full"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Datos de Identidad</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input className="input-medical" placeholder="Nombre" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                      <input className="input-medical" placeholder="Apellido" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input className="input-medical" placeholder="Cédula / ID" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} required />
                      <input className="input-medical" placeholder="Teléfono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </section>

                  {/* SECCIÓN 2: ROL / CARGO (MEJORADO) */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="size-2 bg-accent rounded-full"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Puesto de Trabajo</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {roles.map(r => (
                        <button
                          key={r.name}
                          type="button"
                          onClick={() => setFormData({...formData, role: r.name as any})}
                          className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${
                            formData.role === r.name 
                            ? `border-primary bg-primary/5 text-primary` 
                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-2xl ${formData.role === r.name ? 'fill-1' : ''}`}>
                            {r.icon}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest">{r.name}</span>
                          {formData.role === r.name && (
                            <div className="size-4 bg-primary rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* SECCIÓN 3: CREDENCIALES */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="size-2 bg-secondary rounded-full"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acceso al Sistema</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                        <input className="input-medical !pl-14" placeholder="Email Laboral" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                      </div>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                        <input className="input-medical !pl-14" placeholder={editingUser ? "Nueva Clave (Opcional)" : "Clave Temporal"} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUser} />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-500 hover:bg-white transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200 hover:bg-primary transition-all">
                    {editingUser ? 'Guardar Cambios' : 'Registrar'}
                  </button>
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
          border: 2px solid #f1f5f9;
          border-radius: 1rem;
          padding: 0.875rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-medical:focus {
          border-color: #06b6d4;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }
      `}</style>
    </div>
  );
}
