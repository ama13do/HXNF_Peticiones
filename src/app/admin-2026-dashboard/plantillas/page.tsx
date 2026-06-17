// src/app/admin/plantillas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Download, RefreshCw } from "lucide-react";
import { exportToCsv } from "@/lib/utils";

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ Nombre: "", asunto: "", cuerpo: "", cco: "hxnf@practica.lat" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData(forceRefresh = false) {
    setLoading(true);

    if (!forceRefresh) {
      const cached = sessionStorage.getItem("admin_plantillas");
      if (cached) {
        setPlantillas(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("plantillas")
      .select("*")
      .order("id", { ascending: true });
      
    if (!error && data) {
      setPlantillas(data);
      sessionStorage.setItem("admin_plantillas", JSON.stringify(data));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    const rows = plantillas.map(p => ({
      ID: p.id,
      Nombre: p.Nombre,
      Asunto: p.asunto,
      Cuerpo: p.cuerpo,
      CCO: p.cco
    }));
    exportToCsv("plantillas", rows);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!formData.Nombre || !formData.asunto || !formData.cuerpo) {
      setError("Por favor completa los campos requeridos (Nombre, Asunto, Cuerpo).");
      return;
    }

    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("plantillas")
      .insert([formData])
      .select();

    if (insertError) {
      setError(insertError.message);
    } else {
      setIsFormOpen(false);
      setFormData({ Nombre: "", asunto: "", cuerpo: "", cco: "hxnf@practica.lat" });
      loadData(true); // Force refresh to get the new template
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Plantillas</h1>
          <p className="text-white/50 text-sm">Gestiona las cartas y mensajes disponibles para los ciudadanos.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => loadData(true)}
            title="Actualizar datos"
            className="flex items-center gap-2 bg-white/10 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white/10 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-hxnf-green text-black font-semibold px-4 py-2 rounded-lg hover:bg-hxnf-yellow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 fade-in-up">
          <h2 className="text-lg font-bold mb-4">Crear nueva plantilla</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1 uppercase">Nombre (Referencia interna)</label>
                <input 
                  type="text" 
                  value={formData.Nombre}
                  onChange={(e) => setFormData({...formData, Nombre: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:border-hxnf-green outline-none"
                  placeholder="Ej: Petición por el agua"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1 uppercase">Asunto del correo</label>
                <input 
                  type="text" 
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:border-hxnf-green outline-none"
                  placeholder="Asunto para el correo"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1 uppercase">Cuerpo de la carta (Usa [NOMBRE] para personalizar)</label>
              <textarea 
                value={formData.cuerpo}
                onChange={(e) => setFormData({...formData, cuerpo: e.target.value})}
                rows={8}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-hxnf-green outline-none resize-none"
                placeholder="Estimado legislador..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1 uppercase">Correo con Copia Oculta (CCO)</label>
              <input 
                type="email" 
                value={formData.cco}
                onChange={(e) => setFormData({...formData, cco: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:border-hxnf-green outline-none"
              />
            </div>

            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-white/50 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-hxnf-green text-black font-semibold px-6 py-2 rounded-lg hover:bg-hxnf-yellow transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar Plantilla"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-white/50 animate-pulse p-4">Cargando plantillas...</div>
        ) : plantillas.length === 0 ? (
          <div className="text-white/50 p-4 border border-white/10 rounded-2xl bg-white/5 text-center">No hay plantillas creadas.</div>
        ) : (
          plantillas.map(p => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{p.Nombre}</h3>
                  <p className="text-hxnf-green text-sm font-medium mt-1">Asunto: {p.asunto}</p>
                </div>
                <div className="text-white/40 text-xs">
                  ID: {p.id}
                </div>
              </div>
              <div className="bg-black/50 border border-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm whitespace-pre-wrap">{p.cuerpo}</p>
              </div>
              <div className="mt-4 text-xs text-white/40 flex justify-between items-center">
                <span>CCO: {p.cco || "N/A"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
