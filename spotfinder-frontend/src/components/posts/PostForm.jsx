import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../services/postService';
import LoadingSpinner from '../common/LoadingSpinner';

const POST_TYPES = [
    { id: 'looking_for_buddy', label: 'Looking for Company' },
    { id: 'discovery', label: 'Third Space Discovery' },
    { id: 'tips', label: 'Tips & Advice' },
    { id: 'discussion', label: 'General Discussion' },
];

const PostForm = ({ post, locations = [], onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: post || {},
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (post?.id) {
                await postService.updatePost(post.id, data);
                toast.success('Post updated!');
            } else {
                const newPost = await postService.createPost(data);
                toast.success('Post created!');
                if (onSuccess) {
                    onSuccess(newPost);
                } else {
                    navigate(`/community/${newPost.id}`);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title *
                </label>
                <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    placeholder="e.g., Looking for study partner at Main Library"
                />
                {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Content *
                </label>
                <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={6}
                    className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    placeholder="Share your thoughts, ask questions, or find companions..."
                />
                {errors.content && <p className="mt-1 text-sm text-rose-600">{errors.content.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Post Type *
                    </label>
                    <select
                        {...register('post_type', { required: 'Post type is required' })}
                        className="w-full px-4 py-2.5 border-2 border-[#B2DFDB]/60 rounded-xl focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] bg-white/80"
                    >
                        <option value="">Select type</option>
                        {POST_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                    {errors.post_type && <p className="mt-1 text-sm text-rose-600">{errors.post_type.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Related Location (optional)
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
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? <LoadingSpinner size="sm" color="white" /> : (post ? 'Update Post' : 'Create Post')}
                </button>
            </div>
        </form>
    );
};

export default PostForm;
