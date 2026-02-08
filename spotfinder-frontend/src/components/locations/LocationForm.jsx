import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../../services/locationService';
import { AMENITIES, CATEGORIES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

const LocationForm = ({ location, onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState(location?.amenities || []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: location || {},
    });

    const toggleAmenity = (amenityId) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(a => a !== amenityId)
                : [...prev, amenityId]
        );
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const locationData = {
                ...data,
                amenities: selectedAmenities,
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
            };

            if (location?.id) {
                await locationService.updateLocation(location.id, locationData);
                toast.success('Location updated successfully!');
            } else {
                const newLocation = await locationService.createLocation(locationData);
                toast.success('Location created successfully!');
                if (onSuccess) {
                    onSuccess(newLocation);
                } else {
                    navigate(`/location/${newLocation.id}`);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to save location';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                </label>
                <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Starbucks Downtown"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                </label>
                <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about this location..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                    </label>
                    <input
                        type="text"
                        {...register('address', { required: 'Address is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Main St"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                    </label>
                    <input
                        type="text"
                        {...register('city', { required: 'City is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Dallas"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude *
                    </label>
                    <input
                        type="number"
                        step="any"
                        {...register('latitude', { required: 'Latitude is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="32.7767"
                    />
                    {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude *
                    </label>
                    <input
                        type="number"
                        step="any"
                        {...register('longitude', { required: 'Longitude is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="-96.7970"
                    />
                    {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AMENITIES.map(amenity => (
                        <label
                            key={amenity.id}
                            className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity.id)}
                                onChange={() => toggleAmenity(amenity.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm">
                                {amenity.icon} {amenity.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? <LoadingSpinner size="sm" color="white" /> : (location ? 'Update Location' : 'Create Location')}
                </button>
            </div>
        </form>
    );
};

export default LocationForm;
