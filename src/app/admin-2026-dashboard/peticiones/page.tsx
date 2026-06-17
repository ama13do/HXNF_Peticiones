// src/app/admin/peticiones/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Download, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { exportToCsv } from "@/lib/utils";

type Destinatario = {
  nombre: string;
  detalle: string;
  tipo: string;
};

type PeticionGroup = {
  id: number;
  creado_en: string;
  plantillaNombre: string;
  colaboradorNombre: string;
  colaboradorCorreo: string;
  totalDiputados: number;
  totalSenadores: number;
  destinatarios: Destinatario[];
};

export default function PeticionesPage() {
  const [peticiones, setPeticiones] = useState<PeticionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  async function loadData(forceRefresh = false) {
    setLoading(true);

    if (!forceRefresh) {
      const cached = sessionStorage.getItem("admin_peticiones");
      if (cached) {
        setPeticiones(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    const { data: petData } = await supabase
      .from("peticiones_enviadas")
      .select("*")
      .order("id", { ascending: false })
      .limit(300);

    if (!petData || petData.length === 0) {
      setPeticiones([]);
      sessionStorage.setItem("admin_peticiones", JSON.stringify([]));
      setLoading(false);
      return;
    }

    const petIds = petData.map(p => p.id);
    const [destRes, colabRes, planRes] = await Promise.all([
      supabase.from("destinatarios_peticion").select("*").in("peticion_id", petIds),
      supabase.from("colaboradores").select("*").in("id", Array.from(new Set(petData.map(p => p.colaborador_id)))),
      supabase.from("plantillas").select("*").in("id", Array.from(new Set(petData.map(p => p.plantilla_id).filter(Boolean)))),
    ]);

    const destData = destRes.data || [];
    const dipIds = Array.from(new Set(destData.filter(d => d.tipo_legislador === "diputado").map(d => d.legislador_id)));
    const senIds = Array.from(new Set(destData.filter(d => d.tipo_legislador === "senador").map(d => d.legislador_id)));

    const [dipRes, senRes] = await Promise.all([
      dipIds.length > 0 ? supabase.from("diputados").select("*").in("Id", dipIds) : Promise.resolve({ data: [] }),
      senIds.length > 0 ? supabase.from("senadores").select("*").in("id", senIds) : Promise.resolve({ data: [] })
    ]);

    const dipMap = new Map(dipRes.data?.map(d => [d.Id, d]) || []);
    const senMap = new Map(senRes.data?.map(s => [s.id, s]) || []);
    const colabMap = new Map(colabRes.data?.map(c => [c.id, c]) || []);
    const planMap = new Map(planRes.data?.map(p => [p.id, p]) || []);

    const groupedData: PeticionGroup[] = petData.map(pet => {
      const colab = colabMap.get(pet.colaborador_id);
      const plantilla = pet.plantilla_id ? planMap.get(pet.plantilla_id) : null;
      const petDest = destData.filter(d => d.peticion_id === pet.id);

      let dipCount = 0;
      let senCount = 0;
      const destinatarios = petDest.map(d => {
        let legName = "Desconocido";
        let legDet = "N/A";
        
        if (d.tipo_legislador === "diputado") {
          dipCount++;
          const dip = dipMap.get(d.legislador_id);
          if (dip) {
            legName = dip.Nombre_Completo;
            legDet = `${dip.Partido} - ${dip.Entidad}`;
          }
        } else {
          senCount++;
          const sen = senMap.get(d.legislador_id);
          if (sen) {
            legName = `${sen.Nombre} ${sen.Apellidos}`;
            legDet = `${sen.Fraccion} - ${sen.Estado}`;
          }
        }
        return { nombre: legName, detalle: legDet, tipo: d.tipo_legislador };
      });

      return {
        id: pet.id,
        creado_en: pet.creado_en || new Date().toISOString(),
        plantillaNombre: plantilla?.Nombre || plantilla?.asunto || "Mensaje Libre",
        colaboradorNombre: colab ? `${colab.nombre} ${colab.apellido_paterno}` : "Desconocido",
        colaboradorCorreo: colab?.correo || "Sin correo",
        totalDiputados: dipCount,
        totalSenadores: senCount,
        destinatarios,
      };
    });

    setPeticiones(groupedData);
    sessionStorage.setItem("admin_peticiones", JSON.stringify(groupedData));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    const rows = filtered.map(p => ({
      ID: p.id,
      Fecha: new Date(p.creado_en).toLocaleString("es-MX"),
      Plantilla: p.plantillaNombre,
      Colaborador: p.colaboradorNombre,
      Correo_Colaborador: p.colaboradorCorreo,
      Total_Diputados: p.totalDiputados,
      Total_Senadores: p.totalSenadores,
      Destinatarios: p.destinatarios.map(d => `${d.tipo === 'diputado' ? 'Dip.' : 'Sen.'} ${d.nombre} (${d.detalle})`).join(" | ")
    }));
    exportToCsv("peticiones", rows);
  };

  const filtered = peticiones.filter(p => 
    p.colaboradorNombre.toLowerCase().includes(search.toLowerCase()) || 
    p.colaboradorCorreo.toLowerCase().includes(search.toLowerCase()) ||
    p.plantillaNombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Peticiones Enviadas</h1>
          <p className="text-white/50 text-sm">Registro de peticiones y destinatarios.</p>
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
              placeholder="Buscar por colaborador o plantilla..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:border-hxnf-green outline-none transition-colors"
            />
          </div>
          <div className="text-sm text-white/50">
            {filtered.length} peticiones
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Plantilla</th>
                <th className="px-6 py-4 font-semibold">De (Colaborador)</th>
                <th className="px-6 py-4 font-semibold">Destinatarios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/40">Cargando...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/40">No hay peticiones registradas.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/50">
                        {new Date(p.creado_en).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-6 py-4 text-hxnf-green font-medium">
                        {p.plantillaNombre}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{p.colaboradorNombre}</div>
                        <div className="text-xs text-white/40">{p.colaboradorCorreo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold"
                        >
                          {p.destinatarios.length} Destinatario{p.destinatarios.length !== 1 ? "s" : ""}
                          <span className="text-white/40 font-normal">
                            ({p.totalDiputados} dip, {p.totalSenadores} sen)
                          </span>
                          {expanded[p.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                    {expanded[p.id] && p.destinatarios.length > 0 && (
                      <tr className="bg-black/40">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {p.destinatarios.map((d, i) => (
                              <div key={i} className="flex flex-col border border-white/10 bg-white/5 rounded-lg p-3">
                                <span className="font-semibold text-white">{d.nombre}</span>
                                <span className="text-xs text-white/50">{d.tipo === 'diputado' ? 'Diputado' : 'Senador'} · {d.detalle}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
