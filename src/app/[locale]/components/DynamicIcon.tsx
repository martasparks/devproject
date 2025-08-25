'use client';

import { useEffect, useState } from 'react';
import * as HeroiconsOutline from '@heroicons/react/24/outline';

interface DynamicIconProps {
  iconName?: string | null;
  className?: string;
}

export default function DynamicIcon({ iconName, className = "w-5 h-5" }: DynamicIconProps) {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<React.SVGProps<SVGSVGElement>> | null>(null);

  useEffect(() => {
    if (!iconName) {
      setIconComponent(null);
      return;
    }

    // Try to get the icon from heroicons
    const icon = (HeroiconsOutline as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[iconName];
    if (icon) {
      setIconComponent(() => icon);
    } else {
      setIconComponent(null);
    }
  }, [iconName]);

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} />;
}