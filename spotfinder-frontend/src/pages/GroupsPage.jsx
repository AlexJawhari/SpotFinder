import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { groupService } from '../services/groupService';
import { useAuthStore } from '../store/authStore';
import GroupCard from '../components/groups/GroupCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GROUP_TYPES = ['all', 'study', 'hobby', 'sports', 'professional', 'social'];

const GroupsPage = () => {
    const { isAuthenticated } = useAuthStore();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        fetchGroups();
        if (isAuthenticated) {
            fetchUserGroups();
        }
    }, [filter, isAuthenticated]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const filters = filter !== 'all' ? { group_type: filter } : {};
            const data = await groupService.getGroups(filters);
            setGroups(data || []);
        } catch (error) {
            console.error('Failed to load groups:', error);
            // Only show error toast if it's a real error, not just empty results
            if (error.response?.status !== 404) {
                toast.error('Failed to load groups');
            }
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserGroups = async () => {
        try {
            const data = await groupService.getUserGroups();
            setUserGroups(data);
        } catch (error) {
            console.error('Failed to load user groups');
        }
    };

    const handleJoin = async (groupId) => {
        if (!isAuthenticated) {
            toast.error('Please login to join groups');
            return;
        }

        try {
            await groupService.joinGroup(groupId);
            toast.success('Joined group!');
            fetchGroups();
            fetchUserGroups();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to join group');
        }
    };

    const isMember = (groupId) => {
        return userGroups.some(g => g.id === groupId);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] bg-clip-text text-transparent">Groups</h1>
                {isAuthenticated && (
                    <Link
                        to="/groups/create"
                        className="px-6 py-2 bg-gradient-to-br from-[#4FC3F7] to-[#66BB6A] text-white rounded-full hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden group border-2 border-white/50"
                        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    >
                        <span className="relative z-10">Create Group</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {GROUP_TYPES.map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${filter === type
                                ? 'bg-gradient-to-r from-[#4FC3F7] to-[#66BB6A] text-white shadow-lg'
                                : 'bg-white/85 backdrop-blur-sm text-slate-700 hover:bg-white border border-[#B2DFDB]/50'
                            }`}
                    >
                        {type === 'all' ? 'All Groups' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-12 rounded-2xl shadow-aero border-2 border-white/60 bg-white/90 backdrop-blur-md">
                    <p className="text-slate-600 text-lg mb-2">No groups found</p>
                    <p className="text-slate-500 text-sm mb-4">Start your own group and build a community!</p>
                    {isAuthenticated && (
                        <Link
                            to="/groups/create"
                            className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#4FC3F7] to-[#66BB6A] text-white rounded-xl hover:shadow-aero font-semibold border-2 border-white/50"
                        >
                            Create First Group
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {groups.map(group => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            onJoin={handleJoin}
                            isMember={isMember(group.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupsPage;
