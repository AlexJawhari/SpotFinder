import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { reviewService } from '../../services/reviewService';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';

const ReviewForm = ({ locationId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [overallRating, setOverallRating] = useState(0);
    const [wifiRating, setWifiRating] = useState(0);
    const [seatingRating, setSeatingRating] = useState(0);
    const [noiseRating, setNoiseRating] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const onSubmit = async (data) => {
        if (overallRating === 0) {
            toast.error('Please select an overall rating');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = null;
            if (selectedFile) {
                const uploadRes = await reviewService.uploadImage(selectedFile);
                imageUrl = uploadRes.imageUrl;
            }

            const reviewData = {
                location_id: locationId,
                overall_rating: overallRating,
                wifi_rating: wifiRating || null,
                seating_rating: seatingRating || null,
                noise_rating: noiseRating || null,
                review_text: data.review_text,
                visit_date: data.visit_date,
                image_url: imageUrl
            };

            await reviewService.createReview(reviewData);
            toast.success('Review submitted successfully!');

            // Reset form
            reset();
            setOverallRating(0);
            setWifiRating(0);
            setSeatingRating(0);
            setNoiseRating(0);
            setSelectedFile(null);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to submit review';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating *
                </label>
                <StarRating
                    rating={overallRating}
                    interactive
                    onChange={setOverallRating}
                    size="lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        WiFi Quality
                    </label>
                    <StarRating
                        rating={wifiRating}
                        interactive
                        onChange={setWifiRating}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seating Comfort
                    </label>
                    <StarRating
                        rating={seatingRating}
                        interactive
                        onChange={setSeatingRating}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Noise Level (5=quiet)
                    </label>
                    <StarRating
                        rating={noiseRating}
                        interactive
                        onChange={setNoiseRating}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                </label>
                <textarea
                    {...register('review_text')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your experience..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Photo (Optional)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                    <p className="mt-1 text-xs text-gray-500">Selected: {selectedFile.name}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Date
                </label>
                <input
                    type="date"
                    {...register('visit_date')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
                {loading ? <LoadingSpinner size="sm" color="white" /> : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
