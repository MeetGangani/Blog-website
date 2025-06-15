import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiUser, FiLogOut, FiSettings, FiPlusCircle } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            BlogApp
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/blogs" className="text-neutral-600 hover:text-neutral-800">
              Blogs
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/create-blog" className="text-neutral-600 hover:text-neutral-800">
                  Write
                </Link>
                <Link to="/liked" className="text-neutral-600 hover:text-neutral-800">
                  Liked Blogs
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-800">
                    <img
                      src={user.profilePicture || 'https://via.placeholder.com/32'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        to={`/profile/${user.username}`}
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <FiUser className="mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/create-blog"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <FiPlusCircle className="mr-2" />
                        Create Blog
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <FiSettings className="mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                      >
                        <FiLogOut className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 