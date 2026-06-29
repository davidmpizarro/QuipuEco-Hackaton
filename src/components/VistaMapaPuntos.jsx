import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, MapPin, ExternalLink, Navigation } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// =========================
// DOS REDES DE ACOPIO REALES (Lima Este)
// =========================
// TAMBO: cadena de tiendas de conveniencia. Solo recibe PLÁSTICO, PAPEL
// y METAL directamente en el mostrador — son materiales limpios y secos
// que no representan riesgo ni requieren refrigeración/almacenamiento
// especial. Direcciones reales tomadas de tambo.pe/locales (coordenadas
// aproximadas por dirección/distrito).
//
// CENTRO VERDE MUNICIPAL: para VIDRIO, ORGÁNICO, ELECTRÓNICO y
// PELIGROSO. Estos residuos requieren manejo especializado (compostaje,
// gestión RAEE, gestores autorizados de residuos peligrosos) que una
// tienda de conveniencia no puede ofrecer. Tambo NO es el punto de
// entrega para estas categorías — esto es una restricción operativa
// real, no una preferencia de diseño.
//
// Mantener esta separación es clave para la credibilidad del pitch:
// prometer que Tambo recibe pilas o focos rotos rompería la lógica
// operativa de una tienda de conveniencia real.

const TAMBO_REAL_LIMA_ESTE = [
  { nombre: "Tambo Corregidor - La Molina", direccion: "Alameda del Corregidor 1684, La Molina", lat: -12.0815, lng: -76.9398, distrito: "La Molina" },
  { nombre: "Tambo Alondras - Santa Anita", direccion: "Av. Las Alondras 297, Santa Anita", lat: -12.0445, lng: -76.9678, distrito: "Santa Anita" },
  { nombre: "Tambo Paracas - Ate", direccion: "Paracas 892, Ate", lat: -12.0398, lng: -76.9156, distrito: "Ate" },
  { nombre: "Tambo Ayllón - Chaclacayo", direccion: "Av. Nicolás Ayllón 421, Chaclacayo", lat: -11.9821, lng: -76.7701, distrito: "Chaclacayo" },
  { nombre: "Tambo Riva Agüero - El Agustino", direccion: "Av. Riva Agüero 684, El Agustino", lat: -12.0478, lng: -76.9967, distrito: "El Agustino" },
  { nombre: "Tambo 28 de Julio - Chosica", direccion: "Prolongación 28 de Julio 384, Lurigancho-Chosica", lat: -11.9356, lng: -76.6945, distrito: "Chosica" },
];

