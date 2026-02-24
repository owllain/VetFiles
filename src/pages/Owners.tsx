import React from 'react';

export default function Owners() {
  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Propietarios</h1>
        <p className="text-slate-500 font-medium">Directorio de clientes y responsables de pacientes.</p>
      </header>
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <span className="material-symbols-outlined text-5xl">group</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Módulo en Construcción</h2>
        <p className="text-slate-500 max-w-sm mx-auto">Estamos trabajando para traerte la mejor gestión de clientes. Pronto podrás ver aquí el listado detallado.</p>
      </div>
    </div>
  );
}