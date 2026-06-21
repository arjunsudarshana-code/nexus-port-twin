# 🚢 Nexus Port Twin — Interactive 3D Digital Twin Engine

An enterprise-grade, high-performance **3D Digital Twin web application** designed to simulate real-time port operations, fleet logistics, and container yard analytics. Built using a cutting-edge modern web stack featuring **Next.js**, **React Three Fiber (R3F)**, and **Three.js**.

---

## 🚀 Key Features & Architectural Highlights

### 1. Ultra-Optimized 60 FPS Night Mode Engine
* **Performance-First Lighting:** Engineered with specialized real-time shadow-mapping optimizations. Support spotlights selectively utilize shadow casting to alleviate heavy GPU overhead, ensuring buttery-smooth 60 FPS navigation on standard modern hardware.
* **Cinematic Atmospheric Effects:** Dynamically handles transitions between a vibrant cyber-blue daytime sky and a rich, deep-space night canopy populated with a multi-layered star field and bloom-enhanced lunar body.

### 2. Physics-Based Real-Time Particle Simulation
* **Wind-Drift Exhaust Fluidity:** Implements an advanced R3F instance mesh engine that locks smoke plumes perfectly to the vessel's chimney exhaust rim. Particles automatically simulate dynamic scaling, dissolution, and realistic aerodynamic backward drift relative to ship velocity vectors.

### 3. One-Time Cinematic Vessel Arrival
* **State-Guarded Introductions:** Utilizes bulletproof state guards (`useRef` lifecycle protection) to execute a sweeping, smooth cinematic arrival animation when the application first mounts. This sequence is strictly locked to run only once per session, remaining unaffected by subsequent dashboard UI state re-renders (e.g., toggling Night Mode or Heatmaps).

### 4. Interactive Live Telemetry HUD
* **Glassmorphism 2D Interface Layer:** Features an overlay HUD delivering contextual live stream metrics, active vehicle telemetry data logging, a comprehensive container locator search system, and real-time fleet bandwidth tracking.
* **Yard Capacity Heatmap:** Implements a dynamic layout rendering overlay allowing terminal operators to switch on visual density diagnostic matrices instantly.

---

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router Architecture)
* **3D Core Layer:** React Three Fiber (R3F) & Three.js
* **Asset/Camera Controllers:** `@react-three/drei` (OrbitControls, Cloud Canopy, Instanced Stars)
* **Animation Engine:** GSAP (GreenSock Animation Platform)
* **Post-Processing Filters:** `@react-three/postprocessing` (Selective Neon/Lunar Bloom Effects)
* **Styling Framework:** Tailwind CSS & Lucide Icons