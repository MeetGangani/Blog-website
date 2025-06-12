import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-8">
          {/* Brand/Logo Section */}
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="flex items-center mb-5">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-300 text-transparent bg-clip-text">
                Penfolio
              </span>
            </Link>
            <p className="text-neutral-300 mb-4 max-w-md">
              A vibrant platform for professionals and enthusiasts to share insights, expertise, and stories.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Twitter" className="text-neutral-400 hover:text-white transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="text-neutral-400 hover:text-white transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-neutral-400 hover:text-white transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-neutral-400 hover:text-white transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-neutral-300 hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <Link to="/create-blog" className="text-neutral-300 hover:text-white transition-colors">
                    Create Blog
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/register" className="text-neutral-300 hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
              )}
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blogs?category=Technology" className="text-neutral-300 hover:text-white transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/blogs?category=Business" className="text-neutral-300 hover:text-white transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/blogs?category=Lifestyle" className="text-neutral-300 hover:text-white transition-colors">
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link to="/blogs?category=Health" className="text-neutral-300 hover:text-white transition-colors">
                  Health & Wellness
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-neutral-300">
                <FiMail className="mr-2 text-neutral-400" />
                <a href="mailto:contact@penfolio.com" className="hover:text-white transition-colors">
                  contact@penfolio.com
                </a>
              </li>
              <li className="flex items-center text-neutral-300">
                <FiPhone className="mr-2 text-neutral-400" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center text-neutral-300">
                <FiMapPin className="mr-2 text-neutral-400" />
                <span>123 Blog Street, Content City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-neutral-700 text-neutral-400 text-sm flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Penfolio. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 