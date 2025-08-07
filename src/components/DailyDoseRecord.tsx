'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, ArrowLeft, ArrowRight, Sunrise, Sun, Moon, Pill, Clock } from 'lucide-react';
import { Medicine, DoseRecord } from '@/types';
import { medicineAPI, doseRecordAPI } from '@/lib/api';

interface DailyDoseRecordProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DailyDoseRecord({ selectedDate, onDateChange }: DailyDoseRecordProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doseRecords, setDoseRecords] = useState<DoseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [medicinesData, recordsData] = await Promise.all([
        medicineAPI.getAll(),
        doseRecordAPI.getAll(format(selectedDate, 'yyyy-MM-dd'))
      ]);
      
      setMedicines(medicinesData);
      setDoseRecords(recordsData);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [selectedDate, fetchData]);

  const getDoseRecord = (medicineId: number): DoseRecord | undefined => {
    return doseRecords.find(record => record.medicine_id === medicineId);
  };

  const handleDoseToggle = async (
    medicineId: number, 
    doseTime: 'morning_taken' | 'evening_taken' | 'night_taken',
    currentValue: boolean,
    time?: string
  ) => {
    try {
      const existingRecord = getDoseRecord(medicineId);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      const timeField = doseTime.replace('_taken', '_time') as 'morning_time' | 'evening_time' | 'night_time';
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = time || `${hours}:${minutes}`;
      
      const updateData = {
        [doseTime]: !currentValue,
        ...((!currentValue) && { [timeField]: currentTime })
      };
      
      if (existingRecord) {
        await doseRecordAPI.update(existingRecord.id, updateData);
      } else {
        await doseRecordAPI.create({
          medicine_id: medicineId,
          dose_date: dateString,
          ...updateData
        });
      }
      
      await fetchData();
    } catch (error) {
      console.error('記録の更新に失敗しました:', error);
      alert('記録の更新に失敗しました');
    }
  };

  const handleTimeChange = async (
    medicineId: number,
    timeField: 'morning_time' | 'evening_time' | 'night_time',
    time: string
  ) => {
    try {
      const existingRecord = getDoseRecord(medicineId);
      if (existingRecord) {
        await doseRecordAPI.update(existingRecord.id, {
          [timeField]: time
        });
        await fetchData();
      }
    } catch (error) {
      console.error('時間の更新に失敗しました:', error);
      alert('時間の更新に失敗しました');
    }
  };

  const setCurrentTime = (
    medicineId: number,
    timeField: 'morning_time' | 'evening_time' | 'night_time'
  ) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    handleTimeChange(medicineId, timeField, currentTime);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    onDateChange(nextDay);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  if (loading) {
    return (
      <div className="warm-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-orange-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-orange-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="warm-card">
      <div className="p-6">
        {/* Date Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Medicine Records - Grouped by Time */}
        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <Pill size={48} className="text-orange-300 mx-auto mb-4" />
            <p className="text-orange-600 font-medium">薬が登録されていません</p>
            <p className="text-sm text-orange-400 mt-1">まず薬を追加してください</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Morning Medicines */}
            {(() => {
              const morningMedicines = medicines.filter(medicine => 
                medicine.morning_dose && medicine.morning_dose > 0
              );
              
              if (morningMedicines.length === 0) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sunrise size={24} className="text-yellow-700" />
                    <h2 className="text-xl font-bold text-yellow-800">朝の薬</h2>
                  </div>
                  <div className="space-y-3">
                    {morningMedicines.map((medicine) => {
                      const record = getDoseRecord(medicine.id);
                      return (
                        <div key={`morning-${medicine.id}`} className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Pill size={16} className="text-yellow-700" />
                              <div>
                                <h3 className="font-bold text-yellow-900">{medicine.name}</h3>
                                <p className="text-sm text-yellow-700">
                                  {record?.morning_dose_at_time 
                                    ? `${Number(record.morning_dose_at_time).toFixed(2)}${medicine.unit}` 
                                    : `${Number(medicine.morning_dose).toFixed(2)}${medicine.unit}`}
                                </p>
                                {record?.morning_taken && record?.morning_time && (
                                  <p className="text-sm text-yellow-800 font-medium">
                                    {record.morning_time.slice(0, 5)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDoseToggle(
                                medicine.id, 
                                'morning_taken', 
                                record?.morning_taken || false
                              )}
                              className={`p-3 rounded-full transition-all ${
                                record?.morning_taken
                                  ? 'bg-green-200 text-green-700 shadow-md'
                                  : 'bg-white text-yellow-500 hover:bg-yellow-50 hover:text-yellow-700'
                              }`}
                            >
                              <Check size={20} />
                            </button>
                          </div>
                          {record?.morning_taken && (
                            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-yellow-300">
                              <Clock size={14} className="text-yellow-600" />
                                                          <input
                              type="time"
                              value={record?.morning_time ? record.morning_time.slice(0, 5) : ''}
                              onChange={(e) => handleTimeChange(medicine.id, 'morning_time', e.target.value)}
                              className="text-sm border border-yellow-300 rounded px-2 py-1 bg-yellow-50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                              <button
                                onClick={() => setCurrentTime(medicine.id, 'morning_time')}
                                className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                              >
                                現在時刻
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Evening Medicines */}
            {(() => {
              const eveningMedicines = medicines.filter(medicine => 
                medicine.evening_dose && medicine.evening_dose > 0
              );
              
              if (eveningMedicines.length === 0) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sun size={24} className="text-orange-700" />
                    <h2 className="text-xl font-bold text-orange-800">昼の薬</h2>
                  </div>
                  <div className="space-y-3">
                    {eveningMedicines.map((medicine) => {
                      const record = getDoseRecord(medicine.id);
                      return (
                        <div key={`evening-${medicine.id}`} className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Pill size={16} className="text-orange-700" />
                              <div>
                                <h3 className="font-bold text-orange-900">{medicine.name}</h3>
                                <p className="text-sm text-orange-700">
                                  {record?.evening_dose_at_time 
                                    ? `${Number(record.evening_dose_at_time).toFixed(2)}${medicine.unit}` 
                                    : `${Number(medicine.evening_dose).toFixed(2)}${medicine.unit}`}
                                </p>
                                {record?.evening_taken && record?.evening_time && (
                                  <p className="text-sm text-orange-800 font-medium">
                                    {record.evening_time.slice(0, 5)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDoseToggle(
                                medicine.id, 
                                'evening_taken', 
                                record?.evening_taken || false
                              )}
                              className={`p-3 rounded-full transition-all ${
                                record?.evening_taken
                                  ? 'bg-green-200 text-green-700 shadow-md'
                                  : 'bg-white text-orange-500 hover:bg-orange-50 hover:text-orange-700'
                              }`}
                            >
                              <Check size={20} />
                            </button>
                          </div>
                          {record?.evening_taken && (
                            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-orange-300">
                              <Clock size={14} className="text-orange-600" />
                                                          <input
                              type="time"
                              value={record?.evening_time ? record.evening_time.slice(0, 5) : ''}
                              onChange={(e) => handleTimeChange(medicine.id, 'evening_time', e.target.value)}
                              className="text-sm border border-orange-300 rounded px-2 py-1 bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            />
                              <button
                                onClick={() => setCurrentTime(medicine.id, 'evening_time')}
                                className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                              >
                                現在時刻
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Night Medicines */}
            {(() => {
              const nightMedicines = medicines.filter(medicine => 
                medicine.night_dose && medicine.night_dose > 0
              );
              
              if (nightMedicines.length === 0) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Moon size={24} className="text-purple-700" />
                    <h2 className="text-xl font-bold text-purple-800">夜の薬</h2>
                  </div>
                  <div className="space-y-3">
                    {nightMedicines.map((medicine) => {
                      const record = getDoseRecord(medicine.id);
                      return (
                        <div key={`night-${medicine.id}`} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Pill size={16} className="text-purple-700" />
                              <div>
                                <h3 className="font-bold text-purple-900">{medicine.name}</h3>
                                <p className="text-sm text-purple-700">
                                  {record?.night_dose_at_time 
                                    ? `${Number(record.night_dose_at_time).toFixed(2)}${medicine.unit}` 
                                    : `${Number(medicine.night_dose).toFixed(2)}${medicine.unit}`}
                                </p>
                                {record?.night_taken && record?.night_time && (
                                  <p className="text-sm text-purple-800 font-medium">
                                    {record.night_time.slice(0, 5)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDoseToggle(
                                medicine.id, 
                                'night_taken', 
                                record?.night_taken || false
                              )}
                              className={`p-3 rounded-full transition-all ${
                                record?.night_taken
                                  ? 'bg-green-200 text-green-700 shadow-md'
                                  : 'bg-white text-purple-500 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              <Check size={20} />
                            </button>
                          </div>
                          {record?.night_taken && (
                            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-purple-300">
                              <Clock size={14} className="text-purple-600" />
                                                          <input
                              type="time"
                              value={record?.night_time ? record.night_time.slice(0, 5) : ''}
                              onChange={(e) => handleTimeChange(medicine.id, 'night_time', e.target.value)}
                              className="text-sm border border-purple-300 rounded px-2 py-1 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                            />
                              <button
                                onClick={() => setCurrentTime(medicine.id, 'night_time')}
                                className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                              >
                                現在時刻
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}