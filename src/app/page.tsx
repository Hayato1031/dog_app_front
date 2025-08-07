'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Medicine } from '@/types';
import Header from '@/components/Header';
import MedicineList from '@/components/MedicineList';
import MedicineForm from '@/components/MedicineForm';

export default function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

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

  const handleAddMedicine = () => {
    setSelectedMedicine(null);
    setShowMedicineForm(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowMedicineForm(true);
  };

  const handleCloseForm = () => {
    setShowMedicineForm(false);
    setSelectedMedicine(null);
  };

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="warm-card card-hover p-6 text-center">
            <div className="flex justify-center mb-4">
              <Heart size={64} className="text-orange-500 wag-animation" />
            </div>
            <h2 className="text-2xl font-bold text-orange-800 mb-2">
              {user?.name}さんとよっつの健康管理
            </h2>
            <p className="text-orange-600">
              今日もよっつが健康でありますように
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleAddMedicine}
              className="warm-button flex items-center justify-center space-x-3 py-4 text-lg"
            >
              <Plus size={24} />
              <span>薬を追加</span>
            </button>
            <button
              onClick={() => router.push('/record')}
              className="warm-button flex items-center justify-center space-x-3 py-4 text-lg"
            >
              <FileText size={24} />
              <span>今日の記録</span>
            </button>
          </div>

          {/* Medicine List */}
          <MedicineList 
            onEdit={handleEditMedicine}
            refreshTrigger={refreshTrigger}
          />

          {/* Medicine Form Modal */}
          <MedicineForm
            medicine={selectedMedicine}
            isOpen={showMedicineForm}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        </div>
      </main>
    </div>
  );
}
