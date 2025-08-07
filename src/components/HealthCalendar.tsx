'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Stethoscope, Heart } from 'lucide-react';
import { HealthCalendarData } from '@/types';
import { healthRecordAPI } from '@/lib/api';

interface HealthCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export default function HealthCalendar({ onDateSelect, selectedDate }: HealthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<HealthCalendarData>({});
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = async (date: Date) => {
    setLoading(true);
    try {
      const response = await healthRecordAPI.getCalendar(
        date.getFullYear(),
        date.getMonth() + 1
      );
      setCalendarData(response.calendar_data || {});
    } catch (error) {
      console.error('健康カレンダーデータの取得に失敗しました:', error);
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

  const getConditionColor = (condition?: number) => {
    if (!condition) return 'bg-gray-100';
    switch (condition) {
      case 1: return 'bg-red-200';
      case 2: return 'bg-orange-200';
      case 3: return 'bg-yellow-200';
      case 4: return 'bg-green-200';
      case 5: return 'bg-green-300';
      default: return 'bg-gray-100';
    }
  };

  const getAppetiteColor = (appetite?: number) => {
    if (!appetite) return 'bg-gray-100';
    switch (appetite) {
      case 1: return 'bg-red-200';
      case 2: return 'bg-orange-200';
      case 3: return 'bg-yellow-200';
      case 4: return 'bg-pink-200';
      case 5: return 'bg-pink-300';
      default: return 'bg-gray-100';
    }
  };

  const getImportanceBorder = (importance?: number) => {
    switch (importance) {
      case 2: return 'border-yellow-400 border-2';
      case 3: return 'border-red-400 border-2';
      default: return 'border-orange-200';
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
              <Heart size={24} className="text-red-500" />
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
                className={`aspect-square border rounded-lg p-0.5 sm:p-1 cursor-pointer transition-colors min-h-[45px] sm:min-h-[60px] ${
                  isSelected
                    ? 'border-orange-500 bg-orange-100'
                    : isToday
                    ? 'border-orange-300 bg-orange-50'
                    : dayData?.has_record
                    ? getImportanceBorder(dayData.importance)
                    : 'border-orange-200'
                } hover:bg-orange-50 ${!isCurrentMonth ? 'opacity-30' : ''}`}
                onClick={() => onDateSelect && onDateSelect(day)}
              >
                <div className="h-full flex flex-col">
                  <div className="text-xs sm:text-xs text-orange-900 mb-1 font-medium flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs">{format(day, 'd')}</span>
                    {dayData?.is_hospital_day && (
                      <Stethoscope size={8} className="text-blue-600 sm:hidden" />
                    )}
                    {dayData?.is_hospital_day && (
                      <Stethoscope size={10} className="text-blue-600 hidden sm:block" />
                    )}
                  </div>
                  
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-200 rounded animate-pulse"></div>
                    </div>
                  ) : dayData?.has_record ? (
                    <div className="flex-1 space-y-0.5 sm:space-y-1">
                      {/* Condition indicator */}
                      {dayData.condition && (
                        <div className={`h-1.5 sm:h-2 rounded-full ${getConditionColor(dayData.condition)}`} 
                             title={`体調: ${dayData.condition}/5`} />
                      )}
                      
                      {/* Appetite indicator */}
                      {dayData.appetite && (
                        <div className={`h-1.5 sm:h-2 rounded-full ${getAppetiteColor(dayData.appetite)}`}
                             title={`食欲: ${dayData.appetite}/5`} />
                      )}

                      {/* Notes indicator */}
                      {dayData.notes && (
                        <div className="text-center">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mx-auto" title="メモあり" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-xs sm:text-sm text-orange-300">-</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-4">
          <div className="text-sm">
            <h4 className="font-bold text-orange-800 mb-2">体調</h4>
            <div className="flex justify-between text-xs text-orange-600">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-red-200 rounded"></div>
                <span>1</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-orange-200 rounded"></div>
                <span>2</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-yellow-200 rounded"></div>
                <span>3</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-green-200 rounded"></div>
                <span>4</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-green-300 rounded"></div>
                <span>5</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm">
            <h4 className="font-bold text-orange-800 mb-2">食欲</h4>
            <div className="flex justify-between text-xs text-orange-600">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-red-200 rounded"></div>
                <span>1</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-orange-200 rounded"></div>
                <span>2</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-yellow-200 rounded"></div>
                <span>3</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-pink-200 rounded"></div>
                <span>4</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-pink-300 rounded"></div>
                <span>5</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Stethoscope size={16} className="text-blue-600" />
              <span className="text-orange-700">病院日</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
              <span className="text-orange-700">重要度:中</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-red-400 rounded"></div>
              <span className="text-orange-700">重要度:高</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}