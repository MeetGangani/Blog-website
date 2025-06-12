import { useState, useEffect } from 'react';
import { Link, useLocation, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiMenu, FiX, FiUser, FiLogOut, FiEdit, FiHome, FiSearch, FiBook } from 'react-icons/fi';
import { BiSolidDashboard } from 'react-icons/bi';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Active link style
  const activeStyle = "text-primary-600 font-semibold";
  const inactiveStyle = "text-neutral-600 hover:text-primary-600 transition-colors";

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-soft'
          : 'bg-white/70 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="brand-logo text-3xl bg-gradient-to-r from-primary-600 to-secondary-500 text-transparent bg-clip-text">
                Penfolio
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `px-1 py-1 text-sm font-medium border-b-2 ${
                    isActive ? 'border-primary-500 ' + activeStyle : 'border-transparent ' + inactiveStyle
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/blogs" 
                className={({ isActive }) => 
                  `px-1 py-1 text-sm font-medium border-b-2 ${
                    isActive ? 'border-primary-500 ' + activeStyle : 'border-transparent ' + inactiveStyle
                  }`
                }
              >
                Blogs
              </NavLink>
              <div className="relative">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-3 py-1.5 w-40 transition-all focus:w-56 rounded-full text-sm border border-neutral-200 focus:border-primary-300 bg-white/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FiSearch className="absolute left-3 text-neutral-400" />
                </form>
              </div>
            </div>
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-100 group-hover:bg-neutral-100 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-primary-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{user.username}</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-soft border border-neutral-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform group-hover:translate-y-0 translate-y-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
                  >
                    <FiUser className="mr-3 text-neutral-400" /> Profile
                  </Link>
                  <Link
                    to="/create-blog"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
                  >
                    <FiEdit className="mr-3 text-neutral-400" /> Create Blog
                  </Link>
                  <Link
                    to="/liked-blogs"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Liked Blogs
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
                    >
                      <BiSolidDashboard className="mr-3 text-neutral-400" /> Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-neutral-100 my-1"></div>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent-600 flex items-center"
                  >
                    <FiLogOut className="mr-3 text-neutral-400" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-neutral-700 hover:text-primary-600"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 shadow-lg">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
          >
            <FiHome className="mr-3 text-neutral-400" /> Home
          </Link>
          <Link
            to="/blogs"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
          >
            <FiBook className="mr-3 text-neutral-400" /> Blogs
          </Link>
          <form onSubmit={handleSearch} className="px-3 py-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border border-neutral-200 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-2.5 text-neutral-400" />
            </div>
          </form>
          {isAuthenticated ? (
            <>
              <div className="border-t border-neutral-100 my-2"></div>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
              >
                <FiUser className="mr-3 text-neutral-400" /> Profile
              </Link>
              <Link
                to="/create-blog"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
              >
                <FiEdit className="mr-3 text-neutral-400" /> Create Blog
              </Link>
              <Link
                to="/liked-blogs"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Liked Blogs
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 flex items-center"
                >
                  <BiSolidDashboard className="mr-3 text-neutral-400" /> Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-accent-600 flex items-center"
              >
                <FiLogOut className="mr-3 text-neutral-400" /> Logout
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-neutral-100 my-2"></div>
              <div className="px-3 py-2 flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="w-full py-2 text-center rounded-md text-base font-medium text-primary-600 border border-primary-500 hover:bg-primary-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2 text-center rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 