document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM ---
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainApp = document.getElementById('mainApp');
    const placesList = document.getElementById('placesList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.floating-btn-below');
    const startBtn = document.getElementById('startBtn');
    const homeBtn = document.getElementById('homeBtn');
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('locationBtn');
    const navTabs = document.querySelectorAll('.nav-tab');
    const lugaresContent = document.getElementById('lugaresContent');
    const ambienteContent = document.getElementById('ambienteContent');
    const envBackBtn = document.getElementById('envBackBtn');
    const mapArea = document.getElementById('mapArea');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const showMapBtn = document.getElementById('showMapBtn');
    const showListBtn = document.getElementById('showListBtn');

    // --- Variables Globales ---
    let map;
    let userMarker;
    let placeMarkers = [];
    let currentCategory = 'reciclaje';
    let userLatLng = null; // Almacenará la ubicación del usuario
    let routingControl = null; // Almacenará el control de la ruta

    // Iconos personalizados para los marcadores del mapa
    const defaultIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    const activeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [35, 57], iconAnchor: [17, 56], popupAnchor: [1, -54], shadowSize: [57, 57]
    });
    
    // --- Base de Datos Local con LUGARES REALES en Tapachula, Chiapas (Actualizada) ---
    const placesData = {
        reciclaje: [
            { id: 1, name: "Recicladora del Soconusco", category: "Centro General", lat: 14.8885, lng: -92.2632, address: "4a Avenida Sur Prolongación, Col. Los Naranjos", materials: "Metales, PET, Cartón, Plástico" },
            { id: 2, name: "Punto Verde SEDURBE", category: "Centro General", lat: 14.9045, lng: -92.2630, address: "Palacio Municipal, Parque Central Miguel Hidalgo", materials: "Pilas, PET, Tapitas" },
            { id: 3, name: "ECO-PLAS Tapachula", category: "Plásticos", lat: 14.8600, lng: -92.2900, address: "Carretera a Puerto Madero Km 5.5", materials: "Plásticos diversos, Polietileno" },
            { id: 5, name: "Centro de Acopio 'El Esfuerzo'", category: "Papel", lat: 14.8950, lng: -92.2550, address: "Callejón del Esfuerzo, Col. 5 de Febrero", materials: "Papel, Cartón, Archivo muerto" },
            { id: 6, name: "First Cash Insurgentes", category: "Compra-Venta de Electrónicos", lat: 14.8945, lng: -92.2615, address: "Av. Insurgentes, Los Naranjos", materials: "Compran celulares, laptops, tablets, etc." },
            { id: 7, name: "Prenda Mex Centro", category: "Compra-Venta de Electrónicos", lat: 14.9058, lng: -92.2655, address: "Avenida Central Pte. 50, Centro", materials: "Compran electrónicos y joyería" },
            { id: 8, name: "Plaza de la Computación y El Celular", category: "Electrónicos", lat: 14.9075, lng: -92.2635, address: "6A Avenida Nte 17, Centro", materials: "Reparación y compra-venta de celulares y equipo" },
        ],
        electronico: [
            { id: 6, name: "First Cash Insurgentes", category: "Compra-Venta de Electrónicos", lat: 14.8945, lng: -92.2615, address: "Av. Insurgentes, Los Naranjos", materials: "Compran celulares, laptops, tablets, etc." },
            { id: 7, name: "Prenda Mex Centro", category: "Compra-Venta de Electrónicos", lat: 14.9058, lng: -92.2655, address: "Avenida Central Pte. 50, Centro", materials: "Compran electrónicos y joyería" },
            { id: 8, name: "Plaza de la Computación y El Celular", category: "Electrónicos", lat: 14.9075, lng: -92.2635, address: "6A Avenida Nte 17, Centro", materials: "Reparación y compra-venta de celulares y equipo" },
        ],
        pilas: [
            { id: 2, name: "Punto Verde SEDURBE", category: "Centro General", lat: 14.9045, lng: -92.2630, address: "Palacio Municipal, Parque Central Miguel Hidalgo", materials: "Pilas, PET, Tapitas" },
        ],
        textiles: [], // No se encontraron centros específicos, se puede añadir después
        papel: [
            { id: 5, name: "Centro de Acopio 'El Esfuerzo'", category: "Papel", lat: 14.8950, lng: -92.2550, address: "Callejón del Esfuerzo, Col. 5 de Febrero", materials: "Papel, Cartón, Archivo muerto" },
            { id: 1, name: "Recicladora del Soconusco", category: "Centro General", lat: 14.8885, lng: -92.2632, address: "4a Avenida Sur Prolongación, Col. Los Naranjos", materials: "Metales, PET, Cartón, Plástico" },
        ],
        plastico: [
            { id: 3, name: "ECO-PLAS Tapachula", category: "Plásticos", lat: 14.8600, lng: -92.2900, address: "Carretera a Puerto Madero Km 5.5", materials: "Plásticos diversos, Polietileno" },
            { id: 1, name: "Recicladora del Soconusco", category: "Centro General", lat: 14.8885, lng: -92.2632, address: "4a Avenida Sur Prolongación, Col. Los Naranjos", materials: "Metales, PET, Cartón, Plástico" },
            { id: 2, name: "Punto Verde SEDURBE", category: "Centro General", lat: 14.9045, lng: -92.2630, address: "Palacio Municipal, Parque Central Miguel Hidalgo", materials: "Pilas, PET, Tapitas" },
        ]
    };

    // --- Funciones de Búsqueda y Filtro ---
    function searchPlaces() {
        showLoading();
        setTimeout(() => {
            const searchTerm = searchInput.value.toLowerCase();
            if (!searchTerm) {
                displayPlaces(placesData[currentCategory] || []);
                hideLoading();
                return;
            }
            const allPlaces = Object.values(placesData).flat();
            const uniquePlaces = [...new Map(allPlaces.map(item => [item.id, item])).values()];
            
            const filteredPlaces = uniquePlaces.filter(place =>
                place.name.toLowerCase().includes(searchTerm) ||
                place.address.toLowerCase().includes(searchTerm) ||
                place.materials.toLowerCase().includes(searchTerm)
            );
            displayPlaces(filteredPlaces);
            hideLoading();
        }, 500);
    }
    
    function filterCategory(category, clickedButton) {
        currentCategory = category;
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
        displayPlaces(placesData[category] || []);
    }

    function displayPlaces(places) {
        placesList.innerHTML = '';
        if (map) {
            placeMarkers.forEach(item => map.removeLayer(item.marker));
            placeMarkers = [];
        }

        if (!places || places.length === 0) {
            placesList.innerHTML = '<p style="text-align:center; padding: 1rem; color: white;">No se encontraron lugares para esta categoría.</p>';
            return;
        }

        places.forEach(place => {
            const card = document.createElement('div');
            card.className = 'place-card';
            const distanceHTML = place.distance ? `<div class="place-distance">📏 A ${place.distance.toFixed(2)} km de ti</div>` : '';
            card.innerHTML = `
                <div class="place-category">${place.category}</div>
                <div class="place-name">${place.name}</div>
                <div class="place-info">📍 ${place.address}</div>
                ${distanceHTML}
                <div class="place-info">🗂️ ${place.materials}</div>
                <small class="route-hint">Haz clic para ver la ruta</small>
            `;
            card.addEventListener('click', () => {
                focusOnPlace(place);
                getDirections(place.lat, place.lng);
                if (window.innerWidth <= 768) {
                    toggleMobileView('map');
                }
            });
            placesList.appendChild(card);
            
            if (map) {
                const marker = L.marker([place.lat, place.lng], { icon: defaultIcon }).addTo(map);
                marker.bindPopup(`<b>${place.name}</b><br>${place.address}`);
                marker.on('click', () => {
                    focusOnPlace(place);
                    getDirections(place.lat, place.lng);
                    if (window.innerWidth <= 768) {
                        toggleMobileView('map');
                    }
                });
                placeMarkers.push({ placeId: place.id, marker: marker });
            }
        });
    }

    function focusOnPlace(place) {
        if (!map) return;
        map.setView([place.lat, place.lng], 17);
        placeMarkers.forEach(item => item.marker.setIcon(defaultIcon));
        const itemToActivate = placeMarkers.find(item => item.placeId === place.id);
        if (itemToActivate) {
            itemToActivate.marker.setIcon(activeIcon);
            itemToActivate.marker.openPopup();
        }
    }

    function initMap() {
        if (map) return;

        const darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, minZoom: 2, attribution: '© CARTO' });
        const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 2, attribution: '© OpenStreetMap' });
        
        map = L.map('mapArea', {
            center: [14.90, -92.26],
            zoom: 13,
            layers: [darkMap],
            zoomControl: true
        });

        L.control.layers({ "Oscuro": darkMap, "Calles": streetMap }).addTo(map);
        
        map.whenReady(() => {
            filterCategory('reciclaje', document.querySelector('.floating-btn-below.active'));
        });
    }

    function getCurrentLocation() {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta la geolocalización.");
            return;
        }
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userLatLng = L.latLng(latitude, longitude);

                map.setView([latitude, longitude], 14);
                
                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker([latitude, longitude], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    })
                }).addTo(map).bindPopup("<b>¡Estás aquí!</b>").openPopup();
                
                const allPlaces = Object.values(placesData).flat();
                const uniquePlaces = [...new Map(allPlaces.map(item => [item['id'], item])).values()];
                
                const placesWithDist = uniquePlaces.map(place => ({
                    ...place,
                    distance: getDistance({ lat: latitude, lng: longitude }, { lat: place.lat, lng: place.lng })
                })).sort((a, b) => a.distance - b.distance);
                
                displayPlaces(placesWithDist);
                hideLoading();
            },
            () => {
                alert("No se pudo obtener tu ubicación. Asegúrate de conceder los permisos.");
                hideLoading();
            }
        );
    }
    
    function getDistance(from, to) {
        const R = 6371;
        const dLat = (to.lat - from.lat) * Math.PI / 180;
        const dLon = (to.lng - from.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    function getDirections(destLat, destLng) {
        if (!userLatLng) {
            alert("Por favor, haz clic en 'Mi Ubicación' primero para obtener tu posición.");
            locationBtn.click();
            return;
        }

        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }

        routingControl = L.Routing.control({
            waypoints: [
                userLatLng,
                L.latLng(destLat, destLng)
            ],
            routeWhileDragging: true,
            router: L.Routing.osrmv1({
                serviceUrl: `https://router.project-osrm.org/route/v1`
            }),
            createMarker: () => null,
            lineOptions: {
                styles: [{color: '#00d4ff', opacity: 0.8, weight: 6}]
            }
        }).addTo(map);
    }
    
    function showLoading() { loadingIndicator.style.display = 'block'; }
    function hideLoading() { loadingIndicator.style.display = 'none'; }

    function startApp() {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            welcomeScreen.style.display = 'none';
        }, 500);
        mainApp.classList.remove('hidden');
        showTab('lugares');
        initMap();
    }

    function goHome() {
        mainApp.classList.add('hidden');
        welcomeScreen.style.display = 'flex';
        welcomeScreen.classList.remove('hidden');
        setTimeout(() => welcomeScreen.style.opacity = '1', 10);
    }

    function showTab(tabName) {
        const isLugaresVisible = (tabName === 'lugares');
        lugaresContent.classList.toggle('hidden', !isLugaresVisible);
        ambienteContent.classList.toggle('hidden', isLugaresVisible);
        navTabs.forEach(tab => {
            const currentTabName = tab.id.replace('tab-', '');
            tab.classList.toggle('active', currentTabName === tabName);
        });
        if (isLugaresVisible && map) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    }
    
    function toggleFullscreen() {
        mapArea.classList.toggle('fullscreen');
        fullscreenBtn.textContent = mapArea.classList.contains('fullscreen') ? '×' : '⤢';
        if (map) {
            setTimeout(() => map.invalidateSize(), 500);
        }
    }

    function toggleMobileView(view) {
        const container = document.getElementById('lugaresContent');
        if (view === 'map') {
            container.classList.remove('list-view-active');
            container.classList.add('map-view-active');
        } else {
            container.classList.remove('map-view-active');
            container.classList.add('list-view-active');
        }
        if (map) {
            setTimeout(() => map.invalidateSize(), 300);
        }
    }
    
    function setupEventListeners() {
        startBtn.addEventListener('click', startApp);
        homeBtn.addEventListener('click', goHome);
        searchBtn.addEventListener('click', searchPlaces);
        locationBtn.addEventListener('click', getCurrentLocation);
        envBackBtn.addEventListener('click', () => showTab('lugares'));
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        showMapBtn.addEventListener('click', () => toggleMobileView('map'));
        showListBtn.addEventListener('click', () => toggleMobileView('list'));
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchPlaces();
        });

        categoryButtons.forEach(btn => {
            const category = btn.getAttribute('data-category');
            btn.addEventListener('click', () => filterCategory(category, btn));
        });

        navTabs.forEach(tab => {
            const tabName = tab.id.replace('tab-', '');
            tab.addEventListener('click', () => showTab(tabName));
        });
    }

    setupEventListeners();
});

