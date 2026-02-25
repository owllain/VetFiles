
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { userService, User } from '../services/userService';
import { Stethoscope, User as UserIcon, Clock, Phone, Mail, ChevronRight, Search, LayoutGrid, List } from 'lucide-react';

export default function Staff() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      // Filtrar por roles relevantes si es necesario, 
      // pero el usuario pidió doctores y asistentes.
      const filtered = data.filter(u => ['Doctor', 'Asistente'].includes(u.role));
      setStaff(filtered);
    } catch (error) {
      console.error("Error al cargar personal:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const filteredStaff = staff.filter(member => 
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Personal Médico</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-70 flex items-center gap-2">
            <div className="size-2 bg-primary rounded-full animate-pulse"></div>
            Equipo Veterinario y Horarios
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] shadow-premium-sm border border-slate-100">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
            <input 
              className="bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 outline-none w-72 md:w-80 focus:bg-white transition-all focus:ring-2 ring-primary/20"
              placeholder="Buscar por nombre o cargo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 border-l border-slate-100 pl-4">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {filteredStaff.length > 0 ? (
            viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {filteredStaff.map((member) => (
                  <motion.div 
                    key={member.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-premium group hover:shadow-2xl transition-all border-b-8 border-b-primary/5 hover:border-b-primary transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                       <div className="size-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-6 relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                          {member.role === 'Doctor' ? (
                            <Stethoscope className="size-10 text-primary group-hover:scale-110 transition-transform" />
                          ) : (
                            <UserIcon className="size-10 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-transform" />
                          )}
                          <div className="absolute top-2 right-2 size-4 bg-emerald-500 border-4 border-white rounded-full"></div>
                       </div>
                       
                       <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">{member.full_name}</h3>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 bg-primary/10 px-4 py-1.5 rounded-full">{member.role}</p>
                       
                       <div className="w-full space-y-3 mb-8">
                          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                             <Clock className="size-4 text-primary shrink-0" />
                             <div className="overflow-hidden">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Horario Laboral</p>
                                <p className="text-xs font-bold text-slate-600 truncate">{member.schedule || 'No definido'}</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                             <div className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-50 text-left overflow-hidden">
                                <Phone className="size-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 truncate">{member.phone}</span>
                             </div>
                             <div className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-50 text-left overflow-hidden">
                                <Mail className="size-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 truncate">{member.email}</span>
                             </div>
                          </div>
                       </div>
                       
                       <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 hover:bg-primary transition-all flex items-center justify-center gap-2 group/btn">
                          Ver Perfil Completo
                          <ChevronRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {filteredStaff.map((member) => (
                  <div key={member.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                       {member.role === 'Doctor' ? <Stethoscope className="text-primary" /> : <UserIcon className="text-slate-400 group-hover:text-primary" />}
                    </div>
                    <div className="flex-1">
                       <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{member.full_name}</h3>
                       <div className="flex items-center gap-4 mt-1">
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">{member.role}</span>
                          <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                             <Clock className="size-3" /> {member.schedule || 'No definido'}
                          </span>
                       </div>
                    </div>
                    <div className="flex items-center gap-8 px-12 border-x border-slate-100 h-10">
                       <div className="text-left">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Contacto</p>
                          <p className="text-[11px] font-bold text-slate-500">{member.phone}</p>
                       </div>
                       <div className="text-left">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Email</p>
                          <p className="text-[11px] font-bold text-slate-500">{member.email}</p>
                       </div>
                    </div>
                    <button className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                       <ChevronRight />
                    </button>
                  </div>
                ))}
              </motion.div>
            )
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
               <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <Search size={48} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-2">No encontramos a nadie</h2>
               <p className="text-slate-500 font-bold">Intenta simplificar tu búsqueda o verifica los cargos asignados.</p>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}