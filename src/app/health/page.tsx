'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  Heart, 
  Activity, 
  Calendar, 
  ArrowLeft,
  ArrowRight,
  Star,
  Stethoscope,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import HealthCalendar from '@/components/HealthCalendar';
import { healthRecordAPI } from '@/lib/api';
import { HealthRecord, ImportantRecordsResponse } from '@/types';

export default function HealthPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [condition, setCondition] = useState<number | undefined>(undefined);
  const [appetite, setAppetite] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [importance, setImportance] = useState(1);
  const [isHospitalDay, setIsHospitalDay] = useState(false);
  const [importantRecords, setImportantRecords] = useState<ImportantRecordsResponse | null>(null);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'record' | 'calendar'>('record');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch health record for selected date
  const fetchHealthRecord = async (date: Date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const records = await healthRecordAPI.getAll(dateString);
      
      if (records.length > 0) {
        const record = records[0];
        setHealthRecord(record);
        setCondition(record.condition);
        setAppetite(record.appetite);
        setNotes(record.notes || '');
        setImportance(record.importance);
        setIsHospitalDay(record.is_hospital_day);
      } else {
        setHealthRecord(null);
        setCondition(undefined);
        setAppetite(undefined);
        setNotes('');
        setImportance(1);
        setIsHospitalDay(false);
      }
    } catch (error) {
      console.error('健康記録の取得に失敗しました:', error);
    }
  };

  // Fetch important records between hospital visits
  const fetchImportantRecords = async () => {
    try {
      const response = await healthRecordAPI.getImportantBetweenHospitalVisits();
      setImportantRecords(response);
    } catch (error) {
      console.error('重要な記録の取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHealthRecord(selectedDate);
      fetchImportantRecords();
    }
  }, [selectedDate, isAuthenticated]);

  const handleSaveRecord = async () => {
    setIsRecordLoading(true);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const recordData = {
        date: dateString,
        condition,
        appetite,
        notes,
        importance,
        is_hospital_day: isHospitalDay,
      };

      if (healthRecord) {
        await healthRecordAPI.update(healthRecord.id, recordData);
      } else {
        await healthRecordAPI.create(recordData);
      }

      await fetchHealthRecord(selectedDate);
      await fetchImportantRecords();
      alert('記録を保存しました！');
    } catch (error) {
      console.error('記録の保存に失敗しました:', error);
      alert('記録の保存に失敗しました');
    } finally {
      setIsRecordLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getConditionText = (value?: number) => {
    switch (value) {
      case 1: return "とても悪い";
      case 2: return "悪い"; 
      case 3: return "普通";
      case 4: return "良い";
      case 5: return "とても良い";
      default: return "未記録";
    }
  };

  const getImportanceColor = (importance: number) => {
    switch (importance) {
      case 1: return "text-blue-600 bg-blue-100";
      case 2: return "text-yellow-600 bg-yellow-100";
      case 3: return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

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

  return (
    <div className="min-h-screen pb-20">
      <Header title="よっつの健康" showBack />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* View Mode Toggle */}
          <div className="warm-card">
            <div className="p-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('record')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    viewMode === 'record'
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FileText size={18} />
                    <span>記録入力</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar size={18} />
                    <span>カレンダー</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'record' ? (
            <>
              {/* Date Navigation */}
              <div className="warm-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goToPreviousDay}
                      className="p-3 hover:bg-orange-100 rounded-full text-orange-600 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-orange-800">
                        {format(selectedDate, 'M月d日 (E)', { locale: ja })}
                      </h2>
                      {!isToday && (
                        <button
                          onClick={goToToday}
                          className="text-sm text-orange-500 hover:text-orange-700 mt-2 px-3 py-1 bg-orange-50 rounded-full transition-colors"
                        >
                          今日に戻る
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={goToNextDay}
                      className="p-3 hover:bg-orange-100 rounded-full text-orange-600 transition-colors"
                    >
                      <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </div>

          {/* Health Record Form */}
          <div className="warm-card">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Heart className="text-red-500" size={24} />
                <h3 className="text-xl font-bold text-orange-800">健康記録</h3>
              </div>

              <div className="space-y-6">
                {/* Hospital Day Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="text-blue-600" size={20} />
                    <span className="font-medium text-blue-800">病院に行った日</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHospitalDay}
                      onChange={(e) => setIsHospitalDay(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full ${isHospitalDay ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${isHospitalDay ? 'transform translate-x-5' : ''}`} />
                    </div>
                  </label>
                </div>

                {/* Condition Rating */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-3">
                    <Activity className="text-orange-600" size={16} />
                    <span>体調 ({getConditionText(condition)})</span>
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setCondition(value)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                          condition === value
                            ? 'border-orange-500 bg-orange-100 text-orange-700'
                            : 'border-orange-200 hover:bg-orange-50 text-orange-600'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appetite Rating */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-3">
                    <Heart className="text-red-600" size={16} />
                    <span>食欲 ({getConditionText(appetite)})</span>
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setAppetite(value)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                          appetite === value
                            ? 'border-red-500 bg-red-100 text-red-700'
                            : 'border-red-200 hover:bg-red-50 text-red-600'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Importance Level */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-3">
                    <Star className="text-yellow-600" size={16} />
                    <span>重要度</span>
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { value: 1, label: '低', color: 'blue' },
                      { value: 2, label: '中', color: 'yellow' },
                      { value: 3, label: '高', color: 'red' }
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        onClick={() => setImportance(value)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                          importance === value
                            ? `border-${color}-500 bg-${color}-100 text-${color}-700`
                            : `border-${color}-200 hover:bg-${color}-50 text-${color}-600`
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-2">
                    <FileText className="text-orange-600" size={16} />
                    <span>メモ</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400 h-24 resize-none"
                    placeholder="今日の体調や気になることを記録してください..."
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveRecord}
                  disabled={isRecordLoading}
                  className="w-full warm-button py-4 text-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isRecordLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Heart size={20} />
                      <span>記録を保存</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Important Records Summary */}
          {importantRecords && (
            <div className="warm-card">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <AlertTriangle className="text-yellow-600" size={24} />
                  <h3 className="text-xl font-bold text-orange-800">病院診察用サマリー</h3>
                </div>

                {importantRecords.last_hospital_visit && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Stethoscope className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-blue-800">
                        前回の病院：{format(new Date(importantRecords.last_hospital_visit.date), 'M月d日', { locale: ja })}
                      </span>
                    </div>
                  </div>
                )}

                {importantRecords.important_records.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-orange-600 mb-3">
                      {importantRecords.last_hospital_visit ? '前回の病院以降の' : ''}重要な記録（中・高重要度）
                    </p>
                    {importantRecords.important_records.map((record) => (
                      <div key={record.id} className="p-3 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-orange-800">
                            {format(new Date(record.date), 'M月d日', { locale: ja })}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getImportanceColor(record.importance)}`}>
                            重要度: {record.importance === 2 ? '中' : '高'}
                          </span>
                        </div>
                        <div className="text-sm text-orange-600 space-y-1">
                          {record.condition && (
                            <div>体調: {getConditionText(record.condition)}</div>
                          )}
                          {record.appetite && (
                            <div>食欲: {getConditionText(record.appetite)}</div>
                          )}
                          {record.notes && (
                            <div className="mt-2 p-2 bg-orange-50 rounded">
                              {record.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Info className="text-orange-300 mx-auto mb-2" size={32} />
                    <p className="text-orange-600">
                      {importantRecords.last_hospital_visit
                        ? '前回の病院以降、重要な記録はありません'
                        : '重要な記録はまだありません'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
            </>
          ) : (
            // Calendar View
            <HealthCalendar 
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setViewMode('record');
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}