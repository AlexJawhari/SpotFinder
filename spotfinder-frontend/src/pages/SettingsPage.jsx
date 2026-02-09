import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaUser, FaLock, FaGlobe, FaSlidersH, FaHistory } from 'react-icons/fa';

const SettingsPage = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        location_city: '',
        default_radius: 5,
        preferred_amenities: [],
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUserData();
    }, [user, navigate]);

    const fetchUserData = async () => {
        try {
            const profile = await userService.getProfile(user.id);
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: profile.bio || '',
                location_city: profile.location_city || '',
                default_radius: user.default_radius || 5,
                preferred_amenities: profile.interests || [], // Reusing interests/amenities
            });
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Update account settings (users table)
            const updatedAccount = await userService.updateSettings({
                username: formData.username,
                default_radius: parseInt(formData.default_radius),
            });

            // Update profile data (user_profiles table)
            await userService.updateProfile({
                bio: formData.bio,
                location_city: formData.location_city,
                interests: formData.preferred_amenities,
            });

            // Update local auth store
            setUser({ ...user, ...updatedAccount });

            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    const sections = [
        { id: 'profile', label: 'Public Profile', icon: <FaUser /> },
        { id: 'account', label: 'Account Settings', icon: <FaLock /> },
        { id: 'map', label: 'Map & Discovery', icon: <FaGlobe /> },
        { id: 'preferences', label: 'Preferences', icon: <FaSlidersH /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-2">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 px-4">Settings</h2>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeSection === section.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'text-slate-600 hover:bg-white hover:text-blue-600'
                                    }`}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </aside>

                    {/* Content */}
                    <main className="flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <form onSubmit={handleSave} className="p-8 space-y-8">

                            {activeSection === 'profile' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="border-b border-slate-100 pb-4">
                                        <h3 className="text-lg font-bold text-slate-900">Public Profile</h3>
                                        <p className="text-sm text-slate-500">Information that will be visible to other users.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Display Bio</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none min-h-[120px]"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Home City</label>
                                            <input
                                                type="text"
                                                value={formData.location_city}
                                                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                                placeholder="e.g. Dallas, TX"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'account' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="border-b border-slate-100 pb-4">
                                        <h3 className="text-lg font-bold text-slate-900">Account Details</h3>
                                        <p className="text-sm text-slate-500">Manage your private account information.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Username</label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 text-slate-400">Email (Cannot be changed)</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'map' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="border-b border-slate-100 pb-4">
                                        <h3 className="text-lg font-bold text-slate-900">Map & Discovery</h3>
                                        <p className="text-sm text-slate-500">Customize how you explore the map.</p>
                                    </div>

                                    <div className="max-w-md space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-semibold text-slate-700">Default Search Radius (km)</label>
                                                <span className="text-sm font-bold text-blue-600">{formData.default_radius} km</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={formData.default_radius}
                                                onChange={(e) => setFormData({ ...formData, default_radius: e.target.value })}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                                <span>1 km</span>
                                                <span>50 km</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 bg-gradient-to-br from-blue-600 to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
