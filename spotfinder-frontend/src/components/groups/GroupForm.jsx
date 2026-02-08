import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import LoadingSpinner from '../common/LoadingSpinner';

const GROUP_TYPES = [
    { id: 'study', label: 'Study Group' },
    { id: 'hobby', label: 'Hobby' },
    { id: 'sports', label: 'Sports/Fitness' },
    { id: 'professional', label: 'Professional' },
    { id: 'social', label: 'Social' },
];

const GroupForm = ({ group, locations = [], onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: group || {},
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const groupData = {
                ...data,
                is_private: data.is_private === 'true',
            };

            if (group?.id) {
                await groupService.updateGroup(group.id, groupData);
                toast.success('Group updated!');
            } else {
                const newGroup = await groupService.createGroup(groupData);
                toast.success('Group created!');
                if (onSuccess) {
                    onSuccess(newGroup);
                } else {
                    navigate(`/groups/${newGroup.id}`);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Group Name *
                </label>
                <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    placeholder="Study Buddies, Book Club, Running Group..."
                />
                {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    placeholder="What's your group about?"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Group Type *
                    </label>
                    <select
                        {...register('group_type', { required: 'Group type is required' })}
                        className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    >
                        <option value="">Select type</option>
                        {GROUP_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                    {errors.group_type && <p className="mt-1 text-sm text-rose-600">{errors.group_type.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Default Meetup Location
                    </label>
                    <select
                        {...register('location_id')}
                        className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    >
                        <option value="">None</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Privacy
                </label>
                <select
                    {...register('is_private')}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                >
                    <option value="false">Public - Anyone can join</option>
                    <option value="true">Private - Requires approval</option>
                </select>
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
                    {loading ? <LoadingSpinner size="sm" color="white" /> : (group ? 'Update Group' : 'Create Group')}
                </button>
            </div>
        </form>
    );
};

export default GroupForm;
