import { useState } from "react";
import { Leaf, Scale, CheckCircle2, MapPin, ChevronRight, Sparkles, RefreshCw, Mic } from "lucide-react";
import AgenteVoz from "./AgenteVoz";

const TIPO_CONFIG = {
  plastico:      { emoji: "🧴", color: "from-amber-500/10 to-yellow-600/5 border-amber-500/20 text-amber-300", badge: "bg-amber-500/20 text-amber-200 border-amber-500/30", label: "Plástico",       contenedor: "Amarillo", contenedorEmoji: "🟡" },
  papel:         { emoji: "📦", color: "from-blue-500/10 to-indigo-600/5 border-blue-500/20 text-blue-300",    badge: "bg-blue-500/20 text-blue-200 border-blue-500/30",    label: "Papel / Cartón",  contenedor: "Azul",     contenedorEmoji: "🔵" },
  vidrio:        { emoji: "🍶", color: "from-teal-500/10 to-emerald-600/5 border-teal-500/20 text-teal-300",   badge: "bg-teal-500/20 text-teal-200 border-teal-500/30",    label: "Vidrio",          contenedor: "Verde",    contenedorEmoji: "🟢" },
  organico:      { emoji: "🥬", color: "from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-300", badge: "bg-orange-500/20 text-orange-200 border-orange-500/30", label: "Orgánico",   contenedor: "Naranja",  contenedorEmoji: "🟠" },
  metal:         { emoji: "🥫", color: "from-amber-500/10 to-yellow-600/5 border-amber-500/20 text-amber-300", badge: "bg-amber-500/20 text-amber-200 border-amber-500/30",  label: "Metal",           contenedor: "Amarillo", contenedorEmoji: "🟡" },
  electronico:   { emoji: "📱", color: "from-purple-500/10 to-fuchsia-600/5 border-purple-500/20 text-purple-300", badge: "bg-purple-500/20 text-purple-200 border-purple-500/30", label: "Electrónico", contenedor: "Morado",  contenedorEmoji: "🟣" },
  peligroso:     { emoji: "☣️", color: "from-red-500/10 to-rose-600/5 border-red-500/20 text-red-300",         badge: "bg-red-500/20 text-red-200 border-red-500/30",        label: "Peligroso",       contenedor: "Rojo",     contenedorEmoji: "🔴" },
  no_reciclable: { emoji: "🗑️", color: "from-zinc-600/10 to-neutral-700/5 border-zinc-700/20 text-zinc-400",   badge: "bg-zinc-700/20 text-zinc-300 border-zinc-700/30",     label: "No reciclable",   contenedor: "Gris",     contenedorEmoji: "⚫" },
};

export default function ClassificationResult({ resultado, imagen, onReset, onVerMapa, agenteAbierto, onAbrirAgente, onCerrarAgente, historialAgente, onHistorialAgente }) {
  const config = TIPO_CONFIG[resultado.tipo] || TIPO_CONFIG["no_reciclable"];
  const formatPuntoAcopio = (texto) => {
  if (!texto) return "";
  const lower = texto.toLowerCase();
  if (lower.includes("tambo")) return "Tiendas Tambo";
  if (lower.includes("centro verde")) return "Centro Verde Municipal";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

  return (
    <div className="w-full px-5 py-4 space-y-4 text-left">

      {/* Principal Card */}
      <div className={`border rounded-[28px] overflow-hidden bg-gradient-to-br ${config.color} relative shadow-[0_8px_30px_rgb(0,0,0,0.4)]`}>
        <div className="relative aspect-[3/4] w-full bg-black/40 overflow-hidden">
          <img src={imagen} alt="Residuo analizado" className="w-full h-full object-contain opacity-85" />
          <div className="absolute inset-x-3 top-3 flex justify-between items-center pointer-events-none">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md flex items-center gap-1.5 ${config.badge}`}>
              <span>{config.emoji}</span>{config.label}
            </span>
            {resultado.tipo !== "no_reciclable" && (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md flex items-center gap-1 ${
                resultado.tipo === "peligroso"
                  ? "text-red-300 bg-red-950/60 border-red-500/30"
                  : "text-emerald-300 bg-emerald-950/60 border-emerald-500/30"
              }`}>
                {resultado.tipo === "peligroso" ? "⚠️ Peligroso" : "✓ Reciclable"}
              </span>
            )}
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Objeto Identificado</p>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5" style={{ textTransform: "none" }}>
                {resultado.nombre.charAt(0).toUpperCase() + resultado.nombre.slice(1)}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-black/35 rounded-2xl p-3 border border-white/5 text-center flex flex-col justify-between h-20">
              <Leaf className="w-4 h-4 text-emerald-400 mx-auto" />
              <div>
                <span className="text-sm font-extrabold text-emerald-300 block leading-tight">{resultado.co2_evitado_kg.toFixed(2)}</span>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-tight mt-0.5">kg CO₂</span>
              </div>
            </div>
            <div className="bg-black/35 rounded-2xl p-3 border border-white/5 text-center flex flex-col justify-between h-20">
              <Scale className="w-4 h-4 text-blue-400 mx-auto" />
              <div>
                <span className="text-sm font-extrabold text-blue-300 block leading-tight">{resultado.peso_estimado_kg.toFixed(2)}</span>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-tight mt-0.5">kg Peso</span>
              </div>
            </div>
            <div className="bg-black/35 rounded-2xl p-3 border border-white/5 text-center flex flex-col justify-between h-20">
              <span className="text-lg mx-auto leading-none">{config.contenedorEmoji}</span>
              <div>
                <span className="text-xs font-extrabold text-white block leading-tight truncate">{config.contenedor}</span>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-tight mt-0.5">Contenedor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#0a1910]/60 border border-emerald-950/40 rounded-3xl p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />Cómo descartarlo en Lima
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed font-medium">{resultado.instrucciones}</p>
      </div>

      {/* Mapa */}
      <button
        onClick={() => onVerMapa(resultado)}
        className="w-full bg-[#0a1910]/40 hover:bg-emerald-950/30 active:scale-[0.99] border border-emerald-950/30 rounded-3xl p-4 text-left transition-all flex justify-between items-center group"
      >
        <div className="space-y-1 pr-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />Puntos de acopio en Lima
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-1 leading-normal font-medium">
            {formatPuntoAcopio(resultado.punto_acopio)}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Consejo */}
      <div className="bg-gradient-to-r from-emerald-700/80 to-green-600/70 border border-emerald-500/25 rounded-3xl p-4 text-white shadow-lg relative overflow-hidden flex items-start gap-3">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3">
          <Sparkles className="w-24 h-24" />
        </div>
        
        <div className="space-y-0.5 relative z-10">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Consejo Ecológico</h4>
          <p className="text-xs font-semibold leading-relaxed text-white">{resultado.consejo}</p>
        </div>
      </div>

      {/* Botón Agente */}
      <button
        onClick={onAbrirAgente}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
      >
        <Mic className="w-4 h-4" />
        {historialAgente.length > 0 ? "Continuar con el Agente" : "Hablar con el Agente"}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3.5 bg-[#0a1910] hover:bg-emerald-950/40 border border-emerald-900/30 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 shadow-lg"
      >
        <RefreshCw className="w-4 h-4 text-zinc-400" /> Clasificar otro residuo
      </button>

    </div>
  );
}