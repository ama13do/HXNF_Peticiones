// src/app/admin/colaboradores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Download, RefreshCw } from "lucide-react";
import { exportToCsv } from "@/lib/utils";

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadData(forceRefresh = false) {
    setLoading(true);

    if (!forceRefresh) {
      const cached = sessionStorage.getItem("admin_colaboradores");
      if (cached) {
        setColaboradores(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("colaboradores")
      .select("*")
      .order("id", { ascending: false });
      
    if (!error && data) {
      setColaboradores(data);
      sessionStorage.setItem("admin_colaboradores", JSON.stringify(data));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    const rows = filtered.map(c => ({
      ID: c.id,
      Nombre: c.nombre,
      Apellido_Paterno: c.apellido_paterno,
      Apellido_Materno: c.apellido_materno,
      Correo: c.correo,
      Telefono: c.telefono,
      CP: c.codigo_postal,
      Distrito: c.distrito_electoral,
      Recibir_Info: c.recibir_info ? 'Sí' : 'No'
    }));
    exportToCsv("colaboradores", rows);
  };

  const filtered = colaboradores.filter(c => 
    c.nombre?.toLowerCase().includes(search.toLowerCase()) || 
    c.correo?.toLowerCase().includes(search.toLowerCase()) ||
    c.apellido_paterno?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Colaboradores</h1>
          <p className="text-white/50 text-sm">Ciudadanos que han participado en la campaña.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadData(true)}
            title="Actualizar datos"
            className="flex items-center gap-2 bg-white/10 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-hxnf-green text-black font-semibold px-4 py-2 rounded-lg hover:bg-hxnf-yellow transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:border-hxnf-green outline-none transition-colors"
            />
          </div>
          <div className="text-sm text-white/50">
            {filtered.length} resultados
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                <th className="px-6 py-4 font-semibold">Correo</th>
                <th className="px-6 py-4 font-semibold">Teléfono</th>
                <th className="px-6 py-4 font-semibold">C.P.</th>
                <th className="px-6 py-4 font-semibold">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">Cargando...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">No se encontraron colaboradores.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white/50">#{c.id}</td>
                    <td className="px-6 py-4 font-medium">
                      {c.nombre} {c.apellido_paterno} {c.apellido_materno}
                    </td>
                    <td className="px-6 py-4 text-white/70">{c.correo}</td>
                    <td className="px-6 py-4 text-white/70">{c.telefono || "N/A"}</td>
                    <td className="px-6 py-4 text-white/70">{c.codigo_postal}</td>
                    <td className="px-6 py-4">
                      {c.recibir_info ? (
                        <span className="bg-hxnf-green/20 text-hxnf-green text-xs px-2 py-1 rounded-md font-semibold">Sí</span>
                      ) : (
                        <span className="bg-white/10 text-white/40 text-xs px-2 py-1 rounded-md">No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
