import { FolderIcon } from '@heroicons/react/24/outline';

interface CategoryPlaceholderProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function CategoryPlaceholder({ 
  name, 
  className = '', 
  size = 'md',
  showIcon = true 
}: CategoryPlaceholderProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const containerSizes = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400 rounded-full blur-sm"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-400 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-purple-400 rounded-full blur-sm"></div>
      </div>
      
      <div className={`text-center ${containerSizes[size]} relative z-10`}>
        {showIcon && (
          <div className={`${iconSizes[size]} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <FolderIcon className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
          </div>
        )}
        <p className={`${textSizes[size]} text-gray-700 font-medium leading-tight max-w-full break-words`}>
          {name}
        </p>
      </div>
    </div>
  );
}
