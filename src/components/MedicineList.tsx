'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Pill, Dog, Sunrise, Sun, Moon } from 'lucide-react';
import { Medicine } from '@/types';
import { medicineAPI } from '@/lib/api';

interface MedicineListProps {
  onEdit: (medicine: Medicine) => void;
  refreshTrigger: number;
}

export default function MedicineList({ onEdit, refreshTrigger }: MedicineListProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = async () => {
    try {
      const data = await medicineAPI.getAll();
      setMedicines(data);
    } catch (error) {
      console.error('薬の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('この薬を削除しますか？')) return;

    try {
      await medicineAPI.delete(id);
      await fetchMedicines();
    } catch (error) {
      console.error('薬の削除に失敗しました:', error);
      alert('薬の削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="warm-card">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Pill size={28} className="text-orange-600" />
          <h2 className="text-xl font-bold text-orange-800">薬の設定</h2>
        </div>
        
        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <Dog size={64} className="text-orange-400 mx-auto mb-4" />
            <p className="text-orange-600 mb-2 font-medium">薬が登録されていません</p>
            <p className="text-sm text-orange-400">「薬を追加」ボタンから薬を登録してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medicines.map((medicine) => (
              <div key={medicine.id} className="card-hover border-2 border-orange-100 rounded-xl p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Pill size={18} className="text-orange-600" />
                      <h3 className="font-bold text-orange-900">{medicine.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {medicine.morning_dose && medicine.morning_dose > 0 && (
                        <span className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Sunrise size={14} />
                          <span>朝: {Number(medicine.morning_dose).toFixed(2)}{medicine.unit}</span>
                        </span>
                      )}
                      {medicine.evening_dose && medicine.evening_dose > 0 && (
                        <span className="bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Sun size={14} />
                          <span>昼: {Number(medicine.evening_dose).toFixed(2)}{medicine.unit}</span>
                        </span>
                      )}
                      {medicine.night_dose && medicine.night_dose > 0 && (
                        <span className="bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Moon size={14} />
                          <span>夜: {Number(medicine.night_dose).toFixed(2)}{medicine.unit}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => onEdit(medicine)}
                      className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(medicine.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}