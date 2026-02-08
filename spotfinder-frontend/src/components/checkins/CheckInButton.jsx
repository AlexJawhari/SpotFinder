import { useState } from 'react';
import { toast } from 'react-toastify';
import { checkInService } from '../../services/checkInService';
import { useAuthStore } from '../../store/authStore';
import { FaMapMarkerAlt } from 'react-icons/fa';

const CheckInButton = ({ locationId, onCheckIn }) => {
    const { isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to check in');
            return;
        }

        setLoading(true);
        try {
            await checkInService.checkIn(locationId);
            toast.success('Checked in!');
            if (onCheckIn) onCheckIn();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to check in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
            <FaMapMarkerAlt />
            {loading ? 'Checking in...' : "I'm Here"}
        </button>
    );
};

export default CheckInButton;
