import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <header className="min-h-[72px] flex flex-col justify-center bg-gradient-to-b from-white/95 via-white/85 to-white/75 dark:from-slate-900/95 dark:via-slate-900/85 dark:to-slate-900/75 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b-2 border-white/60 dark:border-white/10 relative overflow-hidden">
            {/* Web 2.0 Gloss - Frutiger Aero auroras and lens flares */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none will-change-transform" style={{ transform: 'translateZ(0)' }}>
                {/* Aurora effect - Static for performance */}
                <div className="absolute top-0 left-0 w-full h-full opacity-25">
                    <div className="absolute top-0 left-10 w-40 h-40 bg-gradient-radial from-[#7DD3FC]/30 via-[#7DD3FC]/15 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute top-0 right-20 w-32 h-32 bg-gradient-radial from-[#86EFAC]/30 via-[#86EFAC]/15 to-transparent rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-1/3 w-28 h-28 bg-gradient-radial from-[#F9A8D4]/20 via-[#F9A8D4]/10 to-transparent rounded-full blur-xl"></div>
                </div>
                {/* Lens flare - Aero reflective style */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/15 via-white/5 to-transparent rounded-full blur-2xl"></div>
                {/* Bokeh bubbles - Frutiger Aero decorative */}
                <div className="absolute top-2 left-1/4 w-3 h-3 bg-[#7DD3FC]/25 rounded-full blur-sm"></div>
                <div className="absolute top-4 right-1/3 w-2 h-2 bg-[#86EFAC]/25 rounded-full blur-sm"></div>
                <div className="absolute bottom-2 left-2/3 w-2.5 h-2.5 bg-[#F9A8D4]/25 rounded-full blur-sm"></div>
            </div>

            {/* Glossy overlay - Windows Vista/7 Aero skeuomorphism */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 via-white/20 to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-6 sm:px-8 py-4 flex justify-between items-center relative z-10">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold group">
                    <div className="relative p-2.5 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                        <FaMapMarkedAlt className="text-[#38BDF8] text-xl" />
                    </div>
                    <span className="text-[#0F172A] dark:text-white font-black tracking-tighter text-2xl">
                        SpotFinder
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center space-x-1 bg-slate-50 p-1 rounded-full border border-slate-100 shadow-sm">
                    {[
                        { to: '/', label: 'Locations' },
                        { to: '/events', label: 'Events' },
                        { to: '/community', label: 'Forums' },
                        { to: '/groups', label: 'Groups' },
                    ].map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`
                                px-6 py-2 rounded-full font-bold text-sm transition-all duration-300
                                ${window.location.pathname === to 
                                    ? 'bg-white text-[#38BDF8] shadow-sm' 
                                    : 'text-slate-500 hover:text-[#38BDF8] hover:bg-white/40'
                                }
                            `}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 pl-2">
                            <Link
                                to="/settings"
                                className="flex items-center gap-2 py-2 px-4 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm text-slate-700 dark:text-slate-200"
                            >
                                <FaUser className="text-slate-400" />
                                <span>{user?.username}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2.5 rounded-full text-slate-400 hover:text-red-400 transition-all"
                                title="Logout"
                            >
                                <FaSignOutAlt />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-[#38BDF8] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#0EA5E9] transition-all shadow-lg shadow-sky-100 dark:shadow-none"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
