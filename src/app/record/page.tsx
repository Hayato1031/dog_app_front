'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import DailyDoseRecord from '@/components/DailyDoseRecord';

export default function RecordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const paramDate = new Date(dateParam);
      if (!isNaN(paramDate.getTime())) {
        setSelectedDate(paramDate);
      }
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }


  return (
    <div className="min-h-screen pb-20">
      <Header title="服薬記録" showBack />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex justify-center">
            <Link
              href="/calendar"
              className="warm-button flex items-center space-x-2 px-6 py-3"
            >
              <Calendar size={20} />
              <span>カレンダーで確認</span>
            </Link>
          </div>

          {/* Daily Record */}
          <DailyDoseRecord 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </main>
    </div>
  );
}