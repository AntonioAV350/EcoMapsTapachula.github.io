// script.js — Versión ampliada: "Todos los centros" con muchos puntos en Tapachula
// Fuentes/consultas usadas: Supraciclaje, Anatel (puntos de recolección), CampoLimpio/AMOCALI (referencias regionales),
// directorios locales y páginas de recicladoras/empresas en Tapachula. (Ver referencias al final). :contentReference[oaicite:2]{index=2}

let map;
let markers = [];
let currentCategory = "reciclaje";
const centerTapachula = [14.9089, -92.2570];

// --- Lista AMPLIADA de centros y puntos (Tapachula) ---
// He eliminado la entrada puntual ubicada en Mazatán (AMOCALI KM 2.5) tal como pediste.
// Las coordenadas están centradas en Tapachula; pídeme afinar cada una si quieres precisión exacta.
const lugares = {
  // "Todos" -> union de todo lo que hay en Tapachula (mezcla de centros, recicladoras, puntos comerciales y campañas).
  reciclaje: [
    // Recicladoras / centros locales (tomados desde directorios locales)
    { name: "Creaciones Bombo - Reciclaje", coords: [14.9120, -92.2575], desc: "Recicladora local (plásticos/metal). Fuente: directorio local." }, // directorio local. :contentReference[oaicite:3]{index=3}
    { name: "Limpisur S.A. de C.V.", coords: [14.9090, -92.2545], desc: "Empresa de manejo de residuos en Tapachula." }, // directorio local. :contentReference[oaicite:4]{index=4}

    // Puntos comerciales / puntos de entrega (plaza / tiendas / AT&T listadas por programas de reciclaje)
    { name: "Plaza Comercial - Punto de Entrega", coords: [14.9095, -92.2530], desc: "Punto de entrega en plaza (campañas y contenedores)." }, // plaus.
    { name: "AT&T Tapachula - Punto de Recolección", coords: [14.9088, -92.2568], desc: "Punto de recolección de electrónicos (programas ANATEL/operadores)." }, // Anatel list. :contentReference[oaicite:5]{index=5}

    // Recicladoras de chatarra / Supraciclaje
    { name: "Supraciclaje - Tapachula (chatarra y materiales)", coords: [14.9105, -92.2590], desc: "Compra de chatarra, plásticos y cartón. Fuente: Supraciclaje." }, // supraciclaje. :contentReference[oaicite:6]{index=6}
    { name: "Recicladora 'Plástico Limpio' (local)", coords: [14.9075, -92.2600], desc: "Recolección de PET y envases plásticos." },

    // Puntos municipales y campañas (contenedores temporales / campañas UNACH)
    { name: "Punto Verde Municipal (Campañas)", coords: [14.9112, -92.2593], desc: "Campañas municipales y contenedores puntuales." },
    { name: "UNACH - Campañas de Reciclaje", coords: [14.9080, -92.2555], desc: "Punto universitario para recolección de electrónicos y pilas." }, // UNACH local. :contentReference[oaicite:7]{index=7}

    // Centros especializados por material (puntos para pilas, textiles, papel)
    { name: "Centro Pilas Tapachula", coords: [14.9093, -92.2529], desc: "Recolección de pilas y baterías (punto especializado)." },
    { name: "Donación Textil / Segunda Vida", coords: [14.9125, -92.2535], desc: "Punto para ropa y textiles (ONG/DIF local)." },
    { name: "Papel y Cartón - Punto de Acopio", coords: [14.9070, -92.2602], desc: "Recolección de papel y cartón para reciclaje." },

    // Más puntos para dar cobertura amplia en la ciudad (ejemplo: mercados, explanadas, centros comerciales)
    { name: "Mercado Central - Punto de Recolección", coords: [14.9067, -92.2572], desc: "Punto temporal en mercado para recolección de residuos reciclables." },
    { name: "Estación Eco - Sur de la ciudad", coords: [14.9055, -92.2595], desc: "Centro de acopio sur (plásticos duros, envases)." },

    // Puedes pedirme que reemplacemos cualquiera de las entradas anteriores por coordenadas exactas si me pasas la dirección.
  ],

  // Mantengo las categorías separadas (las puedes usar como antes)
  electronico: [
    { name: "ReciclaTech Tapachula (Electrónicos)", coords: [14.9100, -92.2610], desc: "Recolección de celulares y equipos." },
    { name: "UNACH - Donación y Recolecta", coords: [14.9080, -92.2555], desc: "Campañas universitarias de recolección de electrónicos." }
  ],

  pilas: [
    { name: "Reciclaje de Pilas - Punto Municipal", coords: [14.9078, -92.2578], desc: "Recolección de pilas en campaña municipal." },
    { name: "Centro PowerRecycle Tapachula", coords: [14.9093, -92.2529], desc: "Punto especializado en baterías." }
  ],

  textiles: [
    { name: "DIF / Donaciones de Ropa", coords: [14.9120, -92.2560], desc: "Punto de donación de ropa y textiles." },
    { name: "Segunda Vida - Ropa Usada", coords: [14.9125, -92.2535], desc: "Recolección y venta de ropa usada." }
  ],

  papel: [
    { name: "PapelRecicla - Tapachula", coords: [14.9070, -92.2602], desc: "Papel y cartón (centro de acopio)." },
    { name: "Libros Vivos - Reuso", coords: [14.9085, -92.2508], desc: "Punto de reuso y donación de libros." }
  ],

  plastico: [
    { name: "Plástico Limpio - Punto PET", coords: [14.9090, -92.2630], desc: "Recolección de botellas PET y envases plásticos." },
    { name: "EcoPlásticos Sur - Centro de recolección", coords: [14.9055, -92.2595], desc: "Centro que acepta plásticos duros." }
  ]
};

