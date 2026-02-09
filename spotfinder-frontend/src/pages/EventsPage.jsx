import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import eventService from '../services/events.service';
import { locationService } from '../services/locationService';
import { useAuthStore } from '../store/authStore';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EVENT_TYPES = ['all', 'club', 'study', 'social', 'networking', 'workshop', 'sports'];

const EventsPage = () => {
    const { isAuthenticated } = useAuthStore();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [userRsvps, setUserRsvps] = useState([]);

    useEffect(() => {
        fetchEvents();
        if (isAuthenticated) {
            fetchUserRsvps();
        }
    }, [filter, isAuthenticated]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const filters = filter !== 'all' ? { event_type: filter } : {};
            const data = await eventService.getEvents(filters);
            setEvents(data || []);
        } catch (error) {
            console.error('Failed to load events:', error);
            // Only show error toast if it's a real error, not just empty results
            if (error.response?.status !== 404) {
                toast.error('Failed to load events');
            }
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRsvps = async () => {
        try {
            const data = await eventService.getUserEvents();
            setUserRsvps(data.attending || []);
        } catch (error) {
            console.error('Failed to load RSVPs');
        }
    };

    const handleRsvp = async (eventId, status) => {
        if (!isAuthenticated) {
            toast.error('Please login to RSVP');
            return;
        }

        try {
            if (status) {
                await eventService.rsvpEvent(eventId, status);
                toast.success('RSVP confirmed!');
            } else {
                await eventService.removeRsvp(eventId);
                toast.success('RSVP cancelled');
            }
            fetchEvents();
            fetchUserRsvps();
        } catch (error) {
            toast.error('Failed to update RSVP');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await eventService.deleteEvent(eventId);
            setEvents(events.filter(e => e.id !== eventId));
            toast.success('Event deleted');
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] bg-clip-text text-transparent">Events</h1>
                {isAuthenticated && (
                    <Link
                        to="/events/create"
                        className="px-6 py-2 bg-gradient-to-br from-[#4FC3F7] to-[#66BB6A] text-white rounded-full hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden group"
                        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    >
                        <span className="relative z-10">Create Event</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent"></div>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {EVENT_TYPES.map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${filter === type
                            ? 'bg-gradient-to-r from-[#4FC3F7] to-[#66BB6A] text-white shadow-lg'
                            : 'bg-white/85 backdrop-blur-sm text-slate-700 hover:bg-white border border-[#B2DFDB]/50'
                            }`}
                    >
                        {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-2">No events found</p>
                    <p className="text-gray-500 text-sm">Be the first to create an event!</p>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {events.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onRsvp={handleRsvp}
                            userRsvpStatus={getUserRsvpStatus(event.id)}
                            onDelete={handleDeleteEvent}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
