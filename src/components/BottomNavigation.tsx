'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Calendar, Heart } from 'lucide-react';

const navigationItems = [
  {
    name: 'ホーム',
    href: '/',
    icon: Home,
  },
  {
    name: '今日の記録',
    href: '/record',
    icon: FileText,
  },
  {
    name: 'カレンダー',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: '愛犬の健康',
    href: '/health',
    icon: Heart,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-md mx-auto px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Icon 
                size={24} 
                className={`${isActive ? 'wag-animation' : ''}`}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}