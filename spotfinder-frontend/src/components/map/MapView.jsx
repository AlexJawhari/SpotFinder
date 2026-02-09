import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

import { DEFAULT_MAP_CENTER, MAP_ZOOM } from '../../utils/constants';

// Explicit divIcon for markers – avoids L.Icon.Default / createIcon issues with react-leaflet-cluster
const MARKER_ICON_URL = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const defaultPinIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<img src="${MARKER_ICON_URL}" alt="" style="width:25px;height:41px;margin-left:-12px;margin-top:-41px;" />`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

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

    // Filter out locations without valid coordinates and ensure they're in US bounds
    const US_BBOX = {
        south: 24.396308,
        north: 49.384358,
        west: -125.0,
        east: -66.93457
    };

    const validLocations = locations.filter(loc => {
        if (!loc.latitude || !loc.longitude) return false;

        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);

        if (isNaN(lat) || isNaN(lng)) return false;

        // Only show US locations
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
                    icon={location.id === selectedLocationId ? selectedPinIcon : defaultPinIcon}
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
