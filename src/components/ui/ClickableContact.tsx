import React, { useState } from 'react';
import { Copy, Check, Mail, Phone, MapPin } from 'lucide-react';

interface ClickableContactProps {
  type: 'email' | 'phone' | 'address';
  value: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ClickableContact: React.FC<ClickableContactProps> = ({
  type,
  value,
  href,
  className = '',
  children
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'address':
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getHref = () => {
    if (href) return href;
    
    switch (type) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value.replace(/\s/g, '')}`;
      case 'address':
        return `https://maps.google.com/?q=${encodeURIComponent(value)}`;
      default:
        return '#';
    }
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const displayText = children || value;

  return (
    <div className="relative inline-block">
      <a
        href={getHref()}
        className={`inline-flex items-center gap-2 text-sm transition-colors hover:text-pink-400 cursor-pointer ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={copyToClipboard}
        title="Click to copy"
      >
        {getIcon()}
        <span>{displayText}</span>
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50">
          {copied ? (
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Copied!
            </div>
          ) : (
            'Click to copy'
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};
