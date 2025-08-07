'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, ArrowLeft, ArrowRight, Sunrise, Sun, Moon, Pill } from 'lucide-react';
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
    currentValue: boolean
  ) => {
    try {
      const existingRecord = getDoseRecord(medicineId);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      if (existingRecord) {
        await doseRecordAPI.update(existingRecord.id, {
          [doseTime]: !currentValue
        });
      } else {
        await doseRecordAPI.create({
          medicine_id: medicineId,
          dose_date: dateString,
          [doseTime]: !currentValue
        });
      }
      
      await fetchData();
    } catch (error) {
      console.error('記録の更新に失敗しました:', error);
      alert('記録の更新に失敗しました');
    }
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

        {/* Medicine Records */}
        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <Pill size={48} className="text-orange-300 mx-auto mb-4" />
            <p className="text-orange-600 font-medium">薬が登録されていません</p>
            <p className="text-sm text-orange-400 mt-1">まず薬を追加してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medicines.map((medicine) => {
              const record = getDoseRecord(medicine.id);
              const hasMorningDose = medicine.morning_dose && medicine.morning_dose > 0;
              const hasEveningDose = medicine.evening_dose && medicine.evening_dose > 0;
              const hasNightDose = medicine.night_dose && medicine.night_dose > 0;

              if (!hasMorningDose && !hasEveningDose && !hasNightDose) {
                return null;
              }

              return (
                <div key={medicine.id} className="card-hover border-2 border-orange-100 rounded-xl p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Pill size={20} className="text-orange-600" />
                    <h3 className="font-bold text-orange-900">{medicine.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {hasMorningDose && (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl border border-yellow-200">
                        <div className="flex items-center space-x-2">
                          <Sunrise size={16} className="text-yellow-700" />
                          <div>
                            <span className="text-sm font-bold text-yellow-800 block">朝</span>
                            <span className="text-xs text-yellow-600">
                              {Number(medicine.morning_dose).toFixed(2)}{medicine.unit}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDoseToggle(
                            medicine.id, 
                            'morning_taken', 
                            record?.morning_taken || false
                          )}
                          className={`p-2 rounded-full transition-all ${
                            record?.morning_taken
                              ? 'bg-green-200 text-green-700 shadow-md'
                              : 'bg-white text-orange-400 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    )}

                    {hasEveningDose && (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-2">
                          <Sun size={16} className="text-orange-700" />
                          <div>
                            <span className="text-sm font-bold text-orange-800 block">昼</span>
                            <span className="text-xs text-orange-600">
                              {Number(medicine.evening_dose).toFixed(2)}{medicine.unit}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDoseToggle(
                            medicine.id, 
                            'evening_taken', 
                            record?.evening_taken || false
                          )}
                          className={`p-2 rounded-full transition-all ${
                            record?.evening_taken
                              ? 'bg-green-200 text-green-700 shadow-md'
                              : 'bg-white text-orange-400 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    )}

                    {hasNightDose && (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <Moon size={16} className="text-purple-700" />
                          <div>
                            <span className="text-sm font-bold text-purple-800 block">夜</span>
                            <span className="text-xs text-purple-600">
                              {Number(medicine.night_dose).toFixed(2)}{medicine.unit}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDoseToggle(
                            medicine.id, 
                            'night_taken', 
                            record?.night_taken || false
                          )}
                          className={`p-2 rounded-full transition-all ${
                            record?.night_taken
                              ? 'bg-green-200 text-green-700 shadow-md'
                              : 'bg-white text-orange-400 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}