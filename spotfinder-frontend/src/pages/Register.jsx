import { FaMapMarkedAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <FaMapMarkedAlt className="text-blue-600 text-5xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Join SpotFinder</h1>
                    <p className="text-gray-600">Discover and share amazing places</p>
                </div>
                <RegisterForm />
                <div className="mt-6 text-center">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
