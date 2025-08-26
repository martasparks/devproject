'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DynamicIcon from './DynamicIcon';

interface TopBarLink {
  id: number;
  title: string;
  url: string;
  icon?: string | null;
  isActive: boolean;
  order: number;
}

export default function TopBarLinks() {
  const [links, setLinks] = useState<TopBarLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/topbar-links');
        const data = await response.json();
        setLinks(data.links || []);
      } catch (error) {
        console.error('Error fetching topbar links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  if (loading) {
    return (
      <div className="flex space-x-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return null;
  }

  return (
    <>
      {links.map((link: TopBarLink) => (
        <Link
          key={link.id}
          href={link.url}
          className="flex items-center space-x-2 md:space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <DynamicIcon iconName={link.icon} />
          <span>{link.title}</span>
        </Link>
      ))}
    </>
  );
}