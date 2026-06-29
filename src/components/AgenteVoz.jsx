import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, X, MessageCircle } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000";

export default function AgenteVoz({ resultado, onAccion, onCerrar, historialInicial = [], onHistorialChange }) {
  const [escuchando, setEscuchando] = useState(false);
  const [hablando, setHablando] = useState(false);
 const saludoEnviadoRef = useRef(true); // siempre true, ya no lo usamos para texto

const getSaludoInicial = () => {
  if (historialInicial.length > 0) return historialInicial;
  const texto = resultado
    ? (resultado.respuesta_voz || `He clasificado ${resultado.nombre}. Puedes preguntarme cómo reciclarlo o dónde llevarlo.`)
    : "¡Hola! Soy QuipuEco, tu asistente de reciclaje para Lima. Toca el micrófono y dime qué residuo tienes.";
  return [{ rol: "agente", texto }];
};

const [historial, setHistorial] = useState(getSaludoInicial);
  const [transcripcion, setTranscripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const escuchaActivaRef = useRef(false);
  const loadingRef = useRef(false);
  const coordsRef = useRef(null);
  const modoManualRef = useRef(false);
  const timeoutSilencioRef = useRef(null);
  // Ref para diferir onHistorialChange fuera del ciclo de render
  const onHistorialChangeRef = useRef(onHistorialChange);
  useEffect(() => { onHistorialChangeRef.current = onHistorialChange; }, [onHistorialChange]);

  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // ── Despacha la acción pendiente fuera del ciclo de render ──
  useEffect(() => {
    if (!accionPendiente) return;
    const timer = setTimeout(() => {
      onAccion(accionPendiente.accion, accionPendiente.data, accionPendiente.puntoCercano);
      setAccionPendiente(null);
    }, 1800);
    return () => clearTimeout(timer);
  }, [accionPendiente]);

  useEffect(() => {
  if (historialInicial.length > 0) return; // ya había historial, no saludar

  const saludo = historial[0]?.texto;
  if (!saludo || !window.speechSynthesis) {
    escuchaActivaRef.current = true;
    return;
  }

  const timer = setTimeout(() => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(saludo);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const asignarVoz = () => {
      const voces = window.speechSynthesis.getVoices();
      const voz =
        voces.find(v => v.name === "Microsoft Sabina") ||
        voces.find(v => v.name === "Microsoft Laura") ||
        voces.find(v => v.name === "Microsoft Helena") ||
        voces.find(v => v.lang.startsWith("es"));
      if (voz) utterance.voice = voz;
      utterance.lang = voz?.lang || "es-MX";
      utterance.onstart = () => setHablando(true);
      utterance.onend = () => {
        setHablando(false);
        
      };
      utterance.onerror = () => {
        setHablando(false);
        
      };
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { asignarVoz(); window.speechSynthesis.onvoiceschanged = null; };
    } else {
      asignarVoz();
    }
  }, 150);

  return () => clearTimeout(timer);
}, []); // eslint-disable-line

// ── Geolocation + cleanup (sin timer de escucha, eso lo maneja el saludo) ──
useEffect(() => {
  navigator.geolocation?.getCurrentPosition(
    (pos) => {
      coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    },
    () => {}
  );

  return () => {
    escuchaActivaRef.current = false;
    limpiarTimeoutSilencio();
    recognitionRef.current?.abort();
    window.speechSynthesis?.cancel();
  };
}, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial]);

  const limpiarTimeoutSilencio = () => {
    if (timeoutSilencioRef.current) {
      clearTimeout(timeoutSilencioRef.current);
      timeoutSilencioRef.current = null;
    }
  };

  const agregarMensaje = (rol, texto) => {
    setHistorial(prev => {
      const nuevo = [...prev, { rol, texto }];
      // Llamar via ref para no capturar prop stale y evitar problemas de render
      setTimeout(() => onHistorialChangeRef.current?.(nuevo), 0);
      return nuevo;
    });
  };

  const hablar = (texto) => {
    if (!window.speechSynthesis) return;
    recognitionRef.current?.abort();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const asignarVoz = () => {
      const voces = window.speechSynthesis.getVoices();
      const voz =
        voces.find(v => v.name === "Microsoft Sabina") ||
        voces.find(v => v.name === "Microsoft Laura") ||
        voces.find(v => v.name === "Microsoft Helena") ||
        voces.find(v => v.lang.startsWith("es"));
      if (voz) utterance.voice = voz;
      utterance.lang = voz?.lang || "es-MX";
      utterance.onstart = () => { setHablando(true); setError(null); };
      utterance.onend = () => {
        setHablando(false);
        if (escuchaActivaRef.current) setTimeout(() => iniciarEscucha({ manual: false }), 500);
      };
      utterance.onerror = () => {
        setHablando(false);
        if (escuchaActivaRef.current) setTimeout(() => iniciarEscucha({ manual: false }), 500);
      };
      window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { asignarVoz(); window.speechSynthesis.onvoiceschanged = null; };
    } else {
      asignarVoz();
    }
  };

  const iniciarEscucha = ({ manual = false } = {}) => {
    if (!escuchaActivaRef.current) return;
    if (window.speechSynthesis?.speaking) return;
    if (loadingRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("Tu navegador no soporta reconocimiento de voz. Usa Chrome."); return; }

    recognitionRef.current?.abort();
    setError(null);
    modoManualRef.current = manual;

    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setEscuchando(true); setError(null); };

    recognition.onend = () => {
      setEscuchando(false);
      if (!escuchaActivaRef.current) return;
      if (!window.speechSynthesis?.speaking && !loadingRef.current) {
        setTimeout(() => iniciarEscucha({ manual: modoManualRef.current }), 300);
      }
    };

    recognition.onresult = (e) => {
      const texto = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscripcion(texto);
      if (texto.trim()) limpiarTimeoutSilencio();
      if (e.results[e.results.length - 1].isFinal) {
        setTranscripcion("");
        limpiarTimeoutSilencio();
        if (texto.trim()) enviarMensaje(texto.trim());
      }
    };

    recognition.onerror = (e) => {
      setEscuchando(false);
      setTranscripcion("");
      if (e.error === "no-speech" || e.error === "aborted") {
        if (!escuchaActivaRef.current) return;
        if (!loadingRef.current) setTimeout(() => iniciarEscucha({ manual: modoManualRef.current }), 300);
        return;
      }
      if (e.error === "not-allowed") {
        setError("Permiso de micrófono denegado. Actívalo en tu navegador.");
        escuchaActivaRef.current = false;
        limpiarTimeoutSilencio();
        return;
      }
      if (escuchaActivaRef.current) setTimeout(() => iniciarEscucha({ manual: modoManualRef.current }), 500);
    };

    try { recognition.start(); } catch { /* ya corriendo */ }
  };

  const toggleEscucha = () => {
    if (escuchaActivaRef.current) {
      escuchaActivaRef.current = false;
      limpiarTimeoutSilencio();
      recognitionRef.current?.abort();
      setEscuchando(false);
      setTranscripcion("");
    } else {
      escuchaActivaRef.current = true;
      setError(null);
      timeoutSilencioRef.current = setTimeout(() => {
        escuchaActivaRef.current = false;
        recognitionRef.current?.abort();
        setEscuchando(false);
        setTranscripcion("");
        setError("No te escuché. Pulsa el micrófono para hablar de nuevo.");
      }, 10000);
      iniciarEscucha({ manual: true });
    }
  };

  const enviarMensaje = async (texto) => {
    if (!texto.trim() || loadingRef.current) return;
    agregarMensaje("usuario", texto);
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/chat`, {
  mensaje: texto,
  historial: historial.slice(-10),
  contexto_residuo: resultado ?? null,  // ← asegura null explícito
  ...(coordsRef.current ?? {}),
});
      if (data.respuesta) {
        agregarMensaje("agente", data.respuesta);
        hablar(data.respuesta);
      }
      if (data.accion === "mapa") {
        setAccionPendiente({
          accion: "mapa",
          data: data.accion_data || null,
          puntoCercano: data.punto_cercano || null,
        });
      } else if (data.accion === "dashboard") {
        setAccionPendiente({ accion: "dashboard", data: null, puntoCercano: null });
      }
    } catch {
      const msg = "Lo siento, hubo un error al conectar. Intenta de nuevo.";
      agregarMensaje("agente", msg);
      hablar(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[50] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-[#050d1a] border border-emerald-900/30 rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "88%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-900/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              escuchando ? "bg-red-500" : hablando ? "bg-blue-600" : "bg-emerald-600"
            }`}>
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Agente QuipuEco</p>
              <p className={`text-[10px] font-semibold ${
                escuchando ? "text-red-400" :
                hablando ? "text-blue-400" :
                loading ? "text-amber-400" :
                "text-emerald-400"
              }`}>
                {escuchando ? "🎙 Escuchando..." :
                 hablando ? "🔊 Hablando..." :
                 loading ? "⏳ Pensando..." :
                 escuchaActivaRef.current ? "✓ Listo" : "🔇 Micrófono apagado"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              escuchaActivaRef.current = false;
              limpiarTimeoutSilencio();
              window.speechSynthesis?.cancel();
              recognitionRef.current?.abort();
              onCerrar();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {historial.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-500">Cargando agente...</p>
            </div>
          )}
          {historial.map((msg, i) => (
            <div key={i} className={`flex ${msg.rol === "usuario" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                msg.rol === "usuario"
                  ? "bg-emerald-600 text-white rounded-br-sm"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm"
              }`}>
                {msg.texto}
              </div>
            </div>
          ))}
          {transcripcion && (
            <div className="flex justify-end">
              <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs bg-emerald-900/30 border border-emerald-800/30 text-emerald-300 italic rounded-br-sm">
                {transcripcion}...
              </div>
            </div>
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 rounded-bl-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          {error && <p className="text-[10px] text-red-400 text-center font-medium">{error}</p>}
          <div ref={chatEndRef} />
        </div>

        {/* Footer mic */}
        <div className="px-5 py-4 border-t border-emerald-900/20 flex flex-col items-center gap-2 flex-shrink-0">
          <p className="text-[10px] text-zinc-500 text-center">
            {escuchando ? "Habla ahora, te estoy escuchando" :
             hablando ? "Espera a que termine de hablar..." :
             loading ? "Procesando tu mensaje..." :
             escuchaActivaRef.current ? "Habla cuando quieras" : "Toca para activar el micrófono"}
          </p>
          <button
            onClick={toggleEscucha}
            disabled={loading || hablando}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              escuchando ? "bg-red-500 shadow-red-500/40 scale-110" :
              hablando ? "bg-blue-600 shadow-blue-600/30" :
              escuchaActivaRef.current ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30" :
              "bg-zinc-700 hover:bg-zinc-600 shadow-zinc-700/30"
            }`}
          >
            {escuchando ? <MicOff className="w-7 h-7 text-white" /> :
             hablando ? <Volume2 className="w-7 h-7 text-white animate-pulse" /> :
             <Mic className="w-7 h-7 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}