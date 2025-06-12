import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiTrendingUp, FiLayout, FiMessageCircle, FiHeart, FiZap, FiEdit } from 'react-icons/fi';
import BlogCard from '../components/BlogCard';
import { blogsAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
// Import homepage image
import homepageImage from '../assets/homepageimg.png';

// Add CSS for animations
const animations = `
@keyframes float {
  0% {
    transform: translateY(0px) rotate(2deg);
  }
  50% {
    transform: translateY(-15px) rotate(0deg);
  }
  100% {
    transform: translateY(0px) rotate(2deg);
  }
}
.floating-image {
  animation: float 6s ease-in-out infinite;
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

/* Special style for hero title with subtle highlight */
.hero-headline {
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative;
}

.highlight-text {
  position: relative;
}

.highlight-text::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.15));
  z-index: -1;
}
`;

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'Technology', icon: <FiZap /> },
    { name: 'Lifestyle', icon: <FiHeart /> },
    { name: 'Business', icon: <FiTrendingUp /> },
    { name: 'Travel', icon: <FiLayout /> },
    { name: 'Health', icon: <FiBookOpen /> },
    { name: 'Food', icon: <FiMessageCircle /> }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add the animation styles when component mounts
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animations;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        
        // Get latest blogs (most recent 3)
        const latestResponse = await blogsAPI.getAllBlogs({ page: 1, limit: 3, sort: '-createdAt' });
        setLatestBlogs(latestResponse.data.blogs || []);
        
        // Get featured blogs (top 3 most liked)
        const featuredResponse = await blogsAPI.getAllBlogs({ page: 1, limit: 3, sort: '-likesCount' });
        setFeaturedBlogs(featuredResponse.data.blogs || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading content..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Oops!</h2>
        <p className="text-neutral-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-primary-700 via-primary-600 to-secondary-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0yOS41IDQ3LjVoMXYxaC0xek0yOS41IDQyLjVoMXY0aC0xek0yOS41IDM3LjVoMXY0aC0xek0zNC41IDQ3LjVoMXYxaC0xek0zNC41IDQyLjVoMXY0aC0xek0zNC41IDM3LjVoMXY0aC0xek0zOS41IDQ3LjVoMXYxaC0xek0zOS41IDQyLjVoMXY0aC0xek0zOS41IDM3LjVoMXY0aC0xek0yNC41IDQ3LjVoMXYxaC0xek0yNC41IDQyLjVoMXY0aC0xek0yNC41IDM3LjVoMXY0aC0xek0xOS41IDQ3LjVoMXYxaC0xek0xOS41IDQyLjVoMXY0aC0xek0xOS41IDM3LjVoMXY0aC0xeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-left max-w-2xl mb-10 md:mb-0">
              <h1 className="hero-headline text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Express Your <span className="highlight-text">Ideas</span> with Elegance
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-xl">
                A modern platform where professionals share their expertise and create impactful content.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/blogs"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg bg-white text-primary-700 hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
                >
                  Explore Blogs <FiArrowRight className="ml-2" />
                </Link>
                
                {isAuthenticated ? (
                  <Link
                    to="/create-blog"
                    className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-lg bg-transparent text-white hover:bg-white/10 transition-all"
                  >
                    <FiEdit className="mr-2" /> Create Blog
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-lg bg-transparent text-white hover:bg-white/10 transition-all"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden lg:block relative w-full max-w-md">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
              
              {/* Enhanced 3D image display */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-300/20 to-secondary-300/20 rounded-2xl blur-xl transform scale-105"></div>
                <div className="relative bg-transparent rounded-2xl overflow-hidden perspective-1000 floating-image">
                  <img 
                    src={homepageImage} 
                    alt="Digital blog notebook" 
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    style={{ 
                      filter: 'drop-shadow(0 20px 13px rgba(0, 0, 0, 0.2))',
                      transform: 'translateZ(20px)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-16 bg-white">
          <svg
            className="absolute -top-px left-0 w-full text-white fill-current"
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
          >
            <path d="M0 48h1440V0C1160 20 720 48 480 48 240 48 0 20 0 0z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary-600">500+</p>
              <p className="text-neutral-600 mt-1">Blogs Published</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary-600">10k+</p>
              <p className="text-neutral-600 mt-1">Monthly Readers</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary-600">250+</p>
              <p className="text-neutral-600 mt-1">Authors</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary-600">20+</p>
              <p className="text-neutral-600 mt-1">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Explore Categories
            </h2>
            <p className="text-neutral-600">
              Discover content tailored to your interests across a variety of topics
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/blogs?category=${category.name}`}
                className="group bg-white rounded-xl shadow-soft border border-neutral-100 p-6 text-center hover:shadow-hover hover:border-primary-100 transition-all duration-300 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-500 text-xl mb-4 transition-colors">
                  {category.icon}
                </div>
                <h3 className="font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Featured Blogs
            </h2>
            <p className="text-neutral-600">
              Highlighting exceptional content from our top writers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredBlogs.length > 0 ? (
              featuredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))
            ) : (
              <p className="col-span-full text-center text-neutral-600">No featured blogs available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
                Latest Blogs
              </h2>
              <p className="text-neutral-600">Fresh insights and stories from our community</p>
            </div>
            <Link
              to="/blogs"
              className="mt-4 md:mt-0 btn btn-primary flex items-center"
            >
              View all <FiArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {latestBlogs.length > 0 ? (
              latestBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))
            ) : (
              <p className="col-span-full text-center text-neutral-600">No blogs available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0yOS41IDQ3LjVoMXYxaC0xek0yOS41IDQyLjVoMXY0aC0xek0yOS41IDM3LjVoMXY0aC0xek0zNC41IDQ3LjVoMXYxaC0xek0zNC41IDQyLjVoMXY0aC0xek0zNC41IDM3LjVoMXY0aC0xek0zOS41IDQ3LjVoMXYxaC0xek0zOS41IDQyLjVoMXY0aC0xek0zOS41IDM3LjVoMXY0aC0xek0yNC41IDQ3LjVoMXYxaC0xek0yNC41IDQyLjVoMXY0aC0xek0yNC41IDM3LjVoMXY0aC0xek0xOS41IDQ3LjVoMXYxaC0xek0xOS41IDQyLjVoMXY0aC0xek0xOS41IDM3LjVoMXY0aC0xeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to share your <span className="highlight-text">expertise</span>?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Create a new blog post and share your knowledge with our growing community of readers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/create-blog"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg bg-white text-primary-700 hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
                >
                  <FiEdit className="mr-2" /> Create New Blog
                </Link>
                <Link
                  to="/blogs"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-lg bg-transparent text-white hover:bg-white/10 transition-all"
                >
                  Browse Blogs
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to share your <span className="highlight-text">story</span>?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join our community of creators and start sharing your expertise with readers around the world.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg bg-white text-primary-700 hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
                >
                  Create Account
                </Link>
                <Link
                  to="/blogs"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-lg bg-transparent text-white hover:bg-white/10 transition-all"
                >
                  Explore Blogs
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 