// Centros Verdes municipales — datos de ejemplo (placeholder), pendientes
// de reemplazar por ubicaciones reales de programas municipales de Lima Este.
const PUNTOS_LIMA = {
  organico: [
    { nombre: "Centro Verde Eucaliptos - Santa Anita", direccion: "Av. Los Eucaliptos 340, Santa Anita", lat: -12.0456, lng: -76.9712, distrito: "Santa Anita" },
    { nombre: "Centro Verde La Molina", direccion: "Av. La Molina 1200, La Molina", lat: -12.0772, lng: -76.9432, distrito: "La Molina" },
    { nombre: "Centro Verde Riva Agüero - El Agustino", direccion: "Av. Riva Agüero 1500, El Agustino", lat: -12.0456, lng: -76.9998, distrito: "El Agustino" },
    { nombre: "Centro Verde Chaclacayo", direccion: "Av. Nicolás Ayllón 8500, Chaclacayo", lat: -11.9833, lng: -76.7667, distrito: "Chaclacayo" },
    { nombre: "Centro Verde Chosica", direccion: "Jr. Lima 320, Lurigancho-Chosica", lat: -11.9394, lng: -76.6972, distrito: "Chosica" },
  ],
  vidrio: [
    { nombre: "Centro Verde Separadora Industrial - Ate", direccion: "Av. Separadora Industrial 2300, Ate", lat: -12.0389, lng: -76.9623, distrito: "Ate" },
    { nombre: "Centro Verde Javier Prado - La Molina", direccion: "Av. Javier Prado Este 5200, La Molina", lat: -12.0834, lng: -76.9389, distrito: "La Molina" },
    { nombre: "Centro Verde Eucaliptos - Santa Anita", direccion: "Av. Los Eucaliptos 890, Santa Anita", lat: -12.0478, lng: -76.9723, distrito: "Santa Anita" },
    { nombre: "Centro Verde Chaclacayo", direccion: "Carretera Central Km 26, Chaclacayo", lat: -11.9860, lng: -76.7720, distrito: "Chaclacayo" },
    { nombre: "Centro Verde Huaycán", direccion: "Av. José Carlos Mariátegui, Zona J, Huaycán", lat: -12.0167, lng: -76.8089, distrito: "Huaycán" },
  ],
  electronico: [
    { nombre: "Centro Verde Javier Prado - La Molina", direccion: "Av. Javier Prado Este 4200, La Molina", lat: -12.0867, lng: -76.9756, distrito: "La Molina" },
    { nombre: "Centro Verde Wiese - SJL", direccion: "Av. Wiese 3855, San Juan de Lurigancho", lat: -12.0267, lng: -77.0034, distrito: "SJL" },
    { nombre: "Centro Verde Chaclacayo", direccion: "Carretera Central Km 27, Chaclacayo", lat: -11.9850, lng: -76.7700, distrito: "Chaclacayo" },
    { nombre: "Centro Verde Nicolás Ayllón - Ate", direccion: "Av. Nicolás Ayllón 2800, Ate", lat: -12.0445, lng: -76.9556, distrito: "Ate" },
    { nombre: "Centro Verde Eucaliptos - Santa Anita", direccion: "Av. Los Eucaliptos 1200, Santa Anita", lat: -12.0501, lng: -76.9734, distrito: "Santa Anita" },
  ],
  peligroso: [
    { nombre: "Centro Verde Separadora Industrial - Ate", direccion: "Av. Separadora Industrial 1800, Ate", lat: -12.0378, lng: -76.9589, distrito: "Ate" },
    { nombre: "Centro Verde Próceres - SJL", direccion: "Av. Próceres de la Independencia 2800, SJL", lat: -12.0145, lng: -77.0023, distrito: "SJL" },
    { nombre: "Centro Verde Raúl Ferrero - La Molina", direccion: "Av. Raúl Ferrero 1560, La Molina", lat: -12.0823, lng: -76.9478, distrito: "La Molina" },
    { nombre: "Centro Verde Chaclacayo", direccion: "Carretera Central Km 28, Chaclacayo", lat: -11.9867, lng: -76.7734, distrito: "Chaclacayo" },
    { nombre: "Centro Verde Chancay - Santa Anita", direccion: "Av. Chancay 890, Santa Anita", lat: -12.0478, lng: -76.9700, distrito: "Santa Anita" },
  ],
  general: [
    { nombre: "Centro Verde Vitarte - Ate", direccion: "Av. Nicolás Ayllón 2100, Ate", lat: -12.0423, lng: -76.9567, distrito: "Ate" },
    { nombre: "Centro Verde Frutales - Santa Anita", direccion: "Av. Los Frutales 340, Santa Anita", lat: -12.0467, lng: -76.9712, distrito: "Santa Anita" },
    { nombre: "Centro Verde La Molina", direccion: "Av. La Molina 1200, La Molina", lat: -12.0772, lng: -76.9432, distrito: "La Molina" },
    { nombre: "Centro Verde Chaclacayo", direccion: "Av. Nicolás Ayllón 8200, Chaclacayo", lat: -11.9845, lng: -76.7689, distrito: "Chaclacayo" },
    { nombre: "Centro Verde Chosica", direccion: "Jr. Lima 320, Lurigancho-Chosica", lat: -11.9394, lng: -76.6972, distrito: "Chosica" },
  ],
};

// plástico, papel y metal comparten la misma red real de Tambo: las tres
// son "acopio directo en mostrador", así que reutilizan la misma lista.
PUNTOS_LIMA.plastico = TAMBO_REAL_LIMA_ESTE;
PUNTOS_LIMA.papel = TAMBO_REAL_LIMA_ESTE;
PUNTOS_LIMA.metal = TAMBO_REAL_LIMA_ESTE;

// A qué red pertenece cada categoría — controla el badge/label mostrado.
const RED_POR_CATEGORIA = {
  plastico: "tambo",
  papel: "tambo",
  metal: "tambo",
  organico: "centro_verde",
  vidrio: "centro_verde",
  electronico: "centro_verde",
  peligroso: "centro_verde",
  general: "centro_verde",
};

const RED_INFO = {
  tambo: { label: "Tambo", icono: "🏪" },
  centro_verde: { label: "Centro Verde Municipal", icono: "♻️" },
};

