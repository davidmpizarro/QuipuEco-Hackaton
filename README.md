# ♻️ QuipuEco — Asistente de Reciclaje con IA para Lima

![QuipuEco Banner](public/images/quipueco-agente-v2.png)

QuipuEco es una aplicación web progresiva que usa **visión por computadora**, un **agente de voz conversacional** y **mapas en tiempo real** para ayudar a los limeños a reciclar correctamente sus residuos sólidos, conectándolos con la red de tiendas **Tambo** y los **Centros Verdes municipales** de Lima.

---

## 🎯 Problema que resuelve

Lima genera más de **9,000 toneladas de residuos sólidos al día**, pero la tasa de reciclaje formal es inferior al 2%. La barrera principal no es la falta de voluntad, es la falta de información en el momento correcto: ¿qué puedo reciclar? ¿dónde lo llevo? ¿cómo lo preparo?

QuipuEco responde esas tres preguntas en segundos, directamente desde el celular.

---

## ✨ Funcionalidades principales

### 📸 Clasificación por Visión por Computadora
Toma una foto o sube una imagen de tu residuo. La IA lo identifica al instante y te dice:
- Tipo de material (plástico, papel, vidrio, orgánico, metal, electrónico, peligroso)
- Cómo prepararlo correctamente antes de reciclarlo
- Cuánto CO₂ evitas al reciclarlo
- A qué punto de acopio llevarlo

### 🎙️ Agente de Voz Conversacional
Habla directamente con QuipuEco. Pregúntale:
- *"¿Cómo preparo esta botella antes de llevarla?"*
- *"¿Cuál es el Tambo más cercano?"*
- *"Muéstrame los puntos de acopio de electrónicos"*

El agente responde en voz y texto, y puede abrir el mapa directamente desde la conversación.

### 🗺️ Mapa de Puntos de Acopio en Tiempo Real
Encuentra los puntos de reciclaje más cercanos con:
- Geolocalización del usuario
- Rutas a pie y en auto con tiempo estimado
- Filtros por tipo de material
- Integración con **6+ tiendas Tambo** en Lima Este

### 🏆 Sistema de Puntos e Impacto
Cada residuo clasificado y entregado suma puntos y avanza tu rango:
- 🌱 Semilla Eco → 🌳 Árbol Joven → 🌍 Guardián Verde
- Registro de CO₂ evitado y kg reciclados
- Historial de entregas por categoría

---

## 🤝 Alianza con Tambo+

QuipuEco se integra con la red de **tiendas Tambo+** en Lima Este como puntos de acopio para plástico, papel y metal — materiales que pueden entregarse directamente en el mostrador sin cita previa.

| Local | Distrito |
|-------|----------|
| Tambo Riva Agüero | El Agustino |
| Tambo Paracas | Ate |
| Tambo Corregidor | La Molina |
| Tambo Alondras | Santa Anita |
| Tambo Ayllón | Chaclacayo |
| Tambo Huaycán | Ate |

Para vidrio, orgánicos, electrónicos y residuos peligrosos, QuipuEco dirige al usuario a los **Centros Verdes municipales** más cercanos.

---

## 🛠️ Stack tecnológico

### Frontend
- **React + Vite** — SPA con routing por estado
- **Tailwind CSS** — diseño responsive mobile-first
- **GSAP** — animaciones de entrada en desktop
- **Mapbox GL JS** — mapas interactivos con geolocalización
- **Web Speech API** — reconocimiento y síntesis de voz nativa

### Backend
- **FastAPI (Python)** — API REST con endpoints de clasificación y chat
- **Google Gemini** (`gemini-3.1-flash-lite`) — visión por computadora y agente conversacional
- **Algoritmo Haversine** — cálculo de distancias y punto más cercano

### Arquitectura
```
Usuario
  ↓ foto / voz
React Frontend
  ↓ POST /clasificar o /chat
FastAPI Backend
  ↓ imagen + prompt
Google Gemini API
  ↓ JSON clasificación / respuesta conversacional
Frontend → UI + TTS + Mapa
```

---

## 🚀 Instalación y ejecución local

### Prerrequisitos
- Node.js 18+
- Python 3.11+
- Cuenta en [Google AI Studio](https://aistudio.google.com/) (API key de Gemini)
- Token de [Mapbox](https://mapbox.com/)

### Frontend
```bash
cd quipueco-frontend
npm install
# Crea un archivo .env con:
# VITE_MAPBOX_TOKEN=tu_token_aqui
npm run dev
```

### Backend
```bash
cd quipueco-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Crea un archivo .env con:
# GEMINI_API_KEY=tu_api_key_aqui
uvicorn app.main:app --reload
```

La app estará disponible en `http://localhost:5173` y el backend en `http://localhost:8000`.

---

## 📁 Estructura del proyecto

```
quipueco-frontend/
├── src/
│   ├── components/
│   │   ├── ImageCapture.jsx       # Subida y captura de imágenes
│   │   ├── ClassificationResult.jsx # Resultado de clasificación
│   │   ├── AgenteVoz.jsx          # Chat de voz conversacional
│   │   ├── VistaMapaPuntos.jsx    # Mapa fullscreen con rutas
│   │   └── ImpactDashboard.jsx    # Panel de impacto y puntos
│   ├── hooks/
│   │   └── useHistorial.js        # Gestión de historial y puntos
│   └── App.jsx                    # Layout principal + routing
├── public/
│   ├── images/                    # Assets e imágenes
│   └── videos/                    # Demo video

quipueco-backend/
├── app/
│   ├── main.py                    # Endpoints FastAPI
│   ├── prompts.py                 # Prompts de clasificación y chat
│   ├── models.py                  # Modelos Pydantic
│   ├── utils.py                   # Algoritmo Haversine
│   └── config.py                  # Configuración Gemini
└── data/
    └── puntos.py                  # Datos de puntos de acopio
```

---

## 🌍 Impacto potencial

- **+2,000** tiendas Tambo en el Perú como red de acopio escalable
- **Lima Este** como piloto: Ate, Santa Anita, La Molina, Chaclacayo, El Agustino
- Reducción del tiempo de decisión de reciclaje de minutos a **segundos**
- Gamificación que incentiva entregas recurrentes

---

## 👥 Equipo

**Equipo QuipuEco** — Hackathon Tecsup 2026

Desarrollado con 💚 en Lima, Perú.

---

## 📄 Licencia

MIT License — libre para usar, modificar y distribuir con atribución.