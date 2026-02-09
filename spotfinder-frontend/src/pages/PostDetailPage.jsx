import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { postService } from '../services/postService';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModerationControls from '../components/common/ModerationControls';
import { FaArrowUp, FaArrowDown, FaMapMarkerAlt } from 'react-icons/fa';

const PostDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const data = await postService.getPost(id);
            setPost(data);
        } catch (error) {
            toast.error('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await postService.deletePost(id);
            toast.success('Post deleted');
            navigate('/community');
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleVote = async (voteType) => {
        if (!isAuthenticated) {
            toast.error('Please login to vote');
            return;
        }

        try {
            if (voteType) {
                await postService.votePost(id, voteType);
            } else {
                await postService.removeVote(id);
            }
            fetchPost();
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            await postService.addComment(id, comment);
            setComment('');
            toast.success('Comment added!');
            fetchPost();
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

    if (!post) {
        return <div className="text-center py-12">Post not found</div>;
    }

    const score = (post.upvotes || 0) - (post.downvotes || 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => handleVote('upvote')}
                            className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-orange-600"
                        >
                            <FaArrowUp size={24} />
                        </button>
                        <span className={`font-bold text-xl ${score > 0 ? 'text-orange-600' : score < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                            {score}
                        </span>
                        <button
                            onClick={() => handleVote('downvote')}
                            className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                        >
                            <FaArrowDown size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <span className="font-medium text-gray-700">{post.author?.username || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{format(new Date(post.created_at), 'MMMM d, yyyy at h:mm a')}</span>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                            <ModerationControls
                                creatorId={post.created_by}
                                onDelete={handleDelete}
                                resourceName="post"
                            />
                        </div>

                        <div className="mb-4">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
                                {post.post_type?.replace('_', ' ')}
                            </span>
                        </div>

                        {post.location && (
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <FaMapMarkerAlt />
                                <Link to={`/location/${post.location.id}`} className="hover:text-blue-600">
                                    {post.location.name}
                                </Link>
                            </div>
                        )}

                        <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                            {post.content}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Comments ({post.comments?.length || 0})
                </h2>

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
                    {post.comments?.length > 0 ? (
                        post.comments.map(comment => (
                            <div key={comment.id} className="border-b border-gray-200 pb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">{comment.author?.username}</span>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <p className="text-gray-700">{comment.comment_text}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;