const COLOR_CATEGORIA = {
  organico:    "#f97316",
  plastico:    "#eab308",
  papel:       "#3b82f6",
  vidrio:      "#14b8a6",
  metal:       "#71717a",
  electronico: "#8b5cf6",
  peligroso:   "#ef4444",
  general:     "#10b981",
};

const EMOJI_CATEGORIA = {
  organico:    "🌿",
  plastico:    "♳",
  papel:       "📄",
  vidrio:      "🫙",
  metal:       "🥫",
  electronico: "💻",
  peligroso:   "⚠️",
  general:     "♻️",
};

const LABEL_CATEGORIA = {
  organico:    "Orgánicos",
  plastico:    "Plástico",
  papel:       "Papel / Cartón",
  vidrio:      "Vidrio",
  metal:       "Metal",
  electronico: "Electrónicos",
  peligroso:   "Peligrosos",
  general:     "General",
};

const CATEGORIAS_VALIDAS = new Set(Object.keys(PUNTOS_LIMA));

/**
 * Detecta la categoría a usar para filtrar el mapa.
 *
 * Prioridad:
 * 1. `filtroForzado` — viene directo del backend (accion_data del chat,
 *    ej. "electronico", "peligroso") cuando el agente conversacional
 *    indicó explícitamente un tipo de residuo. Es la fuente más confiable
 *    porque ya fue calculada en Python a partir de contexto_residuo.tipo,
 *    no inferida por el LLM en texto libre.
 * 2. `resultado.tipo` — viene del JSON de /clasificar o /clasificar-texto.
 * 3. Heurística por palabras clave sobre el nombre del objeto (fallback).
 */
function detectarCategoria(resultado, filtroForzado) {
  if (filtroForzado && CATEGORIAS_VALIDAS.has(filtroForzado)) {
    return filtroForzado;
  }

  if (!resultado) return "general";

  const tipo = resultado.tipo?.toLowerCase();
  if (tipo && PUNTOS_LIMA[tipo]) return tipo;

  const texto = (resultado.nombre || "").toLowerCase();
  if (texto.includes("orgán") || texto.includes("vegetal") || texto.includes("aliment")) return "organico";
  if (texto.includes("plást") || texto.includes("plastic") || texto.includes("pet") || texto.includes("botell")) return "plastico";
  if (texto.includes("papel") || texto.includes("cartón") || texto.includes("carton")) return "papel";
  if (texto.includes("vidrio") || texto.includes("glass")) return "vidrio";
  if (texto.includes("metal") || texto.includes("lata") || texto.includes("alumin")) return "metal";
  if (texto.includes("electrón") || texto.includes("electron") || texto.includes("pila") || texto.includes("bater")) return "electronico";
  if (texto.includes("peligro") || texto.includes("tóxico")) return "peligroso";
  return "general";
}

function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
}

/**
 * @param {object} resultado - JSON de clasificación (de /clasificar o /clasificar-texto)
 * @param {function} onVolver - callback para cerrar el mapa
 * @param {object|string|null} puntoDestino - destino sugerido por el chat.
 *   Acepta dos formas para no romper compatibilidad:
 *   - string: filtro de categoría tal cual llega en accion_data del backend
 *     (ej. "electronico", "peligroso", "general"). Este es el caso típico
 *     cuando el usuario pregunta "dónde lo boto" en el chat de voz.
 *   - object { nombre }: nombre parcial de un punto específico, para
 *     trazar ruta automática a ese punto exacto dentro de la categoría.
 */
