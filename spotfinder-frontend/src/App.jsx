import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/common/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddLocation from './pages/AddLocation';
import LocationDetailPage from './pages/LocationDetailPage';
import Dashboard from './pages/Dashboard';

// Community features
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import CreateGroupPage from './pages/CreateGroupPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

import './App.css';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="app-layout">
        <div className="app-bg" aria-hidden="true" />
        <Router>
          <div className="relative z-10 min-h-screen">
            <Routes>
              {/* Public routes without header */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Routes with header */}
              <Route
                path="/*"
                element={
                  <>
                    <Header />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/location/:id" element={<LocationDetailPage />} />

                      {/* Events */}
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/events/:id" element={<EventDetailPage />} />
                      <Route
                        path="/events/create"
                        element={
                          <ProtectedRoute>
                            <CreateEventPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Community/Posts */}
                      <Route path="/community" element={<CommunityPage />} />
                      <Route path="/community/:id" element={<PostDetailPage />} />
                      <Route
                        path="/community/create"
                        element={
                          <ProtectedRoute>
                            <CreatePostPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Groups */}
                      <Route path="/groups" element={<GroupsPage />} />
                      <Route path="/groups/:id" element={<GroupDetailPage />} />
                      <Route
                        path="/groups/create"
                        element={
                          <ProtectedRoute>
                            <CreateGroupPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Profile */}
                      <Route
                        path="/profile/:userId"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected routes */}
                      <Route
                        path="/add-location"
                        element={
                          <ProtectedRoute>
                            <AddLocation />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* 404 redirect */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </>
                }
              />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;
