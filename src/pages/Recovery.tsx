import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Recovery() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-[#f8fafc]">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <header className="relative z-10 flex items-center justify-between w-full px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">pets</span>
          </div>
          <h1 className="text-slate-900 text-xl font-black tracking-tighter uppercase">VetFiles</h1>
        </div>
      </header>
      
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[460px]">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-premium">
            <div className="flex flex-col items-center justify-center text-center mb-10">
              <div className="mb-6 size-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">lock_reset</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Recuperación</h2>
              <p className="text-slate-500 font-medium">Enviaremos instrucciones a tu correo.</p>
            </div>
            
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Registrado</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                  <input className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium" placeholder="correo@ejemplo.com" type="email" />
                </div>
              </div>
              
              <button className="w-full bg-slate-900 hover:bg-primary text-white font-black py-4.5 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                Enviar Enlace
              </button>
              
              <div className="pt-6 border-t border-slate-100 text-center">
                <Link className="text-[10px] text-slate-400 hover:text-primary font-black uppercase tracking-widest flex items-center justify-center gap-2" to="/login">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Volver al Login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
