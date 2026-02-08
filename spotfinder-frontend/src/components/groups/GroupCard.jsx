import { FaUsers, FaMapMarkerAlt, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const GroupCard = ({ group, onJoin, isMember }) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
            <div className="flex gap-4">
                {group.image_url && (
                    <img src={group.image_url} alt={group.name} className="w-24 h-24 rounded-lg object-cover" />
                )}

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link to={`/groups/${group.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">
                                {group.name}
                            </h3>
                        </Link>
                        {group.is_private && (
                            <FaLock className="text-gray-400" size={14} />
                        )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{group.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                            <FaUsers />
                            <span>{group.member_count} members</span>
                        </div>

                        {group.location && (
                            <div className="flex items-center gap-1">
                                <FaMapMarkerAlt />
                                <Link to={`/location/${group.location.id}`} className="hover:text-blue-600">
                                    {group.location.name}
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {group.group_type}
                        </span>

                        {onJoin && (
                            <>
                                {isMember ? (
                                    <span className="text-sm text-green-600 font-medium">Member</span>
                                ) : (
                                    <button
                                        onClick={() => onJoin(group.id)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                    >
                                        Join Group
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupCard;
