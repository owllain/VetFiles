import React from 'react';

export default function Settings() {
  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Configuración</h1>
        <p className="text-slate-500 font-medium">Ajustes del sistema y preferencias de la clínica.</p>
      </header>
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-slate-900 font-black text-lg">Notificaciones Push</p>
              <p className="text-sm text-slate-500 font-medium">Alertas de citas e inventario bajo.</p>
            </div>
            <div className="w-14 h-8 bg-primary rounded-full relative shadow-inner">
              <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-slate-900 font-black text-lg">Respaldo Automático</p>
              <p className="text-sm text-slate-500 font-medium">Sincronización con Vet-Cloud cada 30 min.</p>
            </div>
            <div className="w-14 h-8 bg-slate-200 rounded-full relative">
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}