'use client';

import { useState, useEffect } from 'react';
import { X, Pill, Tag, Ruler, Clock, Sunrise, Sun, Moon, Save } from 'lucide-react';
import { Medicine } from '@/types';
import { medicineAPI } from '@/lib/api';

interface MedicineFormProps {
  medicine?: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MedicineForm({ medicine, isOpen, onClose, onSuccess }: MedicineFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    morning_dose: '',
    evening_dose: '',
    night_dose: '',
    unit: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (medicine) {
        setFormData({
          name: medicine.name,
          morning_dose: medicine.morning_dose?.toString() || '',
          evening_dose: medicine.evening_dose?.toString() || '',
          night_dose: medicine.night_dose?.toString() || '',
          unit: medicine.unit,
        });
      } else {
        setFormData({
          name: '',
          morning_dose: '',
          evening_dose: '',
          night_dose: '',
          unit: '',
        });
      }
      setError('');
    }
  }, [isOpen, medicine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = {
      name: formData.name,
      morning_dose: formData.morning_dose ? parseFloat(formData.morning_dose) : 0,
      evening_dose: formData.evening_dose ? parseFloat(formData.evening_dose) : 0,
      night_dose: formData.night_dose ? parseFloat(formData.night_dose) : 0,
      unit: formData.unit,
    };

    try {
      if (medicine) {
        await medicineAPI.update(medicine.id, submitData);
      } else {
        await medicineAPI.create(submitData);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]>; error?: string } } };
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.error || '薬の保存に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="warm-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b-2 border-orange-200">
          <div className="flex items-center space-x-3">
            <Pill size={28} className="text-orange-600" />
            <h2 className="text-xl font-bold text-orange-800">
              {medicine ? '薬の編集' : '薬の追加'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-100 rounded-full text-orange-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
              <X size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-2">
              <Tag size={16} />
              <span>薬の名前 *</span>
            </label>
            <input
              type="text"
              id="name"
              required
              className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
              placeholder="薬の名前を入力してください"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="unit" className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-2">
              <Ruler size={16} />
              <span>単位 *</span>
            </label>
            <input
              type="text"
              id="unit"
              required
              className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
              placeholder="錠、ml、粒、包など"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-sm font-bold text-orange-800">
              <Clock size={16} />
              <span>用量設定</span>
            </h3>
            
            <div>
              <label htmlFor="morning_dose" className="flex items-center space-x-2 text-sm font-medium text-orange-700 mb-2">
                <Sunrise size={16} />
                <span>朝の用量</span>
              </label>
              <input
                type="number"
                id="morning_dose"
                step="0.01"
                min="0"
                className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
                placeholder="0.00"
                value={formData.morning_dose}
                onChange={(e) => handleChange('morning_dose', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="evening_dose" className="flex items-center space-x-2 text-sm font-medium text-orange-700 mb-2">
                <Sun size={16} />
                <span>昼の用量</span>
              </label>
              <input
                type="number"
                id="evening_dose"
                step="0.01"
                min="0"
                className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
                placeholder="0.00"
                value={formData.evening_dose}
                onChange={(e) => handleChange('evening_dose', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="night_dose" className="flex items-center space-x-2 text-sm font-medium text-orange-700 mb-2">
                <Moon size={16} />
                <span>夜の用量</span>
              </label>
              <input
                type="number"
                id="night_dose"
                step="0.01"
                min="0"
                className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
                placeholder="0.00"
                value={formData.night_dose}
                onChange={(e) => handleChange('night_dose', e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-orange-200 rounded-xl text-orange-700 hover:bg-orange-50 font-semibold transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 warm-button disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{loading ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}