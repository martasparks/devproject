import Link from 'next/link';
import prisma from '@lib/prisma';
import DynamicIcon from './DynamicIcon';

interface TopBarLink {
  id: number;
  title: string;
  url: string;
  icon?: string | null;
  isActive: boolean;
  order: number;
}

export default async function TopBarLinks() {
  const links = await prisma.topBar.findMany({
    where: { isActive: true },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' }
    ]
  });

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