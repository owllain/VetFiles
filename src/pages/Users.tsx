import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { userService, User } from '../services/userService';

const ROLES = [
  { id: 'Doctor', label: 'Doctor', icon: 'stethoscope' },
  { id: 'Asistente', label: 'Asistente', icon: 'medical_services' },
  { id: 'Administrativo', label: 'Administrativo', icon: 'badge' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    cedula: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'Doctor',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, {
          cedula: formData.cedula,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        });
      } else {
        await userService.create({
          cedula: formData.cedula,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password_hash: formData.password, // Basic mock hash
          created_at: Date.now()
        });
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ cedula: '', full_name: '', email: '', phone: '', role: 'Doctor', password: '' });
      loadUsers();
    } catch (error) {
      alert("Error al procesar el usuario");
      console.error(error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      cedula: user.cedula,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este usuario?")) {
      await userService.delete(id);
      loadUsers();
    }
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Usuarios</h1>
          <p className="text-slate-500 font-medium">Control de acceso y roles del sistema.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({ cedula: '', full_name: '', email: '', phone: '', role: 'Doctor', password: '' }); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-primary/20 self-start group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">person_add</span>
          Nuevo Usuario
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full p-20 text-center text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Cargando personal...</div>
        ) : users.map((user) => (
          <motion.div 
            key={user.id} 
            layout
            className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(user)} className="size-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary flex items-center justify-center transition-all shadow-sm"><span className="material-symbols-outlined text-sm">edit</span></button>
                <button onClick={() => handleDelete(user.id)} className="size-10 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all shadow-sm"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>

            <div className="flex items-center gap-5 mb-6">
              <div className="size-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shadow-inner">
                {user.full_name[0]}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">{user.full_name}</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider mt-1">
                  <span className="material-symbols-outlined text-xs">
                    {ROLES.find(r => r.id === user.role)?.icon || 'badge'}
                  </span>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="material-symbols-outlined text-lg">fingerprint</span>
                <span className="text-sm font-bold truncate">{user.cedula}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span className="material-symbols-outlined text-lg">mail</span>
                <span className="text-sm font-bold truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span className="material-symbols-outlined text-lg">call</span>
                <span className="text-sm font-bold">{user.phone}</span>
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
              <form onSubmit={handleSave} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                  <p className="text-slate-500 font-medium tracking-tight">Configura el acceso y perfil del personal.</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Información Personal</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cédula</label>
                        <input className="input-medical" placeholder="1-xxxx-xxxx" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} required />
                     </div>
                     <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</label>
                        <input className="input-medical" placeholder="P. ej. Dr. Ricardo Segura" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Acceso al Sistema</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                        <input type="email" className="input-medical" placeholder="usuario@vetfiles.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                     </div>
                     <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Teléfono</label>
                        <input className="input-medical" placeholder="8888-8888" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                     </div>
                  </div>
                  {!editingUser && (
                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contraseña Inicial</label>
                        <input type="password" className="input-medical" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Puesto de Trabajo (Rol)</p>
                  <div className="grid grid-cols-3 gap-3">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setFormData({...formData, role: r.id})}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.role === r.id 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">{r.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4.5 rounded-2xl font-black uppercase text-[10px] text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-slate-200 hover:bg-primary transition-all">
                    {editingUser ? 'Guardar Cambios' : 'Registrar'}
                  </button>
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
