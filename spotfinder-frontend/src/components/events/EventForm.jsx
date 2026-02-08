import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/events.service';
import LoadingSpinner from '../common/LoadingSpinner';

const EVENT_TYPES = [
    { id: 'club', label: 'Club Meeting' },
    { id: 'study', label: 'Study Group' },
    { id: 'social', label: 'Social Hangout' },
    { id: 'networking', label: 'Networking' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'sports', label: 'Sports/Fitness' },
];

const EventForm = ({ event, locations = [], onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: event || {},
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const eventData = {
                ...data,
                max_attendees: data.max_attendees ? parseInt(data.max_attendees) : null,
            };

            if (event?.id) {
                await eventService.updateEvent(event.id, eventData);
                toast.success('Event updated!');
            } else {
                const newEvent = await eventService.createEvent(eventData);
                toast.success('Event created!');
                if (onSuccess) {
                    onSuccess(newEvent);
                } else {
                    navigate(`/events/${newEvent.id}`);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Event Title *
                </label>
                <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    placeholder="Study session at library"
                />
                {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    placeholder="Tell people about your event..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Event Type *
                    </label>
                    <select
                        {...register('event_type', { required: 'Event type is required' })}
                        className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    >
                        <option value="">Select type</option>
                        {EVENT_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                    {errors.event_type && <p className="mt-1 text-sm text-rose-600">{errors.event_type.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Location
                    </label>
                    <select
                        {...register('location_id')}
                        className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    >
                        <option value="">Select location (optional)</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Start Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        {...register('start_time', { required: 'Start time is required' })}
                        className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    />
                    {errors.start_time && <p className="mt-1 text-sm text-rose-600">{errors.start_time.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        End Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        {...register('end_time')}
                        className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Attendees (optional)
                </label>
                <input
                    type="number"
                    {...register('max_attendees')}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    placeholder="Leave empty for unlimited"
                />
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl hover:bg-[#E8F5E9]/80 text-slate-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] text-white py-2.5 px-4 rounded-xl hover:shadow-aero disabled:opacity-50 flex items-center justify-center font-semibold border-2 border-white/50"
                >
                    {loading ? <LoadingSpinner size="sm" color="white" /> : (event ? 'Update Event' : 'Create Event')}
                </button>
            </div>
        </form>
    );
};

export default EventForm;
