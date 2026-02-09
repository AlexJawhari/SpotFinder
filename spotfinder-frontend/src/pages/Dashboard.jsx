import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { favoriteService } from '../services/favoriteService';
import { locationService } from '../services/locationService';
import eventService from '../services/events.service';
import { postService } from '../services/postService';
import { groupService } from '../services/groupService';
import LocationCard from '../components/locations/LocationCard';
import EventCard from '../components/events/EventCard';
import PostCard from '../components/posts/PostCard';
import GroupCard from '../components/groups/GroupCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('favorites');
    const [favorites, setFavorites] = useState([]);
    const [myLocations, setMyLocations] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [favoritesData, locationsData, eventsData, postsData, groupsData] = await Promise.all([
                    favoriteService.getFavorites(),
                    locationService.getLocations(),
                    eventService.getUserEvents(),
                    postService.getUserPosts(),
                    groupService.getUserGroups(),
                ]);

                setFavorites(favoritesData);
                setMyLocations(locationsData.filter(loc => loc.created_by === user?.id));
                setMyEvents(eventsData);
                setMyPosts(postsData);
                setMyGroups(groupsData);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleFavoriteRemove = async (location) => {
        try {
            const fav = favorites.find(f => f.location_id === location.id);
            if (fav) {
                await favoriteService.removeFavorite(fav.id);
                setFavorites(favorites.filter(f => f.id !== fav.id));
                toast.success('Removed from favorites');
            }
        } catch (error) {
            toast.error('Failed to remove favorite');
        }
        const handleDeleteEvent = async (eventId) => {
            try {
                await eventService.deleteEvent(eventId);
                setMyEvents(prev => ({
                    ...prev,
                    created: prev.created.filter(e => e.id !== eventId)
                }));
                toast.success('Event deleted');
            } catch (error) {
                toast.error('Failed to delete event');
            }
        };

        const handleDeletePost = async (postId) => {
            try {
                await postService.deletePost(postId);
                setMyPosts(myPosts.filter(p => p.id !== postId));
                toast.success('Post deleted');
            } catch (error) {
                toast.error('Failed to delete post');
            }
        };

        const handleDeleteGroup = async (groupId) => {
            try {
                await groupService.deleteGroup(groupId);
                setMyGroups(myGroups.filter(g => g.id !== groupId));
                toast.success('Group deleted');
            } catch (error) {
                toast.error('Failed to delete group');
            }
        };

        const tabs = [
            { id: 'favorites', label: 'Favorite Locations', count: favorites.length },
            { id: 'locations', label: 'My Locations', count: myLocations.length },
            { id: 'events', label: 'My Events', count: myEvents.created?.length || 0 },
            { id: 'posts', label: 'My Posts', count: myPosts.length },
            { id: 'groups', label: 'My Groups', count: myGroups.length },
        ];

        if (loading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <LoadingSpinner size="lg" />
                </div>
            );
        }

        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <Link to={`/profile/${user?.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        View Profile
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'favorites' && (
                        <div>
                            {favorites.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No favorites yet</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Start exploring and save your favorite spots!
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {favorites.map((fav) => (
                                        <LocationCard
                                            key={fav.id}
                                            location={fav.location}
                                            isFavorited={true}
                                            onFavoriteToggle={handleFavoriteRemove}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'locations' && (
                        <div>
                            {myLocations.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No locations added yet</p>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">
                                        Share your favorite spots with the community!
                                    </p>
                                    <Link to="/add-location" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Add Location
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {myLocations.map((location) => (
                                        <LocationCard key={location.id} location={location} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div>
                            {(!myEvents.created || myEvents.created.length === 0) ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No events yet</p>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">
                                        Create events or attend community gatherings!
                                    </p>
                                    <Link to="/events/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Create Event
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Events I Created</h3>
                                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
                                        {myEvents.created.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                onDelete={handleDeleteEvent}
                                            />
                                        ))}
                                    </div>

                                    {myEvents.attending && myEvents.attending.length > 0 && (
                                        <>
                                            <h3 className="text-lg font-semibold mb-4">Events I'm Attending</h3>
                                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                {myEvents.attending.map((event) => (
                                                    <EventCard key={event.id} event={event} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'posts' && (
                        <div>
                            {myPosts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No posts yet</p>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">
                                        Share your thoughts with the community!
                                    </p>
                                    <Link to="/community/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Create Post
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myPosts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onDelete={handleDeletePost}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div>
                            {myGroups.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No groups yet</p>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">
                                        Join or create a group to connect with others!
                                    </p>
                                    <Link to="/groups/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Create Group
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myGroups.map((group) => (
                                        <GroupCard
                                            key={group.id}
                                            group={group}
                                            isMember={true}
                                            onDelete={handleDeleteGroup}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    export default Dashboard;
