'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronDownIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import DynamicIcon from '../../[locale]/components/DynamicIcon';

interface AdminTopBarLink {
  id: number;
  title: string;
  url: string;
  icon?: string | null;
  isActive: boolean;
  order: number;
}

interface AdminTopBarProps {
  links: AdminTopBarLink[];
}


export default function AdminTopBar({ links }: AdminTopBarProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/' });
  };

  const handleBackToSite = () => {
    router.push('/');
  };

  return (
    <div className="bg-gray-800 text-white border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-12 text-sm">
          {/* Left side - Admin quick links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={handleBackToSite}
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Atpakaļ uz vietni</span>
            </button>
            
            {links.length > 0 && <div className="h-4 w-px bg-gray-600"></div>}
            
            {links
              .filter(link => link.isActive)
              .map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                >
                  <DynamicIcon iconName={link.icon} />
                  <span>{link.title}</span>
                </Link>
              ))}
          </div>

          {/* Right side - Admin info & User menu */}
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-400">
              Admin panelis
            </div>
            
            <div className="h-4 w-px bg-gray-600"></div>

            {/* User Menu */}
            {session?.user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="w-6 h-6 rounded-full border border-gray-600"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                  <span className="max-w-32 truncate">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDownIcon className="w-3 h-3" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                        {session.user.role} lietotājs
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 mr-3" />
                        Mans profils
                      </Link>
                      
                      <button
                        onClick={handleBackToSite}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <HomeIcon className="w-4 h-4 mr-3" />
                        Vietnes priekšpuse
                      </button>
                      
                      <div className="border-t border-gray-100"></div>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Izlogoties
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}