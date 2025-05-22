import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center">
              <span className="brand-logo text-3xl bg-gradient-to-r from-primary-600 to-secondary-500 text-transparent bg-clip-text">
                Penfolio
              </span>
            </Link>
            <p className="mt-4 text-sm text-neutral-600">
              A premium blogging platform for professionals that brings ideas to life with elegant design and powerful features.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-800 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-800 tracking-wider uppercase mb-4">
              Categories
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blogs?category=Technology" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/blogs?category=Lifestyle" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link to="/blogs?category=Business" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/blogs?category=Health" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-800 tracking-wider uppercase mb-4">
              Subscribe to our newsletter
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Get the latest posts delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 bg-white"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Penfolio. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link to="/privacy" className="text-xs text-neutral-500 hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs text-neutral-500 hover:text-primary-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-xs text-neutral-500 hover:text-primary-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 