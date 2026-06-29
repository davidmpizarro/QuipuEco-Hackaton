import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Sparkles, 
  Brain, 
  Camera, 
  MapPin, 
  Trophy, 
  Trash2, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  TrendingUp, 
  Leaf,
  Info
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 168;
const FRAME_PAD = (n) => String(n).padStart(3, "0");
const frameSrc  = (n) => `/frames/ezgif-frame-${FRAME_PAD(n)}.png`;

const RECYCLING_TIPS = [
  "Lima genera más de 8,000 toneladas de residuos al día. Menos del 2% se recicla formalmente.",
  "Un envase de plástico tarda hasta 500 años en degradarse. ¡Clasificarlo evita que contamine nuestro mar!",
  "QuipuEco usa Inteligencia Artificial para identificar materiales y guiarte según las normas de Lima.",
  "Cada distrito de Lima tiene reglas diferentes. QuipuEco las unifica para facilitar tu reciclaje doméstico.",
  "¡Cada residuo cuenta! Clasificar y registrar tu impacto reduce la huella de carbono de la comunidad."
];

export default function SplashScreen({ onDone }) {
  const wrapRef      = useRef(null);   // scroll wrapper (height: 600vh)
  const stickyRef    = useRef(null);   // sticky 100vh container
  const canvasRef    = useRef(null);
  const framesRef    = useRef([]);
  const frameIdxRef  = useRef({ val: 0 });

  // content refs
  const sec1Ref  = useRef(null);
  const sec2Ref  = useRef(null);
  const sec3Ref  = useRef(null);
  const sec4Ref  = useRef(null);
  const ctaRef   = useRef(null);
  const logoRef  = useRef(null);
  const overlayRef = useRef(null);

  const [loadPct, setLoadPct] = useState(0);
  const [ready,   setReady]   = useState(false);
  const [tipIdx,  setTipIdx]  = useState(0);

  /* ── canvas draw ── */
  const drawFrame = (idx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Find the nearest loaded frame
    let img = null;
    let minDistance = Infinity;
    
    const frames = framesRef.current;
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (frames[i] && (frames[i].complete || frames[i].naturalWidth > 0)) {
        const distance = Math.abs(i - idx);
        if (distance < minDistance) {
          minDistance = distance;
          img = frames[i];
        }
      }
    }

    if (!img) return; // No frames loaded yet

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth || 1280, ih = img.naturalHeight || 720;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  };

  const resizeCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
    drawFrame(frameIdxRef.current.val);
  };

  /* ── Progressive Preload ── */
  useEffect(() => {
    // Phase 1 Indices: Every 3rd frame to load fast, plus first & last
    const phase1Indices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 3) {
      phase1Indices.push(i);
    }
    if (!phase1Indices.includes(TOTAL_FRAMES)) {
      phase1Indices.push(TOTAL_FRAMES);
    }

    // Initialize frames array with null
    const initialFrames = new Array(TOTAL_FRAMES).fill(null);
    framesRef.current = initialFrames;

    let loadedP1 = 0;
    const totalP1 = phase1Indices.length;

    phase1Indices.forEach((idx) => {
      const img = new Image();
      img.src = frameSrc(idx);
      img.onload = img.onerror = () => {
        loadedP1++;
        framesRef.current[idx - 1] = img;
        setLoadPct(Math.round((loadedP1 / totalP1) * 100));

        // If it is the current frame, redraw it immediately
        if (frameIdxRef.current.val === idx - 1) {
          drawFrame(frameIdxRef.current.val);
        }

        if (loadedP1 === totalP1) {
          setReady(true);
          // Start Phase 2 background preloading
          preloadPhase2(phase1Indices);
        }
      };
    });

    // Fact carousel timer
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % RECYCLING_TIPS.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const preloadPhase2 = (phase1Indices) => {
    const phase2Indices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!phase1Indices.includes(i)) {
        phase2Indices.push(i);
      }
    }

    // Load in small background batches to preserve main thread performance
    const batchSize = 4;
    let index = 0;

    const loadNextBatch = () => {
      if (index >= phase2Indices.length) return;
      const batch = phase2Indices.slice(index, index + batchSize);
      index += batchSize;

      let batchLoaded = 0;
      batch.forEach((idx) => {
        const img = new Image();
        img.src = frameSrc(idx);
        img.onload = img.onerror = () => {
          framesRef.current[idx - 1] = img;
          batchLoaded++;

          const currentVal = frameIdxRef.current.val;
          // Redraw if we are close to the loaded frame
          if (Math.abs(currentVal - (idx - 1)) <= 1) {
            drawFrame(currentVal);
          }

          if (batchLoaded === batch.length) {
            setTimeout(loadNextBatch, 80);
          }
        };
      });
    };

    // Delay start of background loading so entrance transitions are buttery smooth
    setTimeout(loadNextBatch, 1000);
  };

  /* ── GSAP setup after ready ── */
  useEffect(() => {
    if (!ready) return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    drawFrame(0);

    const ctx = gsap.context(() => {
      /* ═══════════════════════════════════════════
         1. SCRUB DE FRAMES — mapeado al scroll total
      ═══════════════════════════════════════════ */
      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (TOTAL_FRAMES - 1));
          frameIdxRef.current.val = idx;
          drawFrame(idx);
        },
      });

      /* ═══════════════════════════════════════════
         2. OVERLAY — se oscurece en el tramo medio
      ═══════════════════════════════════════════ */
      gsap.to(overlayRef.current, {
        opacity: 0.88,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "15% top",
          end: "55% top",
          scrub: true,
        },
      });

      /* ═══════════════════════════════════════════
         3. SECCIÓN 1 — Hero logo + título (entrada)
      ═══════════════════════════════════════════ */
      const tlHero = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "12% top",
          scrub: 1,
        },
      });
      tlHero
        .fromTo(logoRef.current,
          { scale: 0.4, opacity: 0, y: 40 },
          { scale: 1,   opacity: 1, y: 0 }
        )
        .fromTo(".hero-title",
          { y: 50, opacity: 0 },
          { y: 0,  opacity: 1 }, "-=0.5"
        )
        .fromTo(".hero-sub",
          { y: 30, opacity: 0 },
          { y: 0,  opacity: 1 }, "-=0.4"
        )
        .fromTo(".hero-pills > *",
          { y: 20, opacity: 0, scale: 0.85 },
          { y: 0,  opacity: 1, scale: 1, stagger: 0.08 }, "-=0.3"
        );

      /* Fade out hero al salir */
      gsap.to(sec1Ref.current, {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "14% top",
          end: "22% top",
          scrub: true,
        },
      });

      /* ═══════════════════════════════════════════
         4. SECCIÓN 2 — "¿Qué es QuipuEco?"
      ═══════════════════════════════════════════ */
      gsap.fromTo(sec2Ref.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "22% top",
            end: "32% top",
            scrub: true,
          },
        }
      );
      gsap.to(sec2Ref.current, {
        opacity: 0, y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "35% top",
          end: "43% top",
          scrub: true,
        },
      });

      /* ═══════════════════════════════════════════
         5. SECCIÓN 3 — Desafíos / Features
      ═══════════════════════════════════════════ */
      gsap.fromTo(sec3Ref.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "43% top",
            end: "54% top",
            scrub: true,
          },
        }
      );
      gsap.to(sec3Ref.current, {
        opacity: 0, y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "62% top",
          end: "70% top",
          scrub: true,
        },
      });

      /* ═══════════════════════════════════════════
         6. SECCIÓN 4 — Impacto en números
      ═══════════════════════════════════════════ */
      gsap.fromTo(sec4Ref.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "70% top",
            end: "80% top",
            scrub: true,
          },
        }
      );
      gsap.to(sec4Ref.current, {
        opacity: 0, y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "87% top",
          end: "93% top",
          scrub: true,
        },
      });

      /* ═══════════════════════════════════════════
         7. CTA FINAL
      ═══════════════════════════════════════════ */
      gsap.fromTo(ctaRef.current,
        { opacity: 0, scale: 0.95, y: 40 },
        {
          opacity: 1, scale: 1, y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "93% top",
            end: "98% top",
            scrub: true,
          },
        }
      );

    }, wrapRef);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [ready]);

  /* ── Out animation ── */
  const handleStart = () => {
    gsap.timeline({ onComplete: onDone })
      .to(ctaRef.current,   { opacity: 0, y: 30, duration: 0.25, ease: "power2.in" })
      .to(stickyRef.current, { yPercent: -105, duration: 0.8, ease: "power3.inOut" });
  };

  return (
    <div
      ref={wrapRef}
      style={{ height: "600vh", position: "relative", zIndex: 9999 }}
      className="select-none"
    >
      <div
        ref={stickyRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#030805",
        }}
        className="w-full flex flex-col justify-between"
      >
        {/* Glowing Background Ambiance (Left and Right) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Canvas image-scrub */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover block opacity-90 filter brightness-[0.75] contrast-[1.05]"
        />

        {/* Gradient Overlay */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(3,8,5,0.2) 0%, rgba(3,8,5,0.45) 35%, rgba(3,8,5,0.92) 80%, #030805 100%)",
            opacity: 0.18,
            pointerEvents: "none",
          }}
        />

        {/* ── LOADER SCREEN ── */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030805]/95 z-50 px-6">
            <div className="relative w-28 h-28 flex items-center justify-center mb-8">
              {/* Outer spinning gradient ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500/10 border-t-emerald-400 border-r-emerald-300 animate-spin" style={{ animationDuration: '1.2s' }} />
              {/* Pulsing inner glow */}
              <div className="absolute w-20 h-20 rounded-full bg-emerald-500/5 animate-pulse" />
              {/* Leaf Icon inside */}
              <Leaf className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)] animate-bounce" />
            </div>

            <div className="text-center max-w-md">
              <h3 className="text-xl font-bold font-display text-white mb-2 tracking-wide">Iniciando QuipuEco</h3>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-6">IA para la Clasificación Doméstica</p>
              
              {/* Progress bar */}
              <div className="w-56 h-1.5 bg-zinc-900 border border-emerald-950/40 rounded-full overflow-hidden mx-auto mb-8 relative">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${loadPct}%` }}
                />
              </div>

              {/* Curiosities / Tips card */}
              <div className="glass-panel p-5 rounded-2xl border border-emerald-950/60 shadow-xl max-w-xs mx-auto animate-fade-in transition-all duration-500">
                <div className="flex gap-2.5 items-start text-left">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">¿Sabías que?</span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium transition-all duration-300">
                      {RECYCLING_TIPS[tipIdx]}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-[11px] text-zinc-500 font-mono tracking-wider">
                Cargando recursos · {loadPct}%
              </p>
            </div>
          </div>
        )}

        {ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none z-10">

            {/* ═══ SECCIÓN 1: HERO ═══ */}
            <div ref={sec1Ref} className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-6 text-center opacity-0">
              <div 
                ref={logoRef} 
                className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_4px_20px_rgba(16,185,129,0.35)] border border-emerald-300/30"
              >
                <Leaf className="w-10 h-10" />
              </div>

              <h1 className="hero-title text-5xl md:text-6xl font-extrabold font-display text-white tracking-tight leading-none mb-3 drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
                Quipu<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300 font-black">Eco</span>
              </h1>

              <p className="hero-sub text-xs text-emerald-400 font-bold uppercase tracking-[0.2em] mb-8 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                Inteligencia Artificial de Reciclaje · Lima
              </p>

              <div className="hero-pills flex gap-3 mb-10 flex-wrap justify-center max-w-md">
                {[
                  { icon: Camera, label: "Visión Computacional" },
                  { icon: Brain, label: "Agente de Voz IA" },
                  { icon: MapPin, label: "Acopio Georreferenciado" }
                ].map(({ icon: Icon, label }) => (
                  <span 
                    key={label} 
                    className="glass-panel text-xs text-emerald-300 font-semibold px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-500/20 shadow-md backdrop-blur-md"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    {label}
                  </span>
                ))}
              </div>

              {/* Floating scroll down indicator */}
              <div className="flex flex-col items-center gap-2 opacity-70 animate-bounce">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Desliza para ver más</span>
                <ChevronDown className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* ═══ SECCIÓN 2: ¿QUÉ ES? ═══ */}
            <div ref={sec2Ref} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0">
              <div className="glass-panel p-8 md:p-10 rounded-3xl border border-emerald-500/15 shadow-2xl max-w-xl pointer-events-auto backdrop-blur-xl relative overflow-hidden">
                {/* Decorative border highlight */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
                
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-[0.18em] mb-4 block">
                  El Concepto
                </span>

                <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-5 tracking-tight leading-tight">
                  Clasificación Inteligente para el Hogar
                </h2>

                <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-sans mb-8">
                  QuipuEco es un agente con **Inteligencia Artificial** que resuelve la confusión del reciclaje doméstico en Lima. Clasifica tus residuos al instante mediante imágenes, explica las reglas locales de tu distrito y te guía por voz.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Brain, label: "IA Cognitiva" },
                    { icon: Camera, label: "Visión de Residuo" },
                    { icon: MapPin, label: "Reglas de Lima" }
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-950/40 border border-emerald-950/45 hover:border-emerald-500/30 transition-all duration-300">
                      <Icon className="w-6 h-6 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-zinc-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ SECCIÓN 3: CÓMO FUNCIONA ═══ */}
            <div ref={sec3Ref} className="absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0">
              <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-[0.18em] mb-2 block">
                    Cómo Funciona
                  </span>
                  <h2 className="text-3xl font-bold font-display text-white tracking-tight">
                    3 Pasos Simples con Impacto Real
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { n: "01", icon: Camera, title: "Captura el residuo", desc: "Toma una foto con tu cámara. La IA lo identificará, analizando su material en milisegundos." },
                    { n: "02", icon: ShieldCheck, title: "Recibe guía municipal", desc: "QuipuEco te dirá en qué contenedor va según la normativa peruana y te mostrará los puntos de acopio más cercanos." },
                    { n: "03", icon: Trophy, title: "Mide tu impacto", desc: "Suma puntos ecológicos, registra el peso recuperado y visualiza el CO₂ evitado con cada acción." }
                  ].map((s) => (
                    <div 
                      key={s.n} 
                      className="glass-panel flex gap-5 items-start p-5 rounded-2xl border border-emerald-500/10 shadow-lg pointer-events-auto hover:border-emerald-500/20 hover:translate-x-1.5 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-bold font-display text-sm border border-emerald-500/20 shadow-inner">
                        {s.n}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2 font-display tracking-wide">
                          <s.icon className="w-4 h-4 text-emerald-400" />
                          {s.title}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ SECCIÓN 4: MÉTRICAS ═══ */}
            <div ref={sec4Ref} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-[0.18em] mb-3 block">
                La Problemática en Lima
              </span>

              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-8 tracking-tight max-w-md mx-auto leading-tight">
                El Desafío de la Basura Doméstica
              </h2>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                {[
                  { value: "+8,000", suffix: "Ton", label: "Basura generada al día en Lima", color: "text-amber-500" },
                  { value: "< 2%", suffix: "", label: "Se recicla de forma formal actualmente", color: "text-rose-500" },
                  { value: "43", suffix: "Distritos", label: "Diferentes reglas y calendarios de recojo", color: "text-emerald-400" },
                  { value: "CO₂", suffix: "Evitado", label: "Cálculo en base a peso clasificado", color: "text-mint-400" }
                ].map((d) => (
                  <div 
                    key={d.label} 
                    className="glass-panel p-5 rounded-2xl border border-emerald-500/10 text-center shadow-lg pointer-events-auto hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`text-2xl md:text-3xl font-extrabold font-display ${d.color} tracking-tight mb-1`}>
                      {d.value} <span className="text-xs font-semibold opacity-80">{d.suffix}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed font-sans">{d.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 justify-center max-w-xs text-xs text-zinc-500 font-medium leading-snug">
                <CheckCircle2 className="w-4 h-4 text-emerald-500/70 shrink-0" />
                <span>QuipuEco estandariza y gamifica el reciclaje doméstico para todo Lima.</span>
              </div>
            </div>

            {/* ═══ CTA FINAL ═══ */}
            <div ref={ctaRef} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0 pointer-events-none">
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-3xl flex items-center justify-center text-white mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-emerald-300/20 animate-pulse">
                <Leaf className="w-10 h-10" />
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-tight mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                ¿Listo para transformar<br/>tu forma de reciclar?
              </h2>

              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed font-sans mb-8">
                Clasifica tus residuos con el poder de la IA y visualiza el impacto que generas en tu hogar.
              </p>

              {/* Start Button */}
              <div className="relative group pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-mint-400 rounded-2xl blur-[12px] opacity-60 group-hover:opacity-100 group-hover:blur-[16px] transition duration-300" />
                <button
                  onClick={handleStart}
                  className="relative bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold px-10 py-5 rounded-2xl text-base shadow-[0_4px_20px_rgba(16,185,129,0.4)] cursor-pointer tracking-wide hover:from-emerald-600 hover:to-emerald-500 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 font-display flex items-center gap-2"
                >
                  Comenzar ahora
                  <TrendingUp className="w-5 h-5 text-emerald-100" />
                </button>
              </div>

              <div className="mt-16 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                Hackathon Nacional de IA 2026 · Tecsup
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}