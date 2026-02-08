import { FaCalendar, FaMapMarkerAlt, FaClock, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const EventCard = ({ event, onRsvp, userRsvpStatus }) => {
    const startDate = new Date(event.start_time);
    const attendeeCount = event.rsvp_count?.[0]?.count || 0;

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
            {event.image_url && (
                <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />
            )}

            <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FaCalendar />
                    <span>{format(startDate, 'MMM d, yyyy')}</span>
                    <FaClock />
                    <span>{format(startDate, 'h:mm a')}</span>
                </div>

                <Link to={`/events/${event.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition mb-2">
                        {event.title}
                    </h3>
                </Link>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{event.description}</p>

                {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <FaMapMarkerAlt />
                        <Link to={`/location/${event.location.id}`} className="hover:text-blue-600">
                            {event.location.name}
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUser />
                        <span>{attendeeCount} attending</span>
                    </div>

                    {onRsvp && (
                        <div className="flex gap-2">
                            {userRsvpStatus ? (
                                <button
                                    onClick={() => onRsvp(event.id, null)}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                >
                                    Cancel RSVP
                                </button>
                            ) : (
                                <button
                                    onClick={() => onRsvp(event.id, 'going')}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    Attend
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-3">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {event.event_type}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
