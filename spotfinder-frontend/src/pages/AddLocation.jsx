import LocationForm from '../components/locations/LocationForm';

const AddLocation = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Location</h1>
            <p className="text-gray-600 mb-6">Share a great spot with the community</p>
            <div className="bg-white rounded-lg shadow-md p-6">
                <LocationForm />
            </div>
        </div>
    );
};

export default AddLocation;
