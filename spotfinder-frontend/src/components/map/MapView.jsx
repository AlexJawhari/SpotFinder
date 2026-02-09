import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

import { DEFAULT_MAP_CENTER, MAP_ZOOM } from '../../utils/constants';

// Helper to get icon based on category
const getCategoryIcon = (category) => {
    let emoji = '📍';
    let color = '#3b82f6'; // blue-500

    switch (category?.toLowerCase()) {
        case 'library':
        case 'education':
            emoji = '📚';
            color = '#8b5cf6'; // violet-500
            break;
        case 'park':
        case 'leisure':
            emoji = '🌳';
            color = '#22c55e'; // green-500
            break;
        case 'cafe':
        case 'coffee':
            emoji = '☕';
            color = '#f59e0b'; // amber-500
            break;
        case 'restaurant':
        case 'food':
            emoji = '🍽️';
            color = '#ef4444'; // red-500
            break;
        case 'bar':
        case 'pub':
        case 'nightlife':
            emoji = '🍺';
            color = '#a855f7'; // purple-500
            break;
        case 'gym':
        case 'fitness':
            emoji = '🏋️';
            color = '#ec4899'; // pink-500
            break;
        case 'coworking':
        case 'office':
            emoji = '🏢';
            color = '#64748b'; // slate-500
            break;
        default:
            emoji = '📍';
            color = '#3b82f6';
    }

    return L.divIcon({
        className: 'custom-marker-icon',
        html: `
            <div style="
                background-color: white;
                border: 2px solid ${color};
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">
                ${emoji}
            </div>
            <div style="
                width: 0; 
                height: 0; 
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid ${color};
                margin: -2px auto 0;
            "></div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
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

const selectedPinIcon = L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(79,195,247,0.85) 45%, rgba(102,187,106,0.85) 100%);
        border: 2px solid rgba(255,255,255,0.9);
        box-shadow: 0 8px 18px rgba(0,0,0,0.22), 0 0 0 6px rgba(79,195,247,0.18);
      "></div>
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
                    icon={location.id === selectedLocationId ? selectedPinIcon : getCategoryIcon(location.category)}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(location),
                    }}
                >
                    <Popup>
                        <div className="text-center min-w-[150px]">
                            <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                            <p className="text-xs text-gray-600 capitalize">{location.category || 'Location'}</p>
                            {location.is_external && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                    External
                                </span>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapView;
