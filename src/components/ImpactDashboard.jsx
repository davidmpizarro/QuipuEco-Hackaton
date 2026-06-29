import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Trophy, Leaf, Scale, Layers, Trash2, History } from "lucide-react";

const TIPO_CONFIG = {
  plastico:      { emoji: "🧴", label: "Plástico",    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", barColor: "bg-amber-500" },
  papel:         { emoji: "📦", label: "Papel / Cartón", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", barColor: "bg-blue-500" },
  vidrio:        { emoji: "🍶", label: "Vidrio",       color: "bg-teal-500/20 text-teal-300 border-teal-500/30", barColor: "bg-teal-500" },
  organico:      { emoji: "🥬", label: "Orgánico",     color: "bg-lime-500/20 text-lime-300 border-lime-500/30", barColor: "bg-lime-500" },
  metal:         { emoji: "🥫", label: "Metal",        color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30", barColor: "bg-zinc-400" },
  electronico:   { emoji: "📱", label: "Electrónico",  color: "bg-purple-500/20 text-purple-300 border-purple-500/30", barColor: "bg-purple-500" },
  peligroso:     { emoji: "☣️", label: "Peligroso",   color: "bg-red-500/20 text-red-300 border-red-500/30", barColor: "bg-red-500" },
  no_reciclable: { emoji: "🗑️", label: "No reciclable", color: "bg-neutral-700/20 text-neutral-400 border-neutral-700/30", barColor: "bg-neutral-600" },
};

const NIVELES = [
  { min: 0,   label: "Semilla Eco", emoji: "🌱", color: "text-green-400", bg: "bg-green-950/35" },
  { min: 30,  label: "Árbol Joven", emoji: "🌳", color: "text-emerald-400", bg: "bg-emerald-950/35" },
  { min: 100, label: "Bosque Verde", emoji: "🌲", color: "text-teal-400", bg: "bg-teal-950/35" },
  { min: 250, label: "Guardián Eco", emoji: "🦅", color: "text-cyan-400", bg: "bg-cyan-950/35" },
  { min: 500, label: "Héroe del Planeta", emoji: "🏆", color: "text-amber-400", bg: "bg-amber-950/35" },
];

function getNivel(puntos) {
  return [...NIVELES].reverse().find((n) => puntos >= n.min) || NIVELES[0];
}

function getSiguienteNivel(puntos) {
  return NIVELES.find((n) => n.min > puntos);
}

export default function ImpactDashboard({ stats, historial, onLimpiar }) {
  const [tab, setTab] = useState("resumen");
  const nivel = getNivel(stats.puntos);
  const siguiente = getSiguienteNivel(stats.puntos);
  const progreso = siguiente
    ? ((stats.puntos - getNivel(stats.puntos).min) /
       (siguiente.min - getNivel(stats.puntos).min)) * 100
    : 100;

  // Prepare chart data: Cumulative CO2 over time
  const chartData = [...historial]
    .reverse()
    .reduce((acc, item, index) => {
      const prevVal = index > 0 ? acc[index - 1].co2 : 0;
      const fecha = new Date(item.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
      acc.push({
        name: fecha,
        co2: Number((prevVal + (item.co2_evitado_kg || 0)).toFixed(2)),
      });
      return acc;
    }, []);

  if (stats.totalItems === 0) {
    return (
      <div className="w-full px-5 py-8 text-center">
        <div className="border border-emerald-950/30 rounded-[28px] p-8 bg-[#0a1910]/30 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-900/20 flex items-center justify-center text-emerald-400">
            <Leaf className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Tu impacto empieza aquí</h3>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-normal">
              Clasifica tu primer residuo con la cámara IA para comenzar a registrar tus métricas de reciclaje y acumular puntos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-5 py-4 space-y-4 text-left">

      {/* Progress & Level Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-green-900 border border-emerald-500/20 rounded-[28px] p-5 text-white shadow-[0_8px_25px_rgba(16,185,129,0.15)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-10 -top-10 w-28 h-28 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">Rango Actual</span>
            <h2 className="text-xl font-extrabold flex items-center gap-2 mt-0.5">
              <span>{nivel.emoji}</span>
              {nivel.label}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">Puntos Eco</span>
            <p className="text-3xl font-black text-white tracking-tight mt-0.5">{stats.puntos}</p>
          </div>
        </div>
        
        {/* Progress bar details */}
        {siguiente && (
          <div className="space-y-1.5 relative z-10">
            <div className="flex justify-between text-[10px] font-bold text-emerald-100">
              <span>PROGRESO AL SIGUIENTE NIVEL</span>
              <span className="flex items-center gap-1">
                {siguiente.emoji} {siguiente.label} en {siguiente.min - stats.puntos} pts
              </span>
            </div>
            <div className="h-2 bg-black/25 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-emerald-300 to-teal-200 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}
        {!siguiente && (
          <div className="bg-white/10 rounded-xl py-1.5 text-center text-xs font-bold relative z-10 flex items-center justify-center gap-2 border border-white/10">
            <Trophy className="w-4 h-4 text-amber-300" />
            ¡Has alcanzado el rango máximo de Guardián Eco!
          </div>
        )}
      </div>

      {/* Primary stats overview */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { value: stats.co2Total.toFixed(2), unit: "kg CO₂", label: "Evitado", icon: Leaf, color: "text-emerald-400" },
          { value: stats.pesoTotal.toFixed(1), unit: "kg Peso", label: "Reciclado", icon: Scale, color: "text-blue-400" },
          { value: stats.totalItems, unit: "Items", label: "Clasificados", icon: Layers, color: "text-purple-400" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-[#0a1910]/40 border border-emerald-950/30 rounded-2xl p-3 text-center flex flex-col justify-between h-24">
              <Icon className={`w-5 h-5 mx-auto ${m.color}`} />
              <div>
                <span className="text-base font-extrabold text-white block leading-tight">{m.value}</span>
                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mt-0.5">{m.unit} {m.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-xl bg-emerald-950/40 border border-emerald-900/10">
        {[
          { id: "resumen", label: "Por tipo" },
          { id: "grafico", label: "Tendencia" },
          { id: "historial", label: "Historial" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              tab === t.id
                ? "bg-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Resumen por tipo */}
      {tab === "resumen" && (
        <div className="bg-[#0a1910]/40 border border-emerald-950/30 rounded-3xl p-4 space-y-3.5">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Residuos por categoría</p>
          <div className="space-y-3">
            {Object.entries(stats.porTipo)
              .sort((a, b) => b[1] - a[1])
              .map(([tipo, cantidad]) => {
                const cfg = TIPO_CONFIG[tipo] || TIPO_CONFIG["no_reciclable"];
                const porcentaje = Math.round((cantidad / stats.totalItems) * 100);
                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${cfg.color}`}>
                        {cfg.emoji} {cfg.label}
                      </span>
                      <span className="text-zinc-400 font-semibold text-[10px]">{cantidad} residuo{cantidad > 1 ? "s" : ""} ({porcentaje}%)</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cfg.barColor} rounded-full transition-all duration-1000 shadow-[0_0_4px_currentColor]`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab: Recharts interactive area graph */}
      {tab === "grafico" && (
        <div className="bg-[#0a1910]/40 border border-emerald-950/30 rounded-3xl p-4 space-y-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Histórico de Reciclaje</p>
            <h4 className="text-xs font-semibold text-zinc-300 mt-0.5">CO₂ acumulado evitado (kg)</h4>
          </div>
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,25,16,0.9)",
                    borderColor: "rgba(16,185,129,0.2)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "10px",
                  }}
                />
                <Area type="monotone" dataKey="co2" name="CO₂ Evitado" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCo2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab: Historial list */}
      {tab === "historial" && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Últimos registros</p>
            <span className="text-[10px] text-zinc-500 font-bold">{historial.length} totales</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {historial.slice(0, 10).map((item) => {
              const cfg = TIPO_CONFIG[item.tipo] || TIPO_CONFIG["no_reciclable"];
              const fecha = new Date(item.fecha);
              return (
                <div key={item.id} className="bg-[#0a1910]/40 border border-emerald-950/20 rounded-2xl p-3 flex items-center gap-3">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-11 h-11 rounded-xl object-cover bg-black/40 flex-shrink-0 border border-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.nombre}</p>
                    <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full border mt-1 ${cfg.color}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-emerald-400">
                      +{item.co2_evitado_kg?.toFixed(2)} CO₂
                    </span>
                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                      {fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {historial.length > 10 && (
            <p className="text-center text-[10px] font-bold text-zinc-500 pt-1">
              + {historial.length - 10} registros guardados en dispositivo
            </p>
          )}

          <button
            onClick={onLimpiar}
            className="w-full py-2.5 border border-red-900/30 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-[0.99] mt-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
          </button>
        </div>
      )}
    </div>
  );
}