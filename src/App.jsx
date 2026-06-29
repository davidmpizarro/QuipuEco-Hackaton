import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import ImageCapture from "./components/ImageCapture";
import ClassificationResult from "./components/ClassificationResult";
import ImpactDashboard from "./components/ImpactDashboard";
import { useHistorial } from "./hooks/useHistorial";
import VistaMapaPuntos from "./components/VistaMapaPuntos";
import AgenteVoz from "./components/AgenteVoz";
import { Camera, BarChart3, ShieldCheck, Trophy, MapPin, Mic } from "lucide-react";

export default function App() {
  const [vista, setVista] = useState("captura");
  const [resultado, setResultado] = useState(null);
  const [imagen, setImagen] = useState(null);
  const { historial, agregarRegistro, limpiarHistorial, stats } = useHistorial();
  const [resultadoMapa, setResultadoMapa] = useState(null);
  const [puntoDestino, setPuntoDestino] = useState(null);
  const [agenteAbierto, setAgenteAbierto] = useState(false);
  const [historialAgente, setHistorialAgente] = useState([]);

  // ── GSAP refs ──
  const mascotaRef = useRef(null);
  const tituloRef = useRef(null);
  const subtituloRef = useRef(null);
  const badgeRef = useRef(null);
  const footerRef = useRef(null);
  const cardsRef = useRef([]);
  const floatTweenRef = useRef(null);

  // ── Animaciones de entrada (solo en desktop donde existen los elementos) ──
  useEffect(() => {
    // Si los refs no existen (mobile), no animamos
    if (!mascotaRef.current) return;

    const ctx = gsap.context(() => {
      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.1 }
        );
      }

      gsap.fromTo(
        mascotaRef.current,
        { y: -100, opacity: 0, scale: 0.4, rotation: -20 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.3,
          ease: "elastic.out(1, 0.5)",
          delay: 0.3,
          onComplete: () => {
            floatTweenRef.current = gsap.to(mascotaRef.current, {
              y: -14,
              duration: 2.4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          },
        }
      );

      if (tituloRef.current) {
        gsap.fromTo(
          tituloRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.55 }
        );
      }

      if (subtituloRef.current) {
        gsap.fromTo(
          subtituloRef.current,
          { x: -35, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.8 }
        );
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 45, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
            delay: 1.05 + i * 0.13,
          }
        );
      });

      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, delay: 1.7 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // ── Hover: wiggle ──
  const handleMascotaHover = () => {
    if (!mascotaRef.current) return;
    floatTweenRef.current?.pause();
    gsap.to(mascotaRef.current, {
      rotation: 10,
      scale: 1.1,
      duration: 0.14,
      ease: "power1.out",
      onComplete: () =>
        gsap.to(mascotaRef.current, {
          rotation: -7,
          duration: 0.11,
          ease: "power1.inOut",
          onComplete: () =>
            gsap.to(mascotaRef.current, {
              rotation: 0,
              scale: 1,
              duration: 0.22,
              ease: "elastic.out(1, 0.4)",
              onComplete: () => floatTweenRef.current?.resume(),
            }),
        }),
    });
  };

  // ── Click: spin completo ──
  const handleMascotaClick = () => {
    if (!mascotaRef.current) return;
    floatTweenRef.current?.pause();
    gsap
      .timeline({ onComplete: () => floatTweenRef.current?.resume() })
      .to(mascotaRef.current, { scale: 0.82, duration: 0.1 })
      .to(mascotaRef.current, {
        scale: 1.22,
        rotation: 360,
        duration: 0.55,
        ease: "back.out(1.7)",
      })
      .to(mascotaRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
  };

  const handleResult = (data, preview) => {
    agregarRegistro(data, preview);
    setResultado(data);
    setImagen(preview);
    setVista("resultado");
    setHistorialAgente([]);
    setAgenteAbierto(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        data.respuesta_voz ||
          `He clasificado ${data.nombre}. Puedes preguntarme cómo reciclarlo o dónde llevarlo.`
      );
      utterance.rate = 0.95;
      utterance.pitch = 1;
      const asignarVoz = () => {
        const voces = window.speechSynthesis.getVoices();
        const voz =
          voces.find((v) => v.name === "Microsoft Sabina") ||
          voces.find((v) => v.name === "Microsoft Laura") ||
          voces.find((v) => v.name === "Microsoft Helena") ||
          voces.find((v) => v.lang.startsWith("es"));
        if (voz) utterance.voice = voz;
        utterance.lang = voz?.lang || "es-MX";
        window.speechSynthesis.speak(utterance);
      };
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          asignarVoz();
          window.speechSynthesis.onvoiceschanged = null;
        };
      } else {
        asignarVoz();
      }
    }
  };

  const handleReset = () => {
    window.speechSynthesis?.cancel();
    setResultado(null);
    setImagen(null);
    setVista("captura");
    setAgenteAbierto(false);
    setHistorialAgente([]);
  };

  const handleVerMapa = (r, destino = null) => {
    setResultadoMapa(r);
    if (!destino) {
      setPuntoDestino(null);
    } else if (typeof destino === "string") {
      setPuntoDestino(destino);
    } else if (typeof destino === "object" && destino.nombre) {
      setPuntoDestino({ nombre: destino.nombre, ts: Date.now() });
    } else {
      setPuntoDestino(null);
    }
    setVista("mapa");
  };

  const handleTabMapa = () => {
    if (resultado) {
      setResultadoMapa(resultado);
      setPuntoDestino(null);
      setVista("mapa");
    } else {
      setResultadoMapa(null);
      setVista("mapa");
    }
  };

  const tabs = [
    { id: "captura", icon: Camera, label: "Clasificar", onClick: () => setVista(resultado ? "resultado" : "captura") },
    { id: "mapa", icon: MapPin, label: "Mapa", onClick: handleTabMapa },
    { id: "dashboard", icon: BarChart3, label: "Mi impacto", onClick: () => setVista("dashboard") },
  ];

  const featureCards = [
    {
      Icon: Camera,
      title: "Visión por Computadora",
      desc: "Sube una foto y nuestro agente identificará al instante el tipo de residuo y su manejo.",
    },
    {
      Icon: Mic,
      title: "Agente de Voz",
      desc: "Pregúntale a nuestro agente cómo reciclar cualquier residuo con respuestas en audio.",
    },
    {
      Icon: MapPin,
      title: "Puntos de Acopio",
      desc: "Encuentra los centros de reciclaje más cercanos a ti en Lima con rutas en tiempo real.",
    },
    {
      Icon: Trophy,
      title: "Impacto Registrado",
      desc: "Verifica tu entrega en el punto de acopio y participa en sorteos mensuales.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030805] text-zinc-100 font-sans antialiased overflow-x-hidden relative">
      {/* ── Ambient glows ── */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-950/15 rounded-full blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* ── Grid wrapper: sin padding en mobile, con padding en desktop ── */}
      <div className="w-full max-w-6xl mx-auto lg:px-4 lg:py-12 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center lg:min-h-screen">

        {/* ── Left Side (solo desktop) ── */}
        <div className="hidden lg:flex lg:col-span-7 flex-col space-y-8 text-left pr-8">

          {/* Mascota + Título */}
          <div className="flex items-center gap-6 -ml-10">
            <img
              ref={mascotaRef}
              src="/images/quipueco-agente-v2.png"
              alt="Mascota QuipuEco"
              onMouseEnter={handleMascotaHover}
              onClick={handleMascotaClick}
              className="w-44 h-44 xl:w-52 xl:h-52 object-contain cursor-pointer select-none flex-shrink-0 mt-4"
              style={{
                filter:
                  "drop-shadow(0 0 22px rgba(16,185,129,0.45)) drop-shadow(0 0 6px rgba(16,185,129,0.25))",
              }}
              draggable={false}
            />
            <div className="space-y-3">
              <div ref={tituloRef}>
                <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Quipu<span className="text-emerald-500">Eco</span>
                </h1>
              </div>
              <div ref={subtituloRef}>
                <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-lg">
                  Clasifica tus residuos de forma inteligente y descubre cómo reciclarlos correctamente
                </p>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {featureCards.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                ref={(el) => (cardsRef.current[i] = el)}
                className="p-5 rounded-2xl bg-[#0a1910]/80 border border-emerald-900/20 backdrop-blur-sm
                          hover:border-emerald-600/40 hover:bg-[#0d2215]/80 hover:scale-[1.02]
                          transition-all duration-300 cursor-default group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:bg-emerald-800/50 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs text-zinc-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            ref={footerRef}
            className="flex items-center gap-3 text-xs text-zinc-400 border-t border-emerald-900/10 pt-6"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500/60" />
            <span>Desarrollado por el equipo QuipuEco - 2026</span>
          </div>
        </div>

        {/* ── Phone mockup ── */}
        {/* En mobile: w-full h-screen sin bordes. En desktop: max-w-[390px] h-[812px] con frame. */}
        <div className="lg:col-span-5 flex justify-center items-center w-full">
          <div className="w-full lg:max-w-[390px] h-screen lg:h-[812px] bg-black lg:rounded-[50px] lg:border-[10px] lg:border-[#0f1f3d] lg:shadow-[0_25px_60px_-15px_rgba(59,130,246,0.25)] relative flex flex-col overflow-hidden bg-gradient-to-b from-[#050d1a] to-[#020610]">

            {/* Notch solo en desktop */}
            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[26px] bg-black rounded-b-[18px] z-50" />

            <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide relative pb-18 lg:pt-4 pt-0">

              {/* ── Header ── */}
              <div className="sticky top-0 z-30 bg-[#050d1a]/95 backdrop-blur-md border-b border-blue-950/30 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden">
                    <img
                      src="/images/quipueco-agente.png"
                      alt="QuipuEco"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-white tracking-tight leading-none">
                      Quipu<span className="text-emerald-500">Eco</span>
                    </h1>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 tracking-wider">
                      Asistente con IA
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVista(vista === "dashboard" ? "captura" : "dashboard")}
                  className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-900/40 transition active:scale-95"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-emerald-300">{stats.puntos ?? 0} pts</span>
                </button>
              </div>

              {/* ── Content ── */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {vista === "captura" && (
                  <>
                    <div className="px-5 pt-5 pb-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">¿Qué residuo tienes?</h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Fotografíalo o sube una imagen y la IA te dirá cómo gestionarlo en Lima.
                      </p>
                    </div>
                    <ImageCapture onResult={handleResult} />
                  </>
                )}
                {vista === "resultado" && resultado && (
                  <ClassificationResult
                    resultado={resultado}
                    imagen={imagen}
                    onReset={handleReset}
                    onVerMapa={handleVerMapa}
                    agenteAbierto={agenteAbierto}
                    onAbrirAgente={() => setAgenteAbierto(true)}
                    onCerrarAgente={() => setAgenteAbierto(false)}
                    historialAgente={historialAgente}
                    onHistorialAgente={setHistorialAgente}
                  />
                )}
                {vista === "dashboard" && (
                  <>
                    <div className="px-5 pt-5 pb-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">Tu impacto ambiental</h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Registro y estadísticas acumuladas de reciclaje en Lima.
                      </p>
                    </div>
                    <ImpactDashboard stats={stats} historial={historial} onLimpiar={limpiarHistorial} />
                  </>
                )}
                {vista === "mapa" && !resultadoMapa && (
                  <div className="flex flex-col items-center justify-center p-8 h-full min-h-[500px] space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-950/50 border border-emerald-900/30 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-base font-semibold text-white">Puntos de acopio en Lima</p>
                    <p className="text-xs text-zinc-400 text-center leading-relaxed max-w-[200px]">
                      Clasifica un residuo primero para ver los puntos de acopio según el tipo de material.
                    </p>
                    <button
                      onClick={() => setVista("captura")}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition active:scale-95"
                    >
                      Clasificar residuo
                    </button>
                  </div>
                )}
                {vista === "mapa" && resultadoMapa && (
                  <div className="flex flex-col items-center justify-center p-8 h-full min-h-[500px] space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-950/50 border border-emerald-900/20 flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-white">Explorando puntos de acopio</p>
                    <p className="text-xs text-zinc-500 text-center leading-relaxed">
                      El mapa se está mostrando en pantalla completa.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Navbar ── */}
              <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#050d1a]/95 backdrop-blur-md border-t border-blue-950/40 py-2.5 px-4 flex justify-around items-center">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const activo = vista === tab.id || (vista === "resultado" && tab.id === "captura");
                  return (
                    <button
                      key={tab.id}
                      onClick={tab.onClick}
                      className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all duration-300 px-3 py-1 rounded-xl ${
                        activo ? "text-emerald-400 scale-105" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform duration-300 ${
                          activo
                            ? "stroke-[2.5px] drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                            : "stroke-[1.8px]"
                        }`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── FAB Agente de Voz ── */}
            {!agenteAbierto && vista !== "mapa" && (
  <button
    onClick={() => setAgenteAbierto(true)}
    className="absolute bottom-20 right-4 z-50 w-14 h-14 lg:w-10 lg:h-10 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] overflow-hidden border-2 border-emerald-400 transition active:scale-90 animate-pulse"
    title="Abrir agente de voz"
  >
    <img
  src="/images/quipueco-agente.png"
  alt="Agente QuipuEco"
  className="w-full h-full object-cover"
/>
  </button>
)}

            {/* ── Agente flotante ── */}
            {(
  <div className={vista === "mapa" || !agenteAbierto ? "hidden" : ""}>
                <AgenteVoz
                  resultado={resultado}
                  onAccion={(accion, data, puntoCercano) => {
  if (accion === "mapa") {
    if (resultado) {
      const tipoResultado = resultado.tipo;
      const usarPunto = puntoCercano && data === tipoResultado;
      handleVerMapa(resultado, usarPunto ? puntoCercano : data);
    } else {
      // Sin residuo clasificado: pasar un objeto dummy con tipo general
      // para que el mapa fullscreen se active
      handleVerMapa(
        { tipo: data || "general", nombre: "Exploración general" },
        data || null
      );
    }
  }
  if (accion === "dashboard") setVista("dashboard");
}}
                  onCerrar={() => setAgenteAbierto(false)}
                  historialInicial={historialAgente}
                  onHistorialChange={setHistorialAgente}
                />
              </div>
            )}
          </div>
        </div>
      </div>

{/* ── Secciones landing (solo desktop) ── */}
<div className="hidden lg:block w-full max-w-6xl mx-auto px-4 pb-24 space-y-32 mt-16">

  {/* ── Sección Video ── */}
  <section className="space-y-8">
    <div className="text-center space-y-3">
      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Demo en acción</span>
      <h2 className="text-4xl font-extrabold text-white">Mira cómo funciona QuipuEco</h2>
      <p className="text-zinc-400 text-base max-w-xl mx-auto">
        Clasifica tus residuos en segundos con visión por computadora, consulta al agente de voz y encuentra el punto de acopio más cercano.
      </p>
    </div>
    <div className="rounded-[28px] overflow-hidden border border-emerald-900/20 shadow-[0_0_60px_rgba(16,185,129,0.08)] bg-black">
      <video
        controls
        className="w-full"
      >
        <source src="/videos/demo.mp4" type="video/mp4" />
      </video>
    </div>
  </section>

  {/* ── Sección Alianza Tambo ── */}
  <section className="grid grid-cols-2 gap-16 items-center">
    {/* Texto */}
    <div className="space-y-6">
      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Alianza estratégica</span>
      <h2 className="text-4xl font-extrabold text-white leading-tight">
        Recicla en tu <span className="text-emerald-400">Tambo más cercano</span>
      </h2>
      <p className="text-zinc-400 text-base leading-relaxed">
        QuipuEco se integra con la red de tiendas Tambo en Lima Este para que puedas entregar tus residuos de plástico, papel y metal directamente en el mostrador, sin complicaciones.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { num: "6+", label: "Locales en Lima Este" },
          { num: "3", label: "Materiales aceptados" },
          { num: "Pts", label: "Ganas al entregar" },
        ].map(({ num, label }) => (
          <div key={label} className="bg-[#0a1910]/60 border border-emerald-900/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-400">{num}</p>
            <p className="text-[11px] text-zinc-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Materiales */}
      <div className="flex gap-3">
        {[
          { emoji: "🧴", label: "Plástico" },
          { emoji: "📦", label: "Papel / Cartón" },
          { emoji: "🥫", label: "Metal" },
        ].map(({ emoji, label }) => (
          <span key={label} className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/20 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300">
            {emoji} {label}
          </span>
        ))}
      </div>

      {/* Locales Lima Este */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Locales participantes en Lima Este</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { nombre: "Tambo Riva Agüero", distrito: "El Agustino" },
            { nombre: "Tambo Paracas", distrito: "Ate" },
            { nombre: "Tambo Corregidor", distrito: "La Molina" },
            { nombre: "Tambo Alondras", distrito: "Santa Anita" },
            { nombre: "Tambo Ayllón", distrito: "Chaclacayo" },
            { nombre: "Tambo Huaycán", distrito: "Ate" },
          ].map(({ nombre, distrito }) => (
            <div key={nombre} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-medium text-zinc-300">{nombre}</span>
              <span className="text-zinc-600">· {distrito}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Imágenes Tambo */}
    <div className="space-y-4">
      <div className="rounded-[24px] overflow-hidden border border-emerald-900/10 shadow-xl">
        <img src="/images/tambo-tienda.png" alt="Tienda Tambo" className="w-full object-cover" />
      </div>
      <div className="flex items-center justify-center bg-[#8B008B]/10 border border-purple-900/20 rounded-2xl p-6">
        <img src="/images/tambo-logo.png" alt="Logo Tambo" className="h-16 object-contain" />
      </div>
    </div>
  </section>

  {/* Footer landing */}
  <div className="text-center text-xs text-zinc-600 pb-8 border-t border-emerald-900/10 pt-8">
    QuipuEco · Hackathon Tecsup 2026 · Lima, Perú
  </div>
</div>

      {/* ── Mapa fullscreen ── */}
{vista === "mapa" && resultadoMapa && (
  <VistaMapaPuntos
    resultado={resultadoMapa}
    onVolver={() => {
      if (resultado) {
        setVista("resultado");
      } else {
        setVista("captura"); // ← si no había residuo clasificado, vuelve al inicio
      }
    }}
    puntoDestino={puntoDestino}
  />
)}
    </div>
  );
}