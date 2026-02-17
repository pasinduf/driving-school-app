import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { fetchTestingCenters } from '../api/client';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function TestingCenterMapSection() {
    const { data: centers = [], isLoading, error } = useQuery({
        queryKey: ['testingCenters'],
        queryFn: fetchTestingCenters,
    });

    // Default center (Melbourne)
    const defaultCenter: [number, number] = [-37.8136, 144.9631];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
                        Our Locations
                    </h2>
                    <p className="text-gray-500 italic mb-4 text-lg">Find a testing center near you</p>
                    <div className="flex justify-center items-center">
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                        <span className="text-3xl mx-2">📍</span>
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                    </div>
                </div>

                <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 z-0 relative">
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
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {centers.map((center) => (
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
