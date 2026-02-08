import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating = 0, maxRating = 5, size = 'md', interactive = false, onChange }) => {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl',
    };

    const renderStars = () => {
        const stars = [];

        for (let i = 1; i <= maxRating; i++) {
            const filled = i <= rating;
            const halfFilled = i - 0.5 === rating;

            stars.push(
                <span
                    key={i}
                    className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                    onClick={() => interactive && onChange && onChange(i)}
                >
                    {filled ? (
                        <FaStar className={`${sizeClasses[size]} text-yellow-400`} />
                    ) : halfFilled ? (
                        <FaStarHalfAlt className={`${sizeClasses[size]} text-yellow-400`} />
                    ) : (
                        <FaRegStar className={`${sizeClasses[size]} text-gray-300`} />
                    )}
                </span>
            );
        }

        return stars;
    };

    return (
        <div className="flex items-center gap-1">
            {renderStars()}
            {!interactive && (
                <span className="ml-1 text-sm text-gray-600">
                    {rating > 0 ? rating.toFixed(1) : 'No ratings'}
                </span>
            )}
        </div>
    );
};

export default StarRating;