export default function VistaMapaPuntos({ resultado, onVolver, puntoDestino = null }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(false);
  const [userPos, setUserPos] = useState(null);
  const [puntosOrdenados, setPuntosOrdenados] = useState([]);
  const [rutaActiva, setRutaActiva] = useState(null);
  const [loadingRuta, setLoadingRuta] = useState(false);
  const [infoRuta, setInfoRuta] = useState(null);

  // Si puntoDestino es un string, es un filtro de categoría (accion_data del chat).
  // Si es un objeto, es un destino específico con nombre (compatibilidad con uso previo).
  const filtroForzado = typeof puntoDestino === "string" ? puntoDestino : null;
  const destinoEspecifico = puntoDestino && typeof puntoDestino === "object" ? puntoDestino : null;

  const categoria = detectarCategoria(resultado, filtroForzado);
  const puntos = PUNTOS_LIMA[categoria] || PUNTOS_LIMA.general;
  const color = COLOR_CATEGORIA[categoria];
  const emoji = EMOJI_CATEGORIA[categoria];
  const label = LABEL_CATEGORIA[categoria];
  const red = RED_POR_CATEGORIA[categoria] || "centro_verde";
  const redInfo = RED_INFO[red];

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"],
            tileSize: 256,
            attribution: "© CARTO, © OpenStreetMap contributors",
          },
        },
        layers: [{ id: "carto-dark-layer", type: "raster", source: "carto-dark" }],
      },
      center: [-77.03, -12.1],
      zoom: 12,
    });

    mapRef.current = map;

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false,
    });

    map.addControl(geolocate, "top-right");
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      geolocate.trigger();

      puntos.forEach((punto) => {
        // DESPUÉS — marker con foto si es Tambo, emoji si no:
const el = document.createElement("div");
const esTambo = red === "tambo";

el.style.cssText = `
  width: 28px; height: 28px;
  background: ${esTambo ? "#fff" : color};
  border-radius: ${esTambo ? "10px" : "50% 50% 50% 0"};
  transform: ${esTambo ? "none" : "rotate(-45deg)"};
  border: 2px solid ${esTambo ? color : "#030805"};
  box-shadow: 0 0 12px ${color}88;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  overflow: hidden;
  padding: ${esTambo ? "3px" : "0"};
`;

if (esTambo) {
  const img = document.createElement("img");
  img.src = "/images/tambo2.png"; // 👈 pon aquí tu imagen
  img.style.cssText = "width: 100%; height: 100%; object-fit: contain;";
  el.appendChild(img);
} else {
  const inner = document.createElement("span");
  inner.style.cssText = "transform: rotate(45deg); font-size: 14px;";
  inner.textContent = emoji;
  el.appendChild(inner);
}

        new mapboxgl.Marker({ element: el })
          .setLngLat([punto.lng, punto.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25, className: "quipu-popup" })
              .setHTML(`
  <div style="font-family: sans-serif; min-width: 180px;">
    <p style="font-weight: 800; color: #111; margin: 0 0 4px;">${emoji} ${punto.nombre}</p>
    <p style="font-size: 11px; color: #555; margin: 0 0 8px;">📍 ${punto.direccion}</p>
    <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
      <span style="font-size: 9px; background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 10px; border: 1px solid ${color}44; font-weight: 700; text-transform: uppercase;">
        ${punto.distrito}
      </span>
      ${red === "tambo"
        ? `<span style="display:inline-flex; align-items:center; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:2px 6px;">
             <img src="/images/tambo2.png" style="height:14px; width:auto; object-fit:contain;" />
           </span>`
        : `<span style="font-size: 9px; background: #ffffff14; color: #d4d4d8; padding: 2px 8px; border-radius: 10px; border: 1px solid #ffffff22; font-weight: 700; text-transform: uppercase;">
             ${redInfo.icono} ${redInfo.label}
           </span>`
      }
    </div>
  </div>
`)
          )
          .addTo(map);
      });

      const bounds = new mapboxgl.LngLatBounds();
      puntos.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 80 });
    });

    geolocate.on("geolocate", (e) => {
      const { latitude, longitude } = e.coords;
      setUserPos({ lat: latitude, lng: longitude });

      const ordenados = [...puntos]
        .map((p) => ({ ...p, distancia: calcularDistancia(latitude, longitude, p.lat, p.lng) }))
        .sort((a, b) => parseFloat(a.distancia) - parseFloat(b.distancia));

      setPuntosOrdenados(ordenados);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      routeLayerRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-ruta cuando el agente indica un destino específico por nombre.
  // Si solo llega un filtro de categoría (string), no trazamos ruta automática:
  // el usuario elige el punto desde las cards inferiores. Esto evita rutas
  // "adivinadas" a un punto equivocado dentro de la categoría.
  useEffect(() => {
    if (!destinoEspecifico?.nombre || !userPos || puntosOrdenados.length === 0) return;

    const destino =
      puntosOrdenados.find(
        (p) =>
          p.nombre.toLowerCase().includes(destinoEspecifico.nombre.toLowerCase()) ||
          destinoEspecifico.nombre.toLowerCase().includes(p.nombre.toLowerCase())
      ) || puntosOrdenados[0];

    trazarRuta(destino);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinoEspecifico, userPos, puntosOrdenados]);

  const trazarRuta = async (punto) => {
    if (!userPos || !mapRef.current) return;
    setLoadingRuta(punto.nombre);
    setRutaActiva(punto.nombre);

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${userPos.lng},${userPos.lat};${punto.lng},${punto.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      const route = data.routes[0];
      const geojson = route.geometry;

      const map = mapRef.current;

      if (map.getLayer("route")) map.removeLayer("route");
      if (map.getSource("route")) map.removeSource("route");

      map.addSource("route", { type: "geojson", data: { type: "Feature", geometry: geojson } });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": color, "line-width": 4, "line-opacity": 0.9 },
      });

      const bounds = new mapboxgl.LngLatBounds();
      geojson.coordinates.forEach((c) => bounds.extend(c));
      map.fitBounds(bounds, { padding: 80 });

      const minsCaminar = Math.round(route.duration / 60);
const km = (route.distance / 1000).toFixed(1);
const minsCarro = Math.max(1, Math.round(minsCaminar / 5));
setInfoRuta({ nombre: punto.nombre, minsCaminar, minsCarro, km });

    } catch {
      setInfoRuta({ nombre: punto.nombre, error: true });
    } finally {
      setLoadingRuta(null);
    }
  };

  const listaFinal = puntosOrdenados.length > 0 ? puntosOrdenados : puntos;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030805] flex flex-col">

      {/* Header flotante */}
{/* Header flotante */}
<div className="absolute top-4 left-4 z-40 bg-[#0a1910]/85 border border-emerald-900/20 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md flex items-center gap-3 w-[320px]">
        <button
          onClick={onVolver}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition text-zinc-300 active:scale-95 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: color + "20", border: `1px solid ${color}33` }}
        >
          <span>{emoji}</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-xs font-extrabold text-white leading-none tracking-tight">
            {redInfo.icono} {redInfo.label} · {label}
          </h2>
          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
            {puntos.length} puntos · {userPos ? "ordenados por distancia" : "activa tu ubicación"}
          </p>
        </div>
      </div>

      {/* Toast de info de ruta */}
{infoRuta && (
  <div className="absolute bottom-53 right-4 z-50 bg-[#0a1910]/85 border border-emerald-900/20 rounded-2xl px-4 py-3 flex items-center justify-between backdrop-blur-md shadow-xl w-[320px]">
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-white truncate">{infoRuta.nombre}</p>
      <p className="text-[10px] text-emerald-400 mt-0.5">
        {infoRuta.error
          ? "No se pudo trazar la ruta."
          : `🚗 ${infoRuta.minsCarro} min · 🚶 ${infoRuta.minsCaminar} min · ${infoRuta.km} km`}
      </p>
    </div>
    <button
      onClick={() => setInfoRuta(null)}
      className="text-zinc-400 hover:text-white text-xs flex-shrink-0 transition"
    >
      ✕
    </button>
  </div>
)}

      {/* Mapa */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Cards bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-40 bg-[#0a1910]/90 border border-emerald-900/20 rounded-[28px] pt-3 pb-4 px-4 shadow-xl backdrop-blur-md flex flex-col gap-2.5">
        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider px-1">
          {userPos ? "📍 Ordenado por proximidad · Toca para trazar ruta" : "Toca un punto para ver detalles"}
        </p>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-0.5">
          {listaFinal.map((punto, i) => (
            <div
              key={i}
              onClick={() => trazarRuta(punto)}
              className={`flex-shrink-0 bg-black/45 border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 w-48 h-32 text-left active:scale-95 ${
                rutaActiva === punto.nombre ? "border-emerald-500/40" : "border-emerald-950/40 hover:border-emerald-500/20"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-[8px]"
                    style={{ background: color }}
                  >
                    {i + 1}
                  </div>
                  <h4 className="text-[11px] font-extrabold text-white tracking-tight line-clamp-1">
                    {punto.nombre}
                  </h4>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">
                  {punto.direccion}
                </p>
                {punto.distancia && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5" />
                    {punto.distancia}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
                <span className="text-[8px] font-bold text-zinc-400 uppercase">
                  {punto.distrito} · {redInfo.icono} {redInfo.label}
                </span>
                {loadingRuta === punto.nombre ? (
                  <span className="text-[9px] text-zinc-400">Trazando...</span>
                ) : (
                  <span
                    className="text-[9px] font-extrabold flex items-center gap-0.5 text-white px-2.5 py-1 rounded-lg"
                    style={{ background: color }}
                  >
                    Ruta <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}