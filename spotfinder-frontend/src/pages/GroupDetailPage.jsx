import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { groupService } from '../services/groupService';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaUsers, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const GroupDetailPage = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuthStore();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        fetchGroup();
    }, [id]);

    const fetchGroup = async () => {
        try {
            const data = await groupService.getGroup(id);
            setGroup(data);

            if (isAuthenticated && data.members) {
                const memberStatus = data.members.some(m => m.user_id === user?.id);
                setIsMember(memberStatus);
            }
        } catch (error) {
            toast.error('Failed to load group');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to join');
            return;
        }

        try {
            await groupService.joinGroup(id);
            toast.success('Joined group!');
            fetchGroup();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to join group');
        }
    };

    const handleLeave = async () => {
        try {
            await groupService.leaveGroup(id);
            toast.success('Left group');
            fetchGroup();
        } catch (error) {
            toast.error('Failed to leave group');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!group) {
        return <div className="text-center py-12">Group not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{group.name}</h1>

                <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
                    <div className="flex items-center gap-2">
                        <FaUsers />
                        <span>{group.member_count} members</span>
                    </div>

                    {group.location && (
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt />
                            <Link to={`/location/${group.location.id}`} className="hover:text-blue-600">
                                {group.location.name}
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
                        {group.group_type}
                    </span>
                    {group.is_private && (
                        <span className="ml-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm">
                            Private
                        </span>
                    )}
                </div>

                {group.description && (
                    <p className="text-gray-700 mb-6 whitespace-pre-wrap">{group.description}</p>
                )}

                {isAuthenticated && (
                    <div className="flex gap-4">
                        {isMember ? (
                            <>
                                <span className="px-6 py-2 bg-green-100 text-green-700 rounded-lg">
                                    You're a member
                                </span>
                                <button
                                    onClick={handleLeave}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Leave Group
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleJoin}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Join Group
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Members */}
            {group.members && group.members.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Members ({group.members.length})</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {group.members.map(member => (
                            <div key={member.id} className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <FaUser className="text-blue-600" />
                                </div>
                                <p className="text-sm font-medium">{member.user?.username}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetailPage;
