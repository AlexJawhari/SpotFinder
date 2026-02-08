import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaUser, FaMapMarkerAlt } from 'react-icons/fa';

const ProfilePage = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        location_city: '',
        interests: [],
    });

    const isOwnProfile = !userId || userId === currentUser?.id;

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile(userId);
            setProfile(data);
            setFormData({
                bio: data.bio || '',
                location_city: data.location_city || '',
                interests: data.interests || [],
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await userService.unfollowUser(userId);
                toast.success('Unfollowed');
                setIsFollowing(false);
            } else {
                await userService.followUser(userId);
                toast.success('Following!');
                setIsFollowing(true);
            }
            fetchProfile();
        } catch (error) {
            toast.error('Failed to update follow status');
        }
    };

    const handleSaveProfile = async () => {
        try {
            await userService.updateProfile(formData);
            toast.success('Profile updated!');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center py-12">Profile not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            {profile.profile_picture_url ? (
                                <img src={profile.profile_picture_url} alt={profile.user?.username} className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                                <FaUser className="text-blue-600 text-3xl" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{profile.user?.username}</h1>
                            {profile.location_city && (
                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                    <FaMapMarkerAlt />
                                    <span>{profile.location_city}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isOwnProfile && (
                        <button
                            onClick={handleFollow}
                            className={`px-4 py-2 rounded-lg ${isFollowing
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}

                    {isOwnProfile && !editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="flex gap-6 mb-6 text-center">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{profile.follower_count || 0}</div>
                        <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{profile.following_count || 0}</div>
                        <div className="text-sm text-gray-600">Following</div>
                    </div>
                </div>

                {editing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={formData.location_city}
                                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="City, State"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {profile.bio && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                            </div>
                        )}

                        {profile.interests && profile.interests.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map((interest, idx) => (
                                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Activity Section - Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-500 text-center py-8">Activity feed coming soon!</p>
            </div>
        </div>
    );
};

export default ProfilePage;
