import { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';
import PostForm from '../components/posts/PostForm';

const CreatePostPage = () => {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const data = await locationService.getLocations();
            setLocations(data);
        } catch (error) {
            console.error('Failed to load locations');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] bg-clip-text text-transparent mb-2">Create Post</h1>
            <p className="text-slate-600 mb-6">Share with the community, find companions, or ask for advice</p>

            <div className="relative rounded-2xl shadow-aero border-2 border-white/60 bg-white/90 backdrop-blur-md p-6 sm:p-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-2xl" />
                <div className="relative z-10">
                    <PostForm locations={locations} />
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
