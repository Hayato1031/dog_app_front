'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarData } from '@/types';
import { doseRecordAPI } from '@/lib/api';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export default function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = async (date: Date) => {
    setLoading(true);
    try {
      const response = await doseRecordAPI.getCalendar(
        date.getFullYear(),
        date.getMonth() + 1
      );
      setCalendarData(response.calendar_data || {});
    } catch (error) {
      console.error('カレンダーデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [currentDate]);

  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentDate);
    previousMonth.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(previousMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusIcon = (status: '完了' | '一部' | '未実施') => {
    switch (status) {
      case '完了':
        return '○';
      case '一部':
        return '△';
      case '未実施':
      default:
        return '×';
    }
  };

  const getStatusColor = (status: '完了' | '一部' | '未実施') => {
    switch (status) {
      case '完了':
        return 'text-green-600 bg-green-100';
      case '一部':
        return 'text-yellow-600 bg-yellow-100';
      case '未実施':
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getDay(monthStart);
  
  // Create empty cells for days before the month starts
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="warm-card">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-3 hover:bg-orange-100 rounded-full text-orange-600 transition-colors"
            disabled={loading}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CalendarIcon size={24} className="text-orange-600" />
              <h2 className="text-2xl font-bold text-orange-800">
                {format(currentDate, 'yyyy年M月', { locale: ja })}
              </h2>
            </div>
            <button
              onClick={goToToday}
              className="text-sm text-orange-500 hover:text-orange-700 px-3 py-1 bg-orange-50 rounded-full transition-colors"
            >
              今月に戻る
            </button>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-3 hover:bg-orange-100 rounded-full text-orange-600 transition-colors"
            disabled={loading}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* Week headers */}
          {weekDays.map((day) => (
            <div key={day} className="p-1 text-center text-xs sm:text-sm font-medium text-orange-600">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dateString = format(day, 'yyyy-MM-dd');
            const dayData = calendarData[dateString];
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={dateString}
                className={`aspect-square border rounded-lg p-0.5 sm:p-1 cursor-pointer transition-colors min-h-[35px] sm:min-h-[40px] ${
                  isSelected
                    ? 'border-orange-500 bg-orange-100'
                    : isToday
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-orange-200 hover:bg-orange-50'
                } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                onClick={() => onDateSelect && onDateSelect(day)}
              >
                <div className="h-full flex flex-col">
                  <div className="text-[10px] sm:text-xs text-orange-900 mb-0.5 sm:mb-1 font-medium">
                    {format(day, 'd')}
                  </div>
                  
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-200 rounded animate-pulse"></div>
                    </div>
                  ) : dayData ? (
                    <div className="flex-1 flex items-center justify-center">
                      <span
                        className={`text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center ${getStatusColor(
                          dayData.status
                        )}`}
                        title={`${dayData.status} (${dayData.records.length}件の薬)`}
                      >
                        {getStatusIcon(dayData.status)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-sm sm:text-lg text-orange-300">-</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold mr-2">
              ○
            </span>
            <span className="text-orange-700 font-medium">完了</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold mr-2">
              △
            </span>
            <span className="text-orange-700 font-medium">一部</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold mr-2">
              ×
            </span>
            <span className="text-orange-700 font-medium">未実施</span>
          </div>
        </div>
      </div>
    </div>
  );
}