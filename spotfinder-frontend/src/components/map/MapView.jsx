import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

import { DEFAULT_MAP_CENTER, MAP_ZOOM } from '../../utils/constants';

// Helper to get icon based on category
const getCategoryIcon = (category) => {
    return L.icon({
        iconUrl: '/assets/icons/aero_map_marker.png',
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -42],
        className: 'aero-marker-pulse'
    });
};

// Component to update map view when center changes
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && map && map.getContainer()) {
            try {
                // Check if map is fully initialized
                if (map._loaded) {
                    const current = map.getCenter();
                    const currentZoom = map.getZoom();
                    const targetZoom = typeof zoom === 'number' ? zoom : currentZoom;

                    // Only move the map if the target is meaningfully different.
                    const distMeters = current.distanceTo(L.latLng(center[0], center[1]));
                    const zoomChanged = typeof zoom === 'number' && targetZoom !== currentZoom;
                    if (distMeters > 10 || zoomChanged) {
                        map.flyTo(center, targetZoom, { animate: true, duration: 0.6 });
                    }
                } else {
                    // Wait for map to be ready
                    map.whenReady(() => {
                        const currentZoom = map.getZoom();
                        map.flyTo(center, typeof zoom === 'number' ? zoom : currentZoom, { animate: true, duration: 0.6 });
                    });
                }
            } catch (error) {
                console.error('Error updating map view:', error);
            }
        }
    }, [center, zoom, map]);
    return null;
}

function ViewportEvents({ onViewportChanged }) {
    const map = useMapEvents({
        moveend: () => {
            if (!onViewportChanged) return;
            const c = map.getCenter();
            const b = map.getBounds();
            onViewportChanged({
                center: { lat: c.lat, lng: c.lng },
                zoom: map.getZoom(),
                bounds: {
                    north: b.getNorth(),
                    south: b.getSouth(),
                    east: b.getEast(),
                    west: b.getWest(),
                },
            });
        },
        zoomend: () => {
            if (!onViewportChanged) return;
            const c = map.getCenter();
            const b = map.getBounds();
            onViewportChanged({
                center: { lat: c.lat, lng: c.lng },
                zoom: map.getZoom(),
                bounds: {
                    north: b.getNorth(),
                    south: b.getSouth(),
                    east: b.getEast(),
                    west: b.getWest(),
                },
            });
        },
    });

    return null;
}

const selectedPinIcon = L.icon({
    iconUrl: '/assets/icon_locations_selected.png', // I'll generate this or use a variant
    iconSize: [52, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -52],
    className: 'aero-marker-pulse shadow-glow'
});

// Since I don't have that specific file yet, I'll use a glossy div for now but better than before
const selectedPinIconAero = L.divIcon({
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    html: `
      <div class="aero-marker-pulse" style="
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #FFFFFF, #38BDF8 60%, #0EA5E9 100%);
        border: 3px solid white;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.6), inset 0 0 10px rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 12px; height: 12px; background: white; border-radius: 50%; box-shadow: 0 0 10px white;"></div>
      </div>
    `,
});

const MapView = ({ locations = [], onMarkerClick, center, zoom, selectedLocationId, onViewportChanged }) => {
    const mapCenter = center || DEFAULT_MAP_CENTER;
    const mapZoom = zoom ?? MAP_ZOOM;

    // Keep this reference stable so we don't “snap back” on rerenders.
    const targetCenter = useMemo(() => {
        const c = center || mapCenter;
        return [c.lat, c.lng];
    }, [center?.lat, center?.lng, mapCenter.lat, mapCenter.lng]);

    // Filter out locations without valid coordinates and ensure they're in US bounds (extended to include broader US)
    const US_BBOX = {
        south: 24.0,
        north: 50.0,
        west: -125.0,
        east: -65.0
    };

    const validLocations = locations.filter(loc => {
        if (!loc.latitude || !loc.longitude) return false;

        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);

        if (isNaN(lat) || isNaN(lng)) return false;

        // Relaxed US check or global check if needed, but keeping US focus for now
        return lat >= US_BBOX.south && lat <= US_BBOX.north &&
            lng >= US_BBOX.west && lng <= US_BBOX.east;
    });

    return (
        <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={mapZoom}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                minZoom={3}
            />

            {/* Only force zoom when a zoom prop is explicitly passed */}
            <ChangeView center={targetCenter} zoom={zoom} />
            <ViewportEvents onViewportChanged={onViewportChanged} />

            {/* MarkerClusterGroup removed due to incompatibility with react-leaflet v5 causing crashes */}
            {validLocations.map((location) => (
                <Marker
                    key={location.id}
                    position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
                    icon={location.id === selectedLocationId ? selectedPinIconAero : getCategoryIcon(location.category)}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(location),
                    }}
                >
                    <Popup className="custom-popup">
                        <Link to={`/location/${location.id}`} className="block w-64 overflow-hidden rounded-xl bg-white shadow-xl border border-slate-100 hover:no-underline transition-transform hover:scale-[1.01]">
                            {location.images && location.images.length > 0 ? (
                                <img
                                    src={location.images[0]}
                                    alt={location.name}
                                    className="w-full h-32 object-cover"
                                />
                            ) : (
                                <div className="w-full h-32 bg-gradient-to-br from-[#4FC3F7] to-[#66BB6A] flex items-center justify-center">
                                    <span className="text-4xl shadow-lg">📍</span>
                                </div>
                            )}
                            <div className="p-4 bg-white/50 backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{location.name}</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded shadow-sm">
                                        {location.category}
                                    </span>
                                </div>

                                {location.address && (
                                    <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                                        📍 {location.address}
                                    </p>
                                )}

                                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                                    {location.description || 'No description available'}
                                </p>

                                <div className="flex items-center justify-between mt-4">
                                    {location.average_rating > 0 && (
                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
                                            <span>★</span> {location.average_rating.toFixed(1)}
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-[#4FC3F7] group-hover:text-[#26C6DA] flex items-center gap-1 transition-colors">
                                        Full Details →
                                    </span>
                                </div>

                                {location.is_external && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 italic">
                                        🌐 Found via OpenStreetMap
                                    </div>
                                )}
                            </div>
                        </Link>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapView;
