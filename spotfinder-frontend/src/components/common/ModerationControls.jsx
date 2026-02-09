import { FaTrash } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const ModerationControls = ({ creatorId, onDelete, resourceName = 'item' }) => {
    const { user } = useAuthStore();

    if (!user) return null;

    const isAdmin = user.email === 'alexjw99@gmail.com' || user.email === 'admin@gmail.com' || user.isAdmin === true;
    const isCreator = user.id === creatorId;

    if (!isAdmin && !isCreator) {
        return null; // Don't render anything if not authorized
    }

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete this ${resourceName}? This action cannot be undone.`)) {
            onDelete();
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 transition text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
            title={`Delete ${resourceName}`}
        >
            <FaTrash size={14} />
            <span>Delete</span>
        </button>
    );
};

export default ModerationControls;
