import { FaArrowUp, FaArrowDown, FaComment, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PostCard = ({ post, onVote, userVote }) => {
    const score = (post.upvotes || 0) - (post.downvotes || 0);

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
            <div className="flex gap-4">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => onVote && onVote(post.id, userVote === 'upvote' ? null : 'upvote')}
                        className={`p-1 rounded hover:bg-gray-100 ${userVote === 'upvote' ? 'text-orange-600' : 'text-gray-500'}`}
                    >
                        <FaArrowUp size={20} />
                    </button>
                    <span className={`font-semibold ${score > 0 ? 'text-orange-600' : score < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                        {score}
                    </span>
                    <button
                        onClick={() => onVote && onVote(post.id, userVote === 'downvote' ? null : 'downvote')}
                        className={`p-1 rounded hover:bg-gray-100 ${userVote === 'downvote' ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        <FaArrowDown size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="font-medium text-gray-700">{post.author?.username || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {post.post_type?.replace('_', ' ')}
                        </span>
                    </div>

                    <Link to={`/community/${post.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition mb-2">
                            {post.title}
                        </h3>
                    </Link>

                    <p className="text-gray-700 line-clamp-3 mb-3">{post.content}</p>

                    {post.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <FaMapMarkerAlt />
                            <Link to={`/location/${post.location.id}`} className="hover:text-blue-600">
                                {post.location.name}
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Link to={`/community/${post.id}`} className="flex items-center gap-1 hover:text-blue-600">
                            <FaComment />
                            <span>{post.comment_count?.[0]?.count || 0} comments</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
