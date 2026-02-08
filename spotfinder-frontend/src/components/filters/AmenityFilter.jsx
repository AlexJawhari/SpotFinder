import { AMENITIES } from '../../utils/constants';
import { useFilterStore } from '../../store/filterStore';

const AmenityFilter = () => {
    const { amenities, toggleAmenity } = useFilterStore();

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h3>
            <div className="space-y-2">
                {AMENITIES.map(amenity => (
                    <label
                        key={amenity.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                    >
                        <input
                            type="checkbox"
                            checked={amenities.includes(amenity.id)}
                            onChange={() => toggleAmenity(amenity.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            {amenity.icon} {amenity.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default AmenityFilter;
