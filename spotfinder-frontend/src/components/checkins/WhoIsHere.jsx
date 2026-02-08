import { useState, useEffect } from 'react';
import { checkInService } from '../../services/checkInService';
import { FaUser } from 'react-icons/fa';
import { format } from 'date-fns';

const WhoIsHere = ({ locationId }) => {
    const [checkIns, setCheckIns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCheckIns();
    }, [locationId]);

    const fetchCheckIns = async () => {
        try {
            const data = await checkInService.getLocationCheckIns(locationId);
            setCheckIns(data);
        } catch (error) {
            console.error('Failed to load check-ins');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    if (checkIns.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Who's Here?</h3>
                <p className="text-gray-500 text-sm">No one is checked in right now</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
                Who's Here? <span className="text-green-600">({checkIns.length})</span>
            </h3>
            <div className="space-y-2">
                {checkIns.map(checkIn => (
                    <div key={checkIn.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600 text-sm" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{checkIn.user?.username}</p>
                            <p className="text-xs text-gray-500">
                                {format(new Date(checkIn.check_in_time), 'h:mm a')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhoIsHere;
