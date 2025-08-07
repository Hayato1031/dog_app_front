'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';

export default function CalendarPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }


  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    router.push(`/record?date=${date.toISOString().split('T')[0]}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="服薬カレンダー" showBack />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex justify-center">
            <Link
              href="/record"
              className="warm-button flex items-center space-x-2 px-6 py-3"
            >
              <FileText size={20} />
              <span>今日の記録を入力</span>
            </Link>
          </div>

          {/* Calendar */}
          <Calendar 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          {/* Instructions */}
          <div className="warm-card p-4">
            <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center space-x-2">
              <FileText size={16} />
              <span>使い方</span>
            </h3>
            <ul className="text-sm text-orange-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-orange-600 font-medium">•</span>
                <span>日付をクリックすると、その日の記録ページに移動します</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">○</span>
                <span>すべての薬を予定通り服用</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-600 font-bold">△</span>
                <span>一部の薬のみ服用</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-600 font-bold">×</span>
                <span>薬を服用していない</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}