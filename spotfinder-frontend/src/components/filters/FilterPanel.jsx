import { FaFilter, FaTimes } from 'react-icons/fa';
import { useFilterStore } from '../../store/filterStore';
import { CATEGORIES, SORT_OPTIONS } from '../../utils/constants';
import AmenityFilter from './AmenityFilter';
import RadiusFilter from './RadiusFilter';

const FilterPanel = ({ hideSearch = false }) => {
    const { category, setCategory, minRating, setMinRating, sortBy, setSortBy, searchQuery, setSearchQuery, resetFilters } = useFilterStore();

    return (
        <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-xl p-5 space-y-6 border-2 border-white/60 relative overflow-hidden">
            {/* Organic decorative blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#7DD3FC]/20 to-[#86EFAC]/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-[#F9A8D4]/20 to-[#FCD34D]/20 rounded-full blur-xl"></div>
            
            <div className="flex justify-between items-center relative z-10">
                <h2 className="text-lg font-bold bg-gradient-to-r from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] bg-clip-text text-transparent flex items-center gap-2 drop-shadow-sm">
                    <div className="p-1.5 rounded-xl bg-gradient-to-br from-[#4FC3F7]/25 to-[#66BB6A]/25 border border-white/40 shadow-sm">
                        <FaFilter className="text-[#4FC3F7]" />
                    </div>
                    Filters
                </h2>
                <button
                    onClick={resetFilters}
                    className="text-sm text-[#4FC3F7] hover:text-[#66BB6A] flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gradient-to-r hover:from-[#4FC3F7]/10 hover:to-[#66BB6A]/10 transition-all border border-[#4FC3F7]/25 hover:border-[#66BB6A]/35"
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                >
                    <FaTimes /> Reset
                </button>
            </div>

            {/* Search (optional) */}
            {!hideSearch && (
                <div className="relative z-10">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        🔍 Search Locations
                    </label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try 'cafe', 'library', 'park'..."
                        className="w-full px-4 py-3 border-2 border-[#B2DFDB] rounded-2xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all bg-white/80 backdrop-blur-sm placeholder:text-slate-400 shadow-inner"
                    />
                </div>
            )}

            {/* Sort By */}
            <div className="relative z-10">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    📊 Sort By
                </label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-2xl focus:ring-2 focus:ring-[#7DD3FC] focus:border-[#7DD3FC] transition-all bg-white/70 backdrop-blur-sm shadow-inner"
                >
                    {SORT_OPTIONS.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Radius */}
            <div className="relative z-10">
                <RadiusFilter />
            </div>

            {/* Category */}
            <div className="relative z-10">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    🏷️ Category
                </label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-2xl focus:ring-2 focus:ring-[#7DD3FC] focus:border-[#7DD3FC] transition-all bg-white/70 backdrop-blur-sm shadow-inner"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Min Rating */}
            <div className="relative z-10">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ⭐ Minimum Rating
                </label>
                <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-2xl focus:ring-2 focus:ring-[#7DD3FC] focus:border-[#7DD3FC] transition-all bg-white/70 backdrop-blur-sm shadow-inner"
                >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars Only</option>
                </select>
            </div>

            {/* Amenities */}
            <AmenityFilter />
        </div>
    );
};

export default FilterPanel;
