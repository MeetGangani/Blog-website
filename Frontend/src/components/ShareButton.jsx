import React, { useState } from 'react';
import { FiShare2, FiTwitter, FiFacebook, FiLinkedin, FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ShareButton = ({ title, url }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = encodeURIComponent(`${title}\n\n${url}`);

  const socialLinks = [
    {
      name: 'Twitter',
      icon: <FiTwitter size={18} />,
      url: `https://twitter.com/intent/tweet?text=${shareText}`,
      color: 'hover:bg-[#1DA1F2] hover:text-white'
    },
    {
      name: 'Facebook',
      icon: <FiFacebook size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:bg-[#4267B2] hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: <FiLinkedin size={18} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:bg-[#0077B5] hover:text-white'
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (socialUrl) => {
    window.open(socialUrl, '_blank', 'width=550,height=450');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <FiShare2 size={16} />
        Share
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
          <div className="p-2">
            {socialLinks.map((social) => (
              <button
                key={social.name}
                onClick={() => handleShare(social.url)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-md transition-colors ${social.color}`}
              >
                {social.icon}
                {social.name}
              </button>
            ))}
            
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              {copied ? <FiCheck size={18} className="text-green-500" /> : <FiCopy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton; 