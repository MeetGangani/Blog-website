import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, getUserBlogs, userAPI } from '../services/api';
import BlogCard from '../components/BlogCard';
import useAuth from '../hooks/useAuth';
import { FiEdit3, FiMail, FiCalendar, FiBookOpen, FiHeart, FiMessageSquare, FiChevronRight, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const UserProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('blogs');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // If no username is provided in URL, use the current user's username
        const targetUsername = username || (user ? user.username : null);
        
        if (!targetUsername) {
          setError('User not found or not logged in');
          setLoading(false);
          return;
        }
        
        const profileData = await getUserProfile(targetUsername);
        setUserProfile(profileData);
        
        const blogsData = await getUserBlogs(profileData._id);
        setUserBlogs(blogsData);

        // Fetch follow status and counts if viewing another user's profile
        if (isAuthenticated && profileData._id !== user._id) {
          try {
            const followStatusResponse = await userAPI.checkFollowing(profileData._id);
            setIsFollowing(followStatusResponse.data.isFollowing);

            const followersResponse = await userAPI.getFollowers(profileData._id);
            setFollowersCount(followersResponse.data.count);

            const followingResponse = await userAPI.getFollowing(profileData._id);
            setFollowingCount(followingResponse.data.count);
          } catch (err) {
            console.error('Error fetching follow data:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, user, isAuthenticated]);

  useEffect(() => {
    const syncFollowStatus = async () => {
      if (isAuthenticated && userProfile && user && userProfile._id !== user._id) {
        try {
          const followStatusResponse = await userAPI.checkFollowing(userProfile._id);
          console.log('Syncing follow status:', {
            isFollowing: followStatusResponse.data.isFollowing,
            userId: userProfile._id
          });
          setIsFollowing(followStatusResponse.data.isFollowing);
        } catch (err) {
          console.error('Error syncing follow status:', err);
        }
      }
    };

    syncFollowStatus();
  }, [isAuthenticated, userProfile, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }

    if (!userProfile || !user) {
      toast.error('Unable to update follow status');
      return;
    }

    try {
      console.log('Attempting to follow/unfollow user:', {
        userId: userProfile._id,
        isFollowing,
        currentUser: user._id
      });

      // Store current state to prevent race conditions
      const wasFollowing = isFollowing;

      // Optimistically update UI
      setIsFollowing(!wasFollowing);
      setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);

      if (wasFollowing) {
        const response = await userAPI.unfollowUser(userProfile._id);
        console.log('Unfollow response:', response.data);
        
        if (!response.data.success) {
          // Revert optimistic update if failed
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
          throw new Error(response.data.message || 'Failed to unfollow user');
        }
        
        toast.success(`Unfollowed ${userProfile.username}`);
      } else {
        const response = await userAPI.followUser(userProfile._id);
        console.log('Follow response:', response.data);
        
        if (!response.data.success) {
          // Revert optimistic update if failed
          setIsFollowing(false);
          setFollowersCount(prev => prev - 1);
          throw new Error(response.data.message || 'Failed to follow user');
        }
        
        toast.success(`Following ${userProfile.username}`);
      }

      // Sync the follow status after the action
      const followStatusResponse = await userAPI.checkFollowing(userProfile._id);
      console.log('Follow status sync:', followStatusResponse.data);
      
      if (followStatusResponse.data.isFollowing !== !wasFollowing) {
        // If the server state doesn't match what we expect, update UI to match server
        setIsFollowing(followStatusResponse.data.isFollowing);
        setFollowersCount(prev => followStatusResponse.data.isFollowing ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      
      // Sync the follow status in case of error
      try {
        const followStatusResponse = await userAPI.checkFollowing(userProfile._id);
        setIsFollowing(followStatusResponse.data.isFollowing);
        // Update followers count based on actual status
        const followersResponse = await userAPI.getFollowers(userProfile._id);
        setFollowersCount(followersResponse.data.count);
      } catch (syncError) {
        console.error('Error syncing follow status after error:', syncError);
      }
      
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center p-8 rounded-xl shadow-soft bg-white border border-neutral-100">
          <h2 className="text-2xl font-bold text-neutral-800 mb-3">Oops!</h2>
          <p className="text-lg text-neutral-600 mb-6">{error || 'User not found'}</p>
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user._id === userProfile._id;
  
  // Format date functions
  const formatJoinDate = (dateString) => {
    const options = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Computed stats
  const stats = [
    { label: 'Blogs', value: userBlogs.length, icon: <FiBookOpen size={18} /> },
    { label: 'Likes', value: userBlogs.reduce((sum, blog) => sum + (blog.likesCount || 0), 0), icon: <FiHeart size={18} /> },
    { label: 'Comments', value: userBlogs.reduce((sum, blog) => sum + (blog.commentsCount || 0), 0), icon: <FiMessageSquare size={18} /> },
    { label: 'Followers', value: followersCount, icon: <FiUserPlus size={18} /> },
    { label: 'Following', value: followingCount, icon: <FiUserCheck size={18} /> }
  ];

  // Get user initials for avatar placeholder
  const getUserInitials = () => {
    const name = userProfile.username || '';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0yOS41IDQ3LjVoMXYxaC0xek0yOS41IDQyLjVoMXY0aC0xek0yOS41IDM3LjVoMXY0aC0xek0zNC41IDQ3LjVoMXYxaC0xek0zNC41IDQyLjVoMXY0aC0xek0zNC41IDM3LjVoMXY0aC0xek0zOS41IDQ3LjVoMXYxaC0xek0zOS41IDQyLjVoMXY0aC0xek0zOS41IDM3LjVoMXY0aC0xek0yNC41IDQ3LjVoMXYxaC0xek0yNC41IDQyLjVoMXY0aC0xek0yNC41IDM3LjVoMXY0aC0xek0xOS41IDQ3LjVoMXYxaC0xek0xOS41IDQyLjVoMXY0aC0xek0xOS41IDM3LjVoMXY0aC0xeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Profile Picture */}
            <div className="relative">
              {userProfile.profilePicture ? (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white/50 shadow-lg">
                  <img 
                    src={userProfile.profilePicture} 
                    alt={userProfile.username} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white border-4 border-white/50 shadow-lg">
                  {getUserInitials()}
                </div>
              )}
              
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-neutral-50 transition-colors text-primary-600"
                >
                  <FiEdit3 size={18} />
                </Link>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="text-white text-center md:text-left flex-grow">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">{userProfile.username}</h1>
                {!isOwnProfile && isAuthenticated && (
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-full border ${
                      isFollowing
                        ? 'bg-white/10 border-white/50 hover:bg-white/20'
                        : 'bg-white text-primary-600 hover:bg-neutral-100'
                    } transition-all flex items-center gap-2`}
                  >
                    {isFollowing ? (
                      <>
                        <FiUserCheck size={18} />
                        Following
                      </>
                    ) : (
                      <>
                        <FiUserPlus size={18} />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-sm text-white/90">
                {userProfile.email && (
                  <div className="flex items-center">
                    <FiMail className="mr-1" />
                    <span>{userProfile.email}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <FiCalendar className="mr-1" />
                  <span>Joined {formatJoinDate(userProfile.createdAt)}</span>
                </div>
              </div>
              
              {userProfile.bio && (
                <p className="text-white/85 max-w-2xl mb-6">{userProfile.bio}</p>
              )}
              
              {isOwnProfile && (
                <div className="hidden md:block">
                  <Link 
                    to="/profile/edit" 
                    className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
                  >
                    <FiEdit3 className="mr-2" /> Edit Profile
                  </Link>
                </div>
              )}
            </div>
            
            {/* Stats - Now positioned to the right */}
            <div className="hidden md:block self-center">
              <div className="flex space-x-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="bg-white/20 rounded-full p-3 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white leading-tight">{stat.value}</div>
                    <div className="text-xs font-medium text-white/90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Stats - Only shown on mobile */}
        <div className="md:hidden bg-white/10 backdrop-blur-sm border-t border-white/20 py-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-around">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="bg-white/20 rounded-full p-2 mx-auto w-10 h-10 flex items-center justify-center mb-1">
                    {stat.icon}
                  </div>
                  <div className="text-xl font-bold text-white leading-tight">{stat.value}</div>
                  <div className="text-xs font-medium text-white/90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-soft rounded-xl overflow-hidden max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex border-b border-neutral-100">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-3 font-medium text-sm flex items-center ${
                activeTab === 'blogs'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <FiBookOpen className="mr-2" />
              {isOwnProfile ? 'My Blogs' : `${userProfile.username}'s Blogs`}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'blogs' && (
              <>
                {userBlogs.length === 0 ? (
                  <div className="text-center py-10 bg-neutral-50/50 rounded-lg">
                    <FiBookOpen className="mx-auto h-12 w-12 text-neutral-300" />
                    <h3 className="mt-4 text-lg font-medium text-neutral-800">No blogs yet</h3>
                    <p className="mt-2 text-neutral-500">
                      {isOwnProfile
                        ? "You haven't published any blogs yet."
                        : `${userProfile.username} hasn't published any blogs yet.`}
                    </p>
                    {isOwnProfile && (
                      <Link
                        to="/create-blog"
                        className="mt-6 inline-flex items-center btn btn-primary"
                      >
                        Create Your First Blog <FiChevronRight className="ml-1" size={16} />
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBlogs.map(blog => (
                      <BlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 