import React from 'react';

export default function Inventory() {
  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Inventario</h1>
        <p className="text-slate-500 font-medium">Control de stock, medicamentos e insumos médicos.</p>
      </header>
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <span className="material-symbols-outlined text-5xl">inventory_2</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Stock & Almacén</h2>
        <p className="text-slate-500 max-w-sm mx-auto">Este módulo te permitirá llevar el control exacto de tus insumos clínicos.</p>
      </div>
    </div>
  );
}