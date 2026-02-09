import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postService } from '../services/postService';
import { locationService } from '../services/locationService';
import { useAuthStore } from '../store/authStore';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const POST_TYPES = [
    { id: 'all', label: 'All Posts' },
    { id: 'looking_for_buddy', label: 'Looking for Company' },
    { id: 'discovery', label: 'Discoveries' },
    { id: 'tips', label: 'Tips & Advice' },
    { id: 'discussion', label: 'Discussion' },
];

const SORT_OPTIONS = [
    { id: 'newest', label: 'Newest' },
    { id: 'hot', label: 'Hot' },
    { id: 'top', label: 'Top' },
];

const CommunityPage = () => {
    const { isAuthenticated } = useAuthStore();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('newest');

    useEffect(() => {
        fetchPosts();
    }, [filter, sort]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const filters = {
                ...(filter !== 'all' && { post_type: filter }),
                sort,
            };
            const data = await postService.getPosts(filters);
            setPosts(data || []);
        } catch (error) {
            console.error('Failed to load posts:', error);
            // Only show error toast if it's a real error, not just empty results
            if (error.response?.status !== 404) {
                toast.error('Failed to load posts');
            }
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (postId, voteType) => {
        if (!isAuthenticated) {
            toast.error('Please login to vote');
            return;
        }

        try {
            if (voteType) {
                await postService.votePost(postId, voteType);
            } else {
                await postService.removeVote(postId);
            }
            fetchPosts();
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await postService.deletePost(postId);
            setPosts(posts.filter(p => p.id !== postId));
            toast.success('Post deleted');
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] bg-clip-text text-transparent">Community</h1>
                {isAuthenticated && (
                    <Link
                        to="/community/create"
                        className="px-6 py-2 bg-gradient-to-br from-[#4FC3F7] to-[#66BB6A] text-white rounded-full hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden group"
                        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    >
                        <span className="relative z-10">Create Post</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent"></div>
                    </Link>
                )}
            </div>

            {/* Filters and Sort */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 border border-white/50">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex gap-2 flex-wrap flex-1">
                        {POST_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilter(type.id)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${filter === type.id
                                    ? 'bg-gradient-to-r from-[#4FC3F7] to-[#66BB6A] text-white shadow-lg'
                                    : 'bg-white/85 backdrop-blur-sm text-slate-700 hover:bg-white border border-[#B2DFDB]/50'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-3 py-1.5 border-2 border-[#E2E8F0] rounded-xl text-sm focus:ring-2 focus:ring-[#7DD3FC] focus:border-[#7DD3FC] transition-all bg-white/50"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-600 text-lg mb-2">No posts yet</p>
                    <p className="text-gray-500 text-sm mb-4">Be the first to start a conversation!</p>
                    {isAuthenticated && (
                        <Link
                            to="/community/create"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create First Post
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onVote={handleVote}
                            onDelete={handleDeletePost}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
