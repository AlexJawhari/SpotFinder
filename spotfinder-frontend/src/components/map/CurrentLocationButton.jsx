import { FaLocationArrow } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useLocationStore } from '../../store/locationStore';

const CurrentLocationButton = ({ onLocationFound }) => {
    const { setUserLocation } = useLocationStore();

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(coords);
                if (onLocationFound) {
                    onLocationFound(coords);
                }
                toast.success('Location found!');
            },
            (error) => {
                toast.error('Unable to get your location');
                console.error('Geolocation error:', error);
            }
        );
    };

    return (
        <button
            onClick={handleGetLocation}
            className="absolute bottom-6 right-6 bg-gradient-to-br from-[#4FC3F7] to-[#66BB6A] p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-10 border-2 border-white/60 backdrop-blur-sm hover:scale-110 hover:rotate-12 relative overflow-hidden group"
            title="Use my current location"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        >
            {/* Glossy highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full"></div>
            <FaLocationArrow className="text-white text-xl drop-shadow-lg relative z-10" />
        </button>
    );
};

export default CurrentLocationButton;
