import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useMasterData } from '../context/MasterDataContext';

// Fix for default marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function TestingCenterMapSection() {
    const { testingCenters: centers, loading: isLoading, error } = useMasterData();

    // Only render "Our Locations" when this company has active testing centers
    // configured. While loading / on error / when empty, render nothing so the
    // section never appears as an empty placeholder.
    if (isLoading || error || !centers || centers.length === 0) {
        return null;
    }

    // Default center (Melbourne)
    const defaultCenter: [number, number] = [-37.8136, 144.9631];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="dm-eyebrow">📍 Locations</span>
                    <h2 className="dm-heading mt-4">Our Locations</h2>
                    <p className="mt-3 text-muted">Find a testing center near you.</p>
                </div>

                <div className="relative z-0 h-[500px] w-full overflow-hidden rounded-2xl border border-line shadow-card">
                    {isLoading ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            Loading map...
                        </div>
                    ) : error ? (
                        <div className="h-full w-full flex items-center justify-center bg-red-50 text-red-500">
                            Failed to load map data
                        </div>
                    ) : (
                        <MapContainer
                            center={defaultCenter}
                            zoom={10}
                            scrollWheelZoom={false}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution=''
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {centers?.map((center) => (
                                center.latitude && center.longitude ? (
                                    <Marker
                                        key={center.id}
                                        position={[+center.latitude, +center.longitude]}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold text-lg">{center.name} ({center.postalcode})</h3>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ) : null
                            ))}
                        </MapContainer>
                    )}
                </div>
            </div>
        </section>
    );
}
