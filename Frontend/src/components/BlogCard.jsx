import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageSquare, FiCalendar, FiUser, FiTag } from 'react-icons/fi';

// Create an array of pleasant color combinations for default covers
const defaultCoverPatterns = [
  {
    bgClass: 'bg-gradient-to-br from-primary-100 to-primary-300',
    patternClass: 'bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[length:12px_12px]',
    textColor: 'text-primary-800'
  },
  {
    bgClass: 'bg-gradient-to-br from-secondary-100 to-secondary-300',
    patternClass: 'bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.6)_0px,rgba(255,255,255,0.6)_2px,transparent_2px,transparent_8px)]',
    textColor: 'text-secondary-800'
  },
  {
    bgClass: 'bg-gradient-to-br from-blue-100 to-blue-200',
    patternClass: 'bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.8)_0px,_transparent_8px)] bg-[length:16px_16px]',
    textColor: 'text-blue-800'
  },
  {
    bgClass: 'bg-gradient-to-br from-green-100 to-green-200',
    patternClass: 'bg-[linear-gradient(rgba(255,255,255,0.8)_1px,_transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:20px_20px]',
    textColor: 'text-green-800'
  },
  {
    bgClass: 'bg-gradient-to-br from-orange-100 to-orange-200',
    patternClass: 'bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.7)_0px,rgba(255,255,255,0.7)_1px,transparent_1px,transparent_10px)]',
    textColor: 'text-orange-800'
  },
  {
    bgClass: 'bg-gradient-to-br from-purple-100 to-purple-200',
    patternClass: 'bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_2px,_transparent_2px)] bg-[length:18px_18px]',
    textColor: 'text-purple-800'
  },
];

const BlogCard = ({ blog }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine a consistent pattern based on blog ID or title
  const getPatternIndex = () => {
    // Use the blog's title or ID to generate a consistent index
    const seed = blog._id || blog.title;
    let sum = 0;
    for (let i = 0; i < seed.length; i++) {
      sum += seed.charCodeAt(i);
    }
    return sum % defaultCoverPatterns.length;
  };

  // Get pattern for this blog
  const pattern = defaultCoverPatterns[getPatternIndex()];

  // Parse date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate content for card display
  const truncateContent = (content, maxLength = 120) => {
    if (!content) return '';
    // Remove HTML tags if content is from rich text editor
    const strippedContent = content.replace(/<[^>]+>/g, '');
    return strippedContent.length > maxLength
      ? `${strippedContent.substring(0, maxLength)}...`
      : strippedContent;
  };

  // Get first letter and second letter for cover placeholder
  const getInitials = () => {
    const title = blog.title || '';
    // Get first character from each word (up to 2)
    const words = title.split(' ');
    if (words.length === 1) {
      return title.substring(0, 2).toUpperCase();
    } else {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-neutral-100 overflow-hidden transform transition-all duration-300 ${
        isHovered ? 'shadow-hover -translate-y-1' : 'shadow-soft'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Blog Image */}
      <Link to={`/blogs/${blog._id}`} className="block overflow-hidden">
        <div className="relative w-full h-52 overflow-hidden">
          {blog.coverImage ? (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-105"
            />
          ) : (
            // Enhanced default cover with patterns
            <div className={`w-full h-full ${pattern.bgClass} ${pattern.patternClass} flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
              <div className={`text-5xl font-bold rounded-full flex items-center justify-center ${pattern.textColor} bg-white/30 w-20 h-20 backdrop-blur-sm`}>
                {getInitials()}
              </div>
              <div className={`text-xs uppercase tracking-wider mt-2 font-semibold ${pattern.textColor} bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm`}>
                {blog.category || 'Blog'}
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/80 backdrop-blur-sm text-primary-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {blog.category}
            </span>
          </div>
        </div>
      </Link>

      {/* Blog Content */}
      <div className="p-6">
        {/* Author info */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mr-3">
            {blog.author?.profilePicture ? (
              <img
                src={blog.author.profilePicture}
                alt={blog.author.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="text-primary-700" />
            )}
          </div>
          <div>
            <Link to={`/user/${blog.author?.username}`} className="text-sm font-medium text-neutral-800 hover:text-primary-700">
              {blog.author?.username || 'Unknown author'}
            </Link>
            <div className="flex items-center text-xs text-neutral-500">
              <FiCalendar className="mr-1 text-neutral-400" size={12} />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <Link to={`/blogs/${blog._id}`}>
          <h3 className="text-xl font-bold text-neutral-800 mb-3 hover:text-primary-700 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
          {truncateContent(blog.content)}
        </p>

        {/* Blog Stats */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100">
          <div className="flex items-center text-neutral-500">
            <FiHeart className={`mr-1 ${blog.isLiked ? 'text-accent-600 fill-current' : ''}`} />
            <span className="text-sm">{blog.likesCount} likes</span>
          </div>
          <div className="flex items-center text-neutral-500">
            <FiMessageSquare className="mr-1" />
            <span className="text-sm">{blog.commentsCount} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;