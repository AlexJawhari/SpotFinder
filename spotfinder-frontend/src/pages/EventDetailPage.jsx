import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import eventService from '../services/events.service';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModerationControls from '../components/common/ModerationControls';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRsvp, setUserRsvp] = useState(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const data = await eventService.getEvent(id);
            setEvent(data);

            if (isAuthenticated && data.rsvps) {
                const myRsvp = data.rsvps.find(r => r.user_id === user?.id);
                setUserRsvp(myRsvp);
            }
        } catch (error) {
            toast.error('Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await eventService.deleteEvent(id);
            toast.success('Event deleted');
            navigate('/events');
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const handleRsvp = async (status) => {
        if (!isAuthenticated) {
            toast.error('Please login to RSVP');
            return;
        }

        try {
            if (status) {
                await eventService.rsvpEvent(id, status);
                toast.success('RSVP confirmed!');
            } else {
                await eventService.removeRsvp(id);
                toast.success('RSVP cancelled');
            }
            fetchEvent();
        } catch (error) {
            toast.error('Failed to update RSVP');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            await eventService.addComment(id, comment);
            setComment('');
            toast.success('Comment added!');
            fetchEvent();
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!event) {
        return <div className="text-center py-12">Event not found</div>;
    }

    const startDate = new Date(event.start_time);
    const endDate = event.end_time ? new Date(event.end_time) : null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <ModerationControls
                        creatorId={event.created_by}
                        onDelete={handleDelete}
                        resourceName="event"
                    />
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
                    <div className="flex items-center gap-2">
                        <FaCalendar />
                        <span>{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaClock />
                        <span>{format(startDate, 'h:mm a')} {endDate && `- ${format(endDate, 'h:mm a')}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaUser />
                        <span>{event.rsvps?.length || 0} attending</span>
                    </div>
                </div>

                {event.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <FaMapMarkerAlt />
                        <Link to={`/location/${event.location.id}`} className="hover:text-blue-600">
                            {event.location.name}{event.location.address && `, ${event.location.address}`}
                        </Link>
                    </div>
                )}

                <div className="mb-4">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm">
                        {event.event_type}
                    </span>
                </div>

                {event.description && (
                    <p className="text-gray-700 mb-6 whitespace-pre-wrap">{event.description}</p>
                )}

                {isAuthenticated && (
                    <div className="flex gap-4">
                        {userRsvp ? (
                            <>
                                <button
                                    onClick={() => handleRsvp(null)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel RSVP
                                </button>
                                <span className="px-6 py-2 bg-green-100 text-green-700 rounded-lg">
                                    You're attending!
                                </span>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleRsvp('going')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    I'm Going
                                </button>
                                <button
                                    onClick={() => handleRsvp('interested')}
                                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                                >
                                    Interested
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Attendees */}
            {event.rsvps && event.rsvps.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Attendees ({event.rsvps.length})</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {event.rsvps.map(rsvp => (
                            <div key={rsvp.id} className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <FaUser className="text-blue-600" />
                                </div>
                                <p className="text-sm font-medium">{rsvp.user?.username}</p>
                                <p className="text-xs text-gray-500">{rsvp.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>

                {isAuthenticated && (
                    <form onSubmit={handleAddComment} className="mb-6">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                            rows={3}
                        />
                        <button
                            type="submit"
                            disabled={submitting || !comment.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>
                )}

                <div className="space-y-4">
                    {event.comments?.length > 0 ? (
                        event.comments.map(comment => (
                            <div key={comment.id} className="border-b border-gray-200 pb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">{comment.user?.username}</span>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <p className="text-gray-700">{comment.comment_text}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No comments yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;
