'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, Heart, Home, FileText, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title = 'よっつのおくすり日記', showBack = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsMenuOpen(false);
  };

  const menuItems = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: '今日の記録', href: '/record', icon: FileText },
    { name: 'カレンダー', href: '/calendar', icon: Calendar },
    { name: '愛犬の健康', href: '/health', icon: Heart },
  ];

  return (
    <header className="warm-card sticky top-0 z-40 border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
              >
                ←
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Heart size={28} className="text-red-500" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center text-orange-700 bg-orange-50 px-3 py-2 rounded-full">
                  <Heart size={18} className="mr-2 text-red-500" />
                  <span className="font-medium">{user.name}さん</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 warm-card border-t-2 border-orange-200 shadow-lg">
            <div className="px-4 py-3">
              {user && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-orange-50 rounded-lg">
                  <Heart size={20} className="text-red-500" />
                  <span className="font-medium text-orange-800">{user.name}さん</span>
                </div>
              )}
              
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg text-orange-700 hover:bg-orange-50 transition-colors"
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  );
                })}
                
                <hr className="border-orange-200 my-2" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">ログアウト</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}