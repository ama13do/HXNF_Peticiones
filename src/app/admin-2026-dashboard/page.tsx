// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, FileText, Landmark, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ colaboradores: 0, peticiones: 0, destinatarios: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData(forceRefresh = false) {
    setLoading(true);

    if (!forceRefresh) {
      const cachedStats = sessionStorage.getItem("admin_stats");
      const cachedChart = sessionStorage.getItem("admin_chart");
      if (cachedStats && cachedChart) {
        setStats(JSON.parse(cachedStats));
        setChartData(JSON.parse(cachedChart));
        setLoading(false);
        return;
      }
    }

    try {
      const [colabRes, petRes, destRes] = await Promise.all([
        supabase.from("colaboradores").select("id", { count: "exact", head: true }),
        supabase.from("peticiones_enviadas").select("id, creado_en"),
        supabase.from("destinatarios_peticion").select("id", { count: "exact", head: true }),
      ]);

      const newStats = {
        colaboradores: colabRes.count || 0,
        peticiones: petRes.data?.length || 0,
        destinatarios: destRes.count || 0,
      };
      setStats(newStats);
      sessionStorage.setItem("admin_stats", JSON.stringify(newStats));

      if (petRes.data) {
        const countsByDate = petRes.data.reduce((acc: any, pet: any) => {
          if (!pet.creado_en) return acc;
          const date = new Date(pet.creado_en).toLocaleDateString("es-MX", {
            month: "short",
            day: "numeric",
          });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const formattedChartData = Object.entries(countsByDate).map(([date, count]) => ({
          date,
          count,
        }));
        setChartData(formattedChartData);
        sessionStorage.setItem("admin_chart", JSON.stringify(formattedChartData));
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/50 text-sm">Resumen general de la campaña.</p>
        </div>
        <button
          onClick={() => loadData(true)}
          title="Actualizar datos"
          className="flex items-center gap-2 bg-white/10 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-white/50 animate-pulse">Cargando métricas...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Colaboradores" 
              value={stats.colaboradores} 
              icon={<Users className="w-6 h-6 text-hxnf-green" />} 
            />
            <StatCard 
              title="Peticiones Creadas" 
              value={stats.peticiones} 
              icon={<FileText className="w-6 h-6 text-hxnf-green" />} 
            />
            <StatCard 
              title="Correos Enviados (Destinatarios)" 
              value={stats.destinatarios} 
              icon={<Landmark className="w-6 h-6 text-hxnf-green" />} 
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[400px]">
            <h2 className="text-lg font-bold text-white mb-6">Peticiones enviadas por día</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#ffffff50" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff10' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#0FF263' }}
                  />
                  <Bar dataKey="count" name="Peticiones" fill="#0FF263" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40">
                Aún no hay datos para mostrar.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
      <div className="p-4 bg-black/40 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-white/50 text-sm font-semibold mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
