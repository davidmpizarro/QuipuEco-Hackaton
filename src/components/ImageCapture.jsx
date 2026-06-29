import { useState, useRef } from "react";
import axios from "axios";
import { UploadCloud, Camera, RefreshCw, Sparkles, Image as ImageIcon, AlertCircle, Trash2, Apple, Wine, ShoppingBag, Newspaper, Biohazard } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function ImageCapture({ onResult }) {
  const [tab, setTab] = useState("upload");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError(null);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setError("No se pudo acceder a la cámara. Concede permisos o sube una foto.");
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const f = new File([blob], "captura.jpg", { type: "image/jpeg" });
      setFile(f);
      setPreview(URL.createObjectURL(f));
      stopCamera();
    }, "image/jpeg", 0.85);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const resetAll = () => {
    setPreview(null);
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const clasificar = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post(`${API_URL}/clasificar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onResult(data, preview);
    } catch (e) {
      setError(e.response?.data?.detail || "Error al clasificar el residuo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-5 py-3 space-y-4">
      {/* Tabs */}
      <div className="flex p-1 rounded-xl bg-emerald-950/40 border border-emerald-900/10">
        {[
          { id: "upload", icon: UploadCloud, text: "Subir foto" },
          { id: "camera", icon: Camera, text: "Usar cámara" },
        ].map((t) => {
          const Icon = t.icon;
          const activo = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); resetAll(); stopCamera(); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                activo
                  ? "bg-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.text}
            </button>
          );
        })}
      </div>

      {/* Upload Zone */}
      {tab === "upload" && !preview && (
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border border-dashed border-emerald-500/20 rounded-3xl p-10 text-center cursor-pointer bg-[#0a1910]/30 hover:bg-emerald-950/20 hover:border-emerald-500/40 transition-all duration-300 group flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-white text-sm font-semibold tracking-tight mb-1">
              Arrastra o selecciona tu imagen
            </p>
            <p className="text-zinc-500 text-xs font-medium">
              Formatos soportados: JPG, PNG, WEBP (máx. 10MB)
            </p>
            <div className="mt-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.25)]">
              Buscar en dispositivo
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Reference Items Grid */}
<div className="grid grid-cols-3 gap-2">
  {[
    { Icon: Trash2,      label: "Gral.",     color: "bg-zinc-800/50   text-zinc-300   border-zinc-700/30"   },
    { Icon: Apple,       label: "Orgánico",  color: "bg-orange-950/30 text-orange-300 border-orange-800/20" },
    { Icon: Wine,        label: "Vidrio",    color: "bg-teal-950/30   text-teal-300   border-teal-800/20"   },
    { Icon: ShoppingBag, label: "Plástico",  color: "bg-yellow-950/30 text-yellow-300 border-yellow-800/20" },
    { Icon: Newspaper,   label: "Papel",     color: "bg-blue-950/30   text-blue-300   border-blue-800/20"   },
    { Icon: Biohazard,   label: "Peligroso", color: "bg-red-950/30    text-red-300    border-red-800/20"    },
  ].map(({ Icon, label, color }) => (
    <div key={label} className={`${color} border rounded-xl p-2 text-center flex flex-col items-center justify-center gap-1`}>
      <Icon className="w-5 h-5" />
      <span className="text-[9px] font-bold tracking-tight">{label}</span>
    </div>
  ))}
</div>
        </div>
      )}

      {/* Camera Stream Viewfinder */}
      {tab === "camera" && !preview && (
        <div className="rounded-3xl overflow-hidden bg-zinc-950 border border-emerald-950/50 aspect-square flex items-center justify-center relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={cameraActive ? "w-full h-full object-cover" : "hidden"}
          />
          
          {/* Laser Scanline & Target Brackets Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
              {/* Scanline line */}
              <div className="absolute w-full h-[2px] bg-emerald-400 shadow-[0_0_8px_#34d399] left-0 animate-scanline" />

              {/* Viewfinder Target Brackets (Corners) */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

              {/* Sci-Fi HUD overlays */}
              <div className="flex justify-between items-center text-[8px] font-mono text-emerald-400 bg-black/40 backdrop-blur-[2px] px-2 py-1 rounded w-full">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  REC AUTO_SCAN
                </span>
                <span>ISO 400 · F/2.4</span>
              </div>
              <div className="flex justify-between items-end text-[8px] font-mono text-emerald-400 bg-black/40 backdrop-blur-[2px] px-2 py-1 rounded w-full">
                <span>ZOOM 1.0X</span>
                <span>AI_ENGINE: VER_2.5</span>
              </div>
            </div>
          )}

          {!cameraActive && (
            <div className="text-center p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-900/20 flex items-center justify-center mb-4 text-emerald-400">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-white text-sm font-semibold tracking-tight mb-4">Apunta directamente al residuo</p>
              <button
                onClick={startCamera}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              >
                Activar cámara
              </button>
            </div>
          )}
        </div>
      )}

      {/* Camera Active Control Buttons */}
      {tab === "camera" && cameraActive && !preview && (
        <div className="flex gap-2">
          <button
            onClick={stopCamera}
            className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-2xl text-xs font-bold transition"
          >
            Cancelar
          </button>
          <button
            onClick={captureFrame}
            className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl text-xs font-bold transition shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5"
          >
            <Camera className="w-4 h-4" /> Capturar Foto
          </button>
        </div>
      )}

      {/* Image Preview & Analysis Stage */}
      {preview && (
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden border border-emerald-900/30 bg-zinc-950 relative aspect-square flex items-center justify-center">
            <img
              src={preview}
              alt="Residuo a clasificar"
              className="w-full h-full object-cover"
            />
            {/* Visual scanning overlay during analysis */}
            {loading && (
              <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none">
                <div className="absolute w-full h-[2px] bg-emerald-400 shadow-[0_0_8px_#34d399] left-0 animate-scanline" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs">
                  <div className="text-center p-6 space-y-3">
                    <div className="relative w-12 h-12 mx-auto">
                      <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-ping" />
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="text-emerald-400 text-xs font-mono uppercase tracking-wider animate-pulse">Analizando con IA...</p>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">QuipuEco está identificando el material</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div className="flex gap-2">
              <button
                onClick={resetAll}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-2xl text-xs font-bold transition"
              >
                Volver
              </button>
              <button
                onClick={clasificar}
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" /> Clasificar Residuo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs font-medium text-left leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}