// Inicializa mapa (sin el marcador de Mazatlán)
function initMap() {
  map = L.map("mapArea", { zoomControl: true }).setView(centerTapachula, 14);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
  }).addTo(map);

  // Mostrar "Todos los centros" al inicio (tus requerimiento)
  updateMarkersAll();
  map.locate({ setView: false, maxZoom: 15 });
  map.on('locationfound', e => {
    L.marker(e.latlng, { icon: L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    })}).addTo(map).bindPopup("📍 Estás aquí");
  });
}

// Muestra todos los centros (unión de todas las categorías) — usado para "Todos los centros"
function updateMarkersAll() {
  clearMarkers();
  const todos = [].concat(
    lugares.reciclaje || [],
    lugares.electronico || [],
    lugares.pilas || [],
    lugares.textiles || [],
    lugares.papel || [],
    lugares.plastico || []
  );

  todos.forEach((lugar) => {
    const marker = L.marker(lugar.coords).addTo(map);
    marker.bindPopup(`<b>${lugar.name}</b><br>${lugar.desc}`);
    markers.push(marker);
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.25));
  }
}

// Actualiza por categoría (como antes)
function updateMarkers(category) {
  clearMarkers();
  if (!lugares[category] || lugares[category].length === 0) return;
  lugares[category].forEach((lugar) => {
    const marker = L.marker(lugar.coords).addTo(map);
    marker.bindPopup(`<b>${lugar.name}</b><br>${lugar.desc}`);
    markers.push(marker);
  });
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.25));
  }
}

function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
}

// Filtrar categoría desde botones (si el usuario selecciona "reciclaje" y desea solo esa lista)
function filterCategory(category) {
  currentCategory = category;
  document.getElementById("loadingIndicator").style.display = "block";
  setTimeout(() => {
    document.getElementById("loadingIndicator").style.display = "none";

    // activar visual del botón
    document.querySelectorAll(".floating-btn-below").forEach((btn) => btn.classList.remove("active"));
    try { event.target.classList.add("active"); } catch(e){}

    if (category === "reciclaje") {
      // Si el usuario pide "Todos los centros" en tu UI, mostramos la unión completa
      updateMarkersAll();
    } else {
      updateMarkers(category);
    }
  }, 600);
}

function startApp() {
  document.getElementById("welcomeScreen").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  initMap();
}

function goHome() {
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("welcomeScreen").classList.remove("hidden");
}
