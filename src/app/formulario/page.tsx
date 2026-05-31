// src/app/formulario/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { getEstadoFromCP, personalizeBody, abrirCorreo } from "@/lib/cp-utils";
import type { Diputado, Senador, Plantilla, FiltroTipo } from "@/types";

export default function FormularioPage() {
  // ── Datos usuario ──────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cp, setCp] = useState("");
  const [distritoElectoral, setDistritoElectoral] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [recibirInfo, setRecibirInfo] = useState(false);

  // ── DB data ────────────────────────────────────────────────
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<Plantilla | null>(null);
  const [mensajePersonalizado, setMensajePersonalizado] = useState("");
  const [diputados, setDiputados] = useState<Diputado[]>([]);
  const [senadores, setSenadores] = useState<Senador[]>([]);

  // ── UI ─────────────────────────────────────────────────────
  const [estado, setEstado] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [filtroPartido, setFiltroPartido] = useState("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [loadingLeg, setLoadingLeg] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [modoMensaje, setModoMensaje] = useState<"plantilla" | "personalizado">("plantilla");

  // ── Load plantillas on mount ───────────────────────────────
  useEffect(() => {
    supabase
      .from("plantillas")
      .select("*")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const p = data as Plantilla[];
          setPlantillas(p);
          setPlantillaSeleccionada(p[0]);
          setMensajePersonalizado(p[0].cuerpo);
        }
      });
  }, []);

  // ── Buscar legisladores ────────────────────────────────────
  const buscarLegisladores = useCallback(async () => {
    if (cp.length < 5) return;
    const estadoDetectado = getEstadoFromCP(cp);
    if (!estadoDetectado) {
      setError("Código postal no reconocido.");
      return;
    }
    setEstado(estadoDetectado);
    setLoadingLeg(true);
    setError("");
    setSeleccionados(new Set());

    try {
      let dipQuery = supabase
        .from("diputados")
        .select("*")
        .or(`Entidad.ilike.%${estadoDetectado}%,Estado_Eleccion.ilike.%${estadoDetectado}%`);

      if (distritoElectoral.trim()) {
        dipQuery = dipQuery.eq("Numero_Distrito", parseInt(distritoElectoral));
      }

      const [dipRes, senRes] = await Promise.all([
        dipQuery,
        supabase
          .from("senadores")
          .select("*")
          .or(`Estado.ilike.%${estadoDetectado}%,estadoOrigen.ilike.%${estadoDetectado}%`),
      ]);

      setDiputados((dipRes.data as Diputado[]) ?? []);
      setSenadores((senRes.data as Senador[]) ?? []);
    } catch {
      setError("Error al cargar legisladores. Intenta de nuevo.");
    } finally {
      setLoadingLeg(false);
    }
  }, [cp, distritoElectoral]);

  // ── Cuando CP llega a 5 dígitos, busca automáticamente ────
  useEffect(() => {
    if (cp.length === 5) buscarLegisladores();
  }, [cp, buscarLegisladores]);

  // ── Partidos disponibles ───────────────────────────────────
  const partidos = Array.from(
    new Set([
      ...diputados.map((d) => d.Partido).filter(Boolean),
      ...senadores.map((s) => s.Fraccion).filter(Boolean),
    ])
  ).sort() as string[];

  // ── Filtrado ───────────────────────────────────────────────
  const diputadosFiltrados = diputados.filter((d) =>
    filtroPartido ? d.Partido === filtroPartido : true
  );
  const senadoresFiltrados = senadores.filter((s) =>
    filtroPartido ? s.Fraccion === filtroPartido : true
  );

  // ── Selección ─────────────────────────────────────────────
  const toggleSeleccion = (key: string) => {
    setSeleccionados((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  const seleccionarTodos = () => {
    const keys: string[] = [];
    if (filtroTipo !== "senadores") diputadosFiltrados.forEach((d) => keys.push(`dip-${d.Id}`));
    if (filtroTipo !== "diputados") senadoresFiltrados.forEach((s) => keys.push(`sen-${s.id}`));
    setSeleccionados(new Set(keys));
  };

  const limpiarSeleccion = () => setSeleccionados(new Set());

  // ── Emails helpers ─────────────────────────────────────────
  const getEmailDip = (d: Diputado) => (d["Correo electrónico"] ?? "").trim();
  const getEmailSen = (s: Senador) => (s.correo ?? "").trim();

  // ── Cuerpo final personalizado ─────────────────────────────
  const getCuerpoFinal = () =>
    personalizeBody(mensajePersonalizado, {
      nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      correo,
      estado: estado ?? "",
    });

  const getAsunto = () => plantillaSeleccionada?.asunto ?? "Petición ciudadana";
  const getCco = () => plantillaSeleccionada?.cco ?? "hxnf@practica.lab";

  // ── Validar formulario ─────────────────────────────────────
  const validar = (): boolean => {
    const faltantes = [];

    if (!nombre.trim() || !apellidoPaterno.trim()) faltantes.push("Nombre y Apellido Paterno");
    if (!correo.trim() || !correo.includes("@")) faltantes.push("Correo electrónico válido");
    if (telefono.trim().length !== 10) faltantes.push("Teléfono válido a 10 dígitos");
    if (!cp.trim() || cp.length < 5) faltantes.push("Código Postal a 5 dígitos");
    if (!mensajePersonalizado.trim()) faltantes.push("Seleccionar o escribir una petición");
    if (!aceptaPrivacidad) faltantes.push("Aceptar el aviso de privacidad");

    if (faltantes.length > 0) {
      const mensajeError = `Por favor, completa lo siguiente para continuar:\n\n- ${faltantes.join("\n- ")}`;
      setError(mensajeError);
      alert(mensajeError); // Alerta visual directa
      return false;
    }
    
    setError(""); // Limpiamos errores si todo está correcto
    return true;
  };

  // ── Guardar en DB ──────────────────────────────────────────
  const guardarEnDB = async (
    emailsDestino: string[],
    legisladoresIds: { id: number; tipo: "diputado" | "senador" }[]
  ) => {
    try {
      const { data: colabData } = await supabase
        .from("colaboradores")
        .upsert(
          {
            nombre,
            apellido_paterno: apellidoPaterno,
            apellido_materno: apellidoMaterno || null,
            correo,
            telefono: telefono || null,
            codigo_postal: cp,
            distrito_electoral: distritoElectoral ? parseInt(distritoElectoral) : null,
            recibir_info: recibirInfo,
          },
          { onConflict: "correo" }
        )
        .select("id")
        .single();

      if (!colabData) return;

      const { data: petData } = await supabase
        .from("peticiones_enviadas")
        .insert({
          colaborador_id: colabData.id,
          plantilla_id: plantillaSeleccionada?.id ?? null,
        })
        .select("id")
        .single();

      if (petData && legisladoresIds.length > 0) {
        await supabase.from("destinatarios_peticion").insert(
          legisladoresIds.map((l) => ({
            peticion_id: petData.id,
            legislador_id: l.id,
            tipo_legislador: l.tipo,
          }))
        );
      }
    } catch (err) {
      console.error("Error guardando petición:", err);
      // No bloqueante: el correo se abre de todas formas
    }
  };

  // ── Enviar a uno ───────────────────────────────────────────
  const enviarUno = async (
    email: string,
    id: number,
    tipo: "diputado" | "senador"
  ) => {
    if (!validar()) return;
    setEnviando(true);
    await guardarEnDB([email], [{ id, tipo }]);
    setEnviando(false);
    abrirCorreo({ emails: [email], asunto: getAsunto(), cuerpo: getCuerpoFinal(), cco: getCco() });
  };

  // ── Enviar a todos seleccionados ───────────────────────────
  const enviarSeleccionados = async () => {
    if (!validar()) return;
    const emails: string[] = [];
    const ids: { id: number; tipo: "diputado" | "senador" }[] = [];

    seleccionados.forEach((key) => {
      if (key.startsWith("dip-")) {
        const d = diputados.find((x) => x.Id === parseInt(key.replace("dip-", "")));
        if (d) { const e = getEmailDip(d); if (e) emails.push(e); ids.push({ id: d.Id, tipo: "diputado" }); }
      } else {
        const s = senadores.find((x) => x.id === parseInt(key.replace("sen-", "")));
        if (s) { const e = getEmailSen(s); if (e) emails.push(e); ids.push({ id: s.id, tipo: "senador" }); }
      }
    });

    if (emails.length === 0) {
      const msg = "Ningún legislador seleccionado tiene correo registrado.";
      setError(msg);
      alert(msg);
      return;
    }
    setEnviando(true);
    await guardarEnDB(emails, ids);
    setEnviando(false);
    abrirCorreo({ emails, asunto: getAsunto(), cuerpo: getCuerpoFinal(), cco: getCco() });
  };

  const totalVisible =
    (filtroTipo !== "senadores" ? diputadosFiltrados.length : 0) +
    (filtroTipo !== "diputados" ? senadoresFiltrados.length : 0);

  const hayLegisladores = diputados.length > 0 || senadores.length > 0;

  // ── Card Diputado ──────────────────────────────────────────
  const CardDip = ({ d }: { d: Diputado }) => {
    const key = `dip-${d.Id}`;
    const email = getEmailDip(d);
    const sel = seleccionados.has(key);
    const initials = (d.Nombre_Completo ?? "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

    return (
      <div
        onClick={() => email && toggleSeleccion(key)}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none
          ${sel ? "border-hxnf-green bg-hxnf-green/10" : "border-white/10 bg-white/5 hover:border-white/25"}
          ${!email ? "opacity-50 cursor-default" : ""}`}
      >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
          ${sel ? "bg-hxnf-green border-hxnf-green" : "border-white/30"}`}>
          {sel && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
          ${sel ? "bg-hxnf-green text-black" : "bg-white/10 text-white"}`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {d.URL_Perfil_Curriculum ? (
            <a
              href={d.URL_Perfil_Curriculum}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-sm text-hxnf-green hover:underline truncate block"
            >
              {d.Nombre_Completo}
            </a>
          ) : (
            <div className="font-semibold text-sm text-white truncate">{d.Nombre_Completo}</div>
          )}
          <div className="text-white/40 text-xs truncate">
            {[d.Partido, d.Numero_Distrito && `Dto. ${d.Numero_Distrito}`, d.Ciudad_Eleccion].filter(Boolean).join(" · ")}
          </div>
        </div>

        {email ? (
          <button
            onClick={(e) => { e.stopPropagation(); enviarUno(email, d.Id, "diputado"); }}
            disabled={enviando}
            className="bg-hxnf-green text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-hxnf-yellow transition-colors disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
          >
            ✉ Escribir
          </button>
        ) : (
          <span className="text-white/25 text-xs flex-shrink-0">Sin correo</span>
        )}
      </div>
    );
  };

  // ── Card Senador ───────────────────────────────────────────
  const CardSen = ({ s }: { s: Senador }) => {
    const key = `sen-${s.id}`;
    const email = getEmailSen(s);
    const sel = seleccionados.has(key);
    const fullName = `${s.Nombre ?? ""} ${s.Apellidos ?? ""}`.trim();
    const initials = fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

    return (
      <div
        onClick={() => email && toggleSeleccion(key)}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none
          ${sel ? "border-hxnf-green bg-hxnf-green/10" : "border-white/10 bg-white/5 hover:border-white/25"}
          ${!email ? "opacity-50 cursor-default" : ""}`}
      >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
          ${sel ? "bg-hxnf-green border-hxnf-green" : "border-white/30"}`}>
          {sel && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
          ${sel ? "bg-hxnf-green text-black" : "bg-white/10 text-white"}`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {s.url_sitio ? (
            <a href={s.url_sitio} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-sm text-hxnf-green hover:underline truncate block">
              {fullName}
            </a>
          ) : (
            <div className="font-semibold text-sm text-white truncate">{fullName}</div>
          )}
          <div className="text-white/40 text-xs truncate">
            {[s.Fraccion, s.Estado].filter(Boolean).join(" · ")}
          </div>
        </div>

        {email ? (
          <button
            onClick={(e) => { e.stopPropagation(); enviarUno(email, s.id, "senador"); }}
            disabled={enviando}
            className="bg-hxnf-green text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-hxnf-yellow transition-colors disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
          >
            ✉ Escribir
          </button>
        ) : (
          <span className="text-white/25 text-xs flex-shrink-0">Sin correo</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBanner />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 pb-32 lg:pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Tu petición, tu <span className="text-hxnf-green">nombre</span>
          </h1>
          <p className="text-white/50 max-w-lg mx-auto text-sm">
            Completa tus datos, elige el mensaje y envía directo desde tu correo.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ════════════════════════════════════════
              COLUMNA PRINCIPAL
          ════════════════════════════════════════ */}
          <div className="flex-1 space-y-5 w-full">

            {/* ── PASO 1: Datos + Petición juntos ── */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <div className="bg-white/5 px-5 py-4 border-b border-white/10">
                <h2 className="font-bold text-white text-base">1 — Tus datos</h2>
                <p className="text-white/40 text-xs">Personalizan tu carta · no se almacenan en servidores externos</p>
              </div>

              <div className="p-5 space-y-3">
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre(s) *"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-hxnf-green transition-colors" />

                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)}
                    placeholder="Apellido paterno *"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-hxnf-green transition-colors" />
                  <input type="text" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)}
                    placeholder="Apellido materno"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-hxnf-green transition-colors" />
                </div>

                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Correo electrónico *"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-hxnf-green transition-colors" />

                {/* TELÉFONO FILTRADO Y A 10 DÍGITOS */}
                <input 
                  type="tel" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                  placeholder="Teléfono (10 dígitos) *"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-hxnf-green transition-colors" 
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    {/* CÓDIGO POSTAL FILTRADO A NÚMEROS Y 5 DÍGITOS */}
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      value={cp}
                      onChange={(e) => { 
                        const val = e.target.value.replace(/\D/g, '');
                        setCp(val); 
                        if (val.length < 5) { setEstado(null); setDiputados([]); setSenadores([]); } 
                      }}
                      placeholder="Código postal *" 
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-hxnf-green transition-colors" 
                    />
                    {loadingLeg && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-hxnf-green border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  <input type="text" value={distritoElectoral} onChange={(e) => setDistritoElectoral(e.target.value)}
                    placeholder="Distrito electoral (opc.)"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:border-hxnf-green transition-colors" />
                </div>

                {/* Estado detectado */}
                {estado && (
                  <div className="bg-hxnf-green/10 border border-hxnf-green/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <span className="text-white/70">Estado: <strong className="text-hxnf-green">{estado}</strong></span>
                    <span className="text-white/40 text-xs ml-auto">
                      {diputados.length} dip · {senadores.length} sen
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── PASO 2: Petición (SIEMPRE VISIBLE) ── */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <div className="bg-white/5 px-5 py-4 border-b border-white/10">
                <h2 className="font-bold text-white text-base">2 — Elige la petición</h2>
                <p className="text-white/40 text-xs">Selecciona un tema o escribe tu propio mensaje</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                  <button
                    onClick={() => setModoMensaje("plantilla")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${modoMensaje === "plantilla" ? "bg-hxnf-green text-black" : "text-white/50 hover:text-white"}`}
                  >
                    Usar plantilla
                  </button>
                  <button
                    onClick={() => setModoMensaje("personalizado")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${modoMensaje === "personalizado" ? "bg-hxnf-green text-black" : "text-white/50 hover:text-white"}`}
                  >
                    Escribir el mío
                  </button>
                </div>

                {modoMensaje === "plantilla" && (
                  <div className="space-y-3">
                    {plantillas.length === 0 ? (
                      <div className="text-white/30 text-sm text-center py-4">Cargando plantillas...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {plantillas.map((p) => (
                          <button key={p.id}
                            onClick={() => { setPlantillaSeleccionada(p); setMensajePersonalizado(p.cuerpo); }}
                            className={`p-3 rounded-xl border text-left transition-all ${plantillaSeleccionada?.id === p.id ? "border-hxnf-green bg-hxnf-green/10 text-hxnf-green" : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"}`}>
                            <div className="font-semibold text-sm">{p.Nombre ?? p.asunto}</div>
                            <div className="text-xs mt-0.5 opacity-60 line-clamp-1">{p.asunto}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {plantillaSeleccionada && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <div className="text-white/40 text-xs mb-1 font-semibold uppercase tracking-wider">Vista previa</div>
                        <p className="text-white/60 text-xs leading-relaxed line-clamp-4">{plantillaSeleccionada.cuerpo}</p>
                      </div>
                    )}
                  </div>
                )}

                {modoMensaje === "personalizado" && (
                  <textarea
                    value={mensajePersonalizado}
                    onChange={(e) => setMensajePersonalizado(e.target.value)}
                    rows={7}
                    placeholder="Escribe tu mensaje aquí. Puedes usar [NOMBRE] para que aparezca tu nombre automáticamente."
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm resize-none focus:border-hxnf-green transition-colors"
                  />
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setAceptaPrivacidad((v) => !v)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                      aceptaPrivacidad ? "bg-hxnf-green border-hxnf-green" : "border-white/30 group-hover:border-white/60"
                    }`}
                  >
                    {aceptaPrivacidad && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white/50 text-xs leading-relaxed">
                    He leído y acepto el{" "}
                    <a href="/#privacidad" className="text-hxnf-green underline">
                      aviso de privacidad
                    </a>
                    . Entiendo que se registrará mi petición y que el correo se enviará desde mi propia app.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group mt-4">
                  <div
                    onClick={() => setRecibirInfo((v) => !v)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                      recibirInfo ? "bg-hxnf-green border-hxnf-green" : "border-white/30 group-hover:border-white/60"
                    }`}
                  >
                    {recibirInfo && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white/50 text-xs leading-relaxed mt-0.5">
                    ¿Te gustaría recibir más información para sumarte a cambiar las cosas?
                  </span>
                </label>
              </div>
            </div>

            {/* ── PASO 3: Legisladores ── */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <div className="bg-white/5 px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-white text-base">3 — Tus legisladores</h2>
                  <p className="text-white/40 text-xs">
                    {hayLegisladores
                      ? `${totalVisible} legisladores encontrados para ${estado}`
                      : "Ingresa tu CP arriba para verlos"}
                  </p>
                </div>
                {hayLegisladores && (
                  <span className="bg-hxnf-green text-black text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                    {totalVisible}
                  </span>
                )}
              </div>

              {!hayLegisladores ? (
                <div className="p-10 text-center">
                  <div className="text-5xl mb-3">🏛</div>
                  <p className="text-white/40 text-sm">Escribe tu código postal arriba</p>
                  <p className="text-white/25 text-xs mt-1">Detectamos tu estado y cargamos automáticamente</p>
                </div>
              ) : (
                <>
                  <div className="px-5 py-3 border-b border-white/5 space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      {(["todos", "diputados", "senadores"] as FiltroTipo[]).map((t) => (
                        <button key={t} onClick={() => setFiltroTipo(t)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtroTipo === t ? "bg-hxnf-green text-black" : "border border-white/20 text-white/50 hover:border-white/40"}`}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                      {partidos.length > 0 && (
                        <select value={filtroPartido} onChange={(e) => setFiltroPartido(e.target.value)}
                          className="bg-white/5 border border-white/15 rounded-full px-3 py-1.5 text-xs text-white">
                          <option value="">Todos los partidos</option>
                          {partidos.map((p) => <option key={p} value={p} className="bg-black">{p}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <button onClick={seleccionarTodos} className="text-hxnf-green hover:underline">
                        Seleccionar todos
                      </button>
                      <span className="text-white/20">·</span>
                      <button onClick={limpiarSeleccion} className="text-white/40 hover:text-white">
                        Limpiar
                      </button>
                      {seleccionados.size > 0 && (
                        <>
                          <span className="text-white/20">·</span>
                          <span className="text-hxnf-green font-semibold">
                            {seleccionados.size} seleccionados
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {filtroTipo !== "senadores" && diputadosFiltrados.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Diputados Federales</span>
                          <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">{diputadosFiltrados.length}</span>
                        </div>
                        <div className="space-y-2">
                          {diputadosFiltrados.map((d) => <CardDip key={d.Id} d={d} />)}
                        </div>
                      </div>
                    )}

                    {filtroTipo !== "diputados" && senadoresFiltrados.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Senadores</span>
                          <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">{senadoresFiltrados.length}</span>
                        </div>
                        <div className="space-y-2">
                          {senadoresFiltrados.map((s) => <CardSen key={s.id} s={s} />)}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Error visual inferior */}
            {error && (
              <div className="border border-red-500/40 bg-red-500/10 text-red-400 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                ⚠ {error}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════
              SIDEBAR (desktop)
          ════════════════════════════════════════ */}
          <div className="hidden lg:flex lg:w-72 flex-col gap-4 sticky top-20">
            <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 text-sm">¿Cómo funciona?</h3>
              <div className="space-y-3">
                {[
                  "Ingresa tu nombre y código postal para identificar a tus representantes.",
                  "Elige una causa o escribe tu propio mensaje.",
                  'Selecciona a cada un legislador o "Enviar a todos a la vez".',
                  "Se abre tu app de correos con todo listo. Solo confirma el envío.",
                ].map((s, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-black border-2 border-hxnf-green text-hxnf-green text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <p className="text-white/60 text-xs leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {estado && (
              <div className="border border-hxnf-green/20 bg-hxnf-green/5 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-2 text-sm">🏛 Tu representación</h3>
                <p className="text-hxnf-green font-bold">{estado}</p>
                <p className="text-white/50 text-xs mt-1">
                  {senadores.length} senadores · {diputados.length} diputados
                </p>
              </div>
            )}

            {seleccionados.size > 0 && (
              <button
                onClick={enviarSeleccionados}
                disabled={enviando}
                className="w-full bg-hxnf-green text-black font-bold py-4 rounded-2xl hover:bg-hxnf-yellow transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-hxnf-green/20"
              >
                {enviando ? (
                  <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Abriendo correo...</>
                ) : (
                  <>✉ Enviar a {seleccionados.size} legislador{seleccionados.size !== 1 ? "es" : ""}</>
                )}
              </button>
            )}

            <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
              <p className="text-white/40 text-xs leading-relaxed">
                🔒 Tus datos <strong className="text-white">nunca salen de tu dispositivo</strong>.
                Los correos van directo desde tu app de correos. Copia oculta a <span className="text-hxnf-green">hxnf@practica.lat</span>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════
          BOTÓN FLOTANTE MÓVIL
      ════════════════════════════════════════ */}
      {seleccionados.size > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-8">
          <button
            onClick={enviarSeleccionados}
            disabled={enviando}
            className="w-full bg-hxnf-green text-black font-bold py-4 rounded-2xl hover:bg-hxnf-yellow transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-2xl shadow-hxnf-green/40 text-base"
          >
            {enviando ? (
              <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Abriendo correo...</>
            ) : (
              <>✉ Enviar a {seleccionados.size} legislador{seleccionados.size !== 1 ? "es" : ""} →</>
            )}
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}