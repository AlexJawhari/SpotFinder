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
        <header className="min-h-[72px] flex flex-col justify-center bg-gradient-to-b from-white/95 via-white/85 to-white/75 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b-2 border-white/60 relative overflow-hidden">
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

            <div className="container mx-auto px-6 sm:px-8 py-5 flex flex-wrap justify-between items-center gap-4 relative z-10">
                <Link to="/" className="flex items-center gap-3 text-2xl font-bold group" style={{ willChange: 'transform' }}>
                    {/* Glossy icon container with skeuomorphism - Windows Vista/7 Aero style */}
                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-[#4FC3F7]/40 via-[#66BB6A]/30 to-[#26C6DA]/35 backdrop-blur-md border-2 border-white/70 shadow-xl hover:shadow-2xl transition-all group-hover:scale-105" style={{ transform: 'translateZ(0)' }}>
                        {/* Glossy highlight - Web 2.0 Gloss / Aero effect */}
                        <div className="absolute top-1 left-1 right-1 h-1/2 bg-gradient-to-b from-white/80 via-white/50 to-transparent rounded-t-2xl"></div>
                        {/* Inner shine - lens flare effect */}
                        <div className="absolute top-2 left-2 w-10 h-10 bg-white/50 rounded-full blur-lg"></div>
                        {/* Outer glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4FC3F7]/20 to-[#66BB6A]/20 rounded-2xl blur-sm"></div>
                        <FaMapMarkedAlt className="text-[#4FC3F7] text-2xl relative z-10 drop-shadow-lg" />
                    </div>
                    <span className="bg-gradient-to-r from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] bg-clip-text text-transparent drop-shadow-lg font-bold tracking-tight">
                        SpotFinder
                    </span>
                </Link>

                <nav className="flex flex-wrap items-center gap-3 sm:gap-5">
                    <Link to="/" className="relative text-slate-800 hover:text-[#4FC3F7] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#4FC3F7]/15 hover:to-[#66BB6A]/15 group border border-transparent hover:border-white/40 hover:shadow-lg" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                        <span className="relative z-10 font-medium">Locations</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link to="/events" className="relative text-slate-800 hover:text-[#4FC3F7] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#4FC3F7]/15 hover:to-[#66BB6A]/15 group border border-transparent hover:border-white/40 hover:shadow-lg" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                        <span className="relative z-10 font-medium">Events</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link to="/community" className="relative text-slate-800 hover:text-[#4FC3F7] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#4FC3F7]/15 hover:to-[#66BB6A]/15 group border border-transparent hover:border-white/40 hover:shadow-lg" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                        <span className="relative z-10 font-medium">Community</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link to="/groups" className="relative text-slate-800 hover:text-[#4FC3F7] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#4FC3F7]/15 hover:to-[#66BB6A]/15 group border border-transparent hover:border-white/40 hover:shadow-lg" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
                        <span className="relative z-10 font-medium">Groups</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="relative text-slate-700 hover:text-[#7DD3FC] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#7DD3FC]/15 hover:to-[#86EFAC]/15 group border border-transparent hover:border-white/30 hover:shadow-lg">
                                <span className="relative z-10">Dashboard</span>
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/settings"
                                    className="relative flex items-center gap-2 text-slate-700 hover:text-[#7DD3FC] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#7DD3FC]/15 hover:to-[#86EFAC]/15 group border border-transparent hover:border-white/30 hover:shadow-lg"
                                >
                                    <FaUser className="relative z-10" />
                                    <span className="relative z-10">{user?.username}</span>
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="relative flex items-center gap-2 text-slate-700 hover:text-[#F9A8D4] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#F9A8D4]/15 hover:to-[#FCD34D]/15 group border border-transparent hover:border-white/30 hover:shadow-lg"
                                >
                                    <FaSignOutAlt className="relative z-10" />
                                    <span className="relative z-10">Logout</span>
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="relative text-slate-700 hover:text-[#7DD3FC] transition-all px-4 py-2.5 rounded-xl hover:bg-gradient-to-br hover:from-[#7DD3FC]/15 hover:to-[#86EFAC]/15 group border border-transparent hover:border-white/30 hover:shadow-lg"
                            >
                                <span className="relative z-10">Login</span>
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                            <Link
                                to="/register"
                                className="relative bg-gradient-to-br from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold border-2 border-white/50 overflow-hidden group"
                                style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                            >
                                <span className="relative z-10">Sign Up</span>
                                {/* Glossy highlight - Web 2.0 Gloss / Aero */}
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 via-white/30 to-transparent"></div>
                                {/* Shine effect on hover - only on interaction */}
                                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity"></div>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
