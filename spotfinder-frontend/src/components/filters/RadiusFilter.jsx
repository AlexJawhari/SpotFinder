import { RADIUS_OPTIONS } from '../../utils/constants';
import { useFilterStore } from '../../store/filterStore';

const RadiusFilter = () => {
    const { radius, setRadius } = useFilterStore();

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Distance Radius: {radius} miles
            </h3>
            <input
                type="range"
                min={RADIUS_OPTIONS[0]}
                max={RADIUS_OPTIONS[RADIUS_OPTIONS.length - 1]}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                {RADIUS_OPTIONS.map(r => (
                    <span key={r}>{r}mi</span>
                ))}
            </div>
        </div>
    );
};

export default RadiusFilter;
