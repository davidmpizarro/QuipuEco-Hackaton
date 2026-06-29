import { useState, useEffect } from "react";

const STORAGE_KEY = "quipueco_historial";

export function useHistorial() {
  const [historial, setHistorial] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
  }, [historial]);

  const agregarRegistro = (resultado, imagen) => {
    const nuevo = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      imagen,
      ...resultado,
    };
    setHistorial((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const limpiarHistorial = () => setHistorial([]);

  // Estadísticas calculadas
  const stats = {
    totalItems: historial.length,
    co2Total: historial.reduce((acc, r) => acc + (r.co2_evitado_kg || 0), 0),
    pesoTotal: historial.reduce((acc, r) => acc + (r.peso_estimado_kg || 0), 0),
    porTipo: historial.reduce((acc, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {}),
    puntos: historial.reduce((acc, r) => {
      if (r.tipo === "no_reciclable") return acc + 2;
      if (r.tipo === "peligroso") return acc + 5;
      return acc + 10;
    }, 0),
  };

  return { historial, agregarRegistro, limpiarHistorial, stats };
}