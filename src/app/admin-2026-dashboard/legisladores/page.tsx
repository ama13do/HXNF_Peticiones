// src/app/admin/legisladores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Download, RefreshCw } from "lucide-react";
import { exportToCsv } from "@/lib/utils";

export default function LegisladoresPage() {
  const [diputados, setDiputados] = useState<any[]>([]);
  const [senadores, setSenadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"diputados" | "senadores">("diputados");

  async function loadData(forceRefresh = false) {
    setLoading(true);

    if (!forceRefresh) {
      const cachedDip = sessionStorage.getItem("admin_diputados");
      const cachedSen = sessionStorage.getItem("admin_senadores");
      if (cachedDip && cachedSen) {
        setDiputados(JSON.parse(cachedDip));
        setSenadores(JSON.parse(cachedSen));
        setLoading(false);
        return;
      }
    }

    const [dipRes, senRes] = await Promise.all([
      supabase.from("diputados").select("*").limit(500),
      supabase.from("senadores").select("*").limit(200),
    ]);
      
    if (dipRes.data) {
      setDiputados(dipRes.data);
      sessionStorage.setItem("admin_diputados", JSON.stringify(dipRes.data));
    }
    if (senRes.data) {
      setSenadores(senRes.data);
      sessionStorage.setItem("admin_senadores", JSON.stringify(senRes.data));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    if (tab === "diputados") {
      const rows = filteredDip.map(d => ({
        ID: d.Id,
        Referencia: d.ID_Referencia,
        Nombre: d.Nombre_Completo,
        Partido: d.Partido,
        Entidad: d.Entidad,
        Distrito: d.Numero_Distrito,
        Correo: d["Correo electrónico"],
        Telefono: d.Teléfono,
        Ubicacion: d.Ubicación
      }));
      exportToCsv("diputados", rows);
    } else {
      const rows = filteredSen.map(s => ({
        ID: s.id,
        Nombre: `${s.Nombre} ${s.Apellidos}`,
        Fraccion: s.Fraccion,
        Estado: s.Estado,
        Correo: s.correo,
        Telefono: s.telefono,
        Estatus: s.estatus
      }));
      exportToCsv("senadores", rows);
    }
  };

  const filteredDip = diputados.filter(d => 
    d.Nombre_Completo?.toLowerCase().includes(search.toLowerCase()) || 
    d.Partido?.toLowerCase().includes(search.toLowerCase()) ||
    d.Entidad?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSen = senadores.filter(s => 
    s.Nombre?.toLowerCase().includes(search.toLowerCase()) || 
    s.Apellidos?.toLowerCase().includes(search.toLowerCase()) || 
    s.Fraccion?.toLowerCase().includes(search.toLowerCase()) ||
    s.Estado?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Legisladores</h1>
          <p className="text-white/50 text-sm">Directorio de diputados y senadores.</p>
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
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setTab("diputados")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-1 sm:flex-none ${tab === "diputados" ? "bg-hxnf-green text-black" : "text-white/50 hover:text-white"}`}
            >
              Diputados
            </button>
            <button
              onClick={() => setTab("senadores")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-1 sm:flex-none ${tab === "senadores" ? "bg-hxnf-green text-black" : "text-white/50 hover:text-white"}`}
            >
              Senadores
            </button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="text-sm text-white/50">
              {tab === "diputados" ? filteredDip.length : filteredSen.length} resultados
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:border-hxnf-green outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === "diputados" ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-white/50 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                  <th className="px-6 py-4 font-semibold">Partido</th>
                  <th className="px-6 py-4 font-semibold">Entidad / Dto</th>
                  <th className="px-6 py-4 font-semibold">Correo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-white/40">Cargando...</td></tr>
                ) : filteredDip.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-white/40">No se encontraron diputados.</td></tr>
                ) : (
                  filteredDip.map((d) => (
                    <tr key={d.Id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{d.Nombre_Completo}</td>
                      <td className="px-6 py-4 text-white/70">{d.Partido}</td>
                      <td className="px-6 py-4 text-white/70">{d.Entidad} {d.Numero_Distrito ? `(Dto. ${d.Numero_Distrito})` : ''}</td>
                      <td className="px-6 py-4 text-white/70">{d["Correo electrónico"] || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-white/50 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                  <th className="px-6 py-4 font-semibold">Fracción</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Correo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-white/40">Cargando...</td></tr>
                ) : filteredSen.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-white/40">No se encontraron senadores.</td></tr>
                ) : (
                  filteredSen.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{s.Nombre} {s.Apellidos}</td>
                      <td className="px-6 py-4 text-white/70">{s.Fraccion}</td>
                      <td className="px-6 py-4 text-white/70">{s.Estado}</td>
                      <td className="px-6 py-4 text-white/70">{s.correo || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
