import React from 'react';
import Icon from '@/components/ui/Icon';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Ümumi Baxış</h1>
          <p className="text-gray-500 mt-1">Sistemin cari vəziyyəti və son statistikalar.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Hesabatı Yüklə
          </button>
          <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            Yeni Elan Təsdiqi
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon name="users" size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ümumi İstifadəçi</p>
            <h3 className="text-2xl font-bold text-gray-900">1,248</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Icon name="package" size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Aktiv Elanlar</p>
            <h3 className="text-2xl font-bold text-gray-900">456</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Icon name="shopping-cart" size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Gözləyən Sifarişlər</p>
            <h3 className="text-2xl font-bold text-gray-900">24</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Icon name="globe" size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tərcümə Yükü</p>
            <h3 className="text-2xl font-bold text-gray-900">100% AZ/EN/RU</h3>
          </div>
        </div>
      </div>

      {/* Auto Translate Module Status */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Avtomatik Tərcümə Modulu</h2>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> AKTİVDİR
          </span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-gray-100 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">Azərbaycan Dili</span>
                <span className="text-xl">🇦🇿</span>
              </div>
              <p className="text-xs text-gray-500">Əsas dil (Source)</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium">Sinxron:</span>
              <span className="text-brand-600 font-bold">456 / 456 qeyd</span>
            </div>
          </div>

          <div className="border border-gray-100 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-50/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">İngilis Dili</span>
                <span className="text-xl">🇬🇧</span>
              </div>
              <p className="text-xs text-gray-500">Avtomatik Tərcümə</p>
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium">Sinxron:</span>
              <span className="text-brand-600 font-bold">456 / 456 qeyd</span>
            </div>
          </div>

          <div className="border border-gray-100 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-50/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">Rus Dili</span>
                <span className="text-xl">🇷🇺</span>
              </div>
              <p className="text-xs text-gray-500">Avtomatik Tərcümə</p>
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium">Sinxron:</span>
              <span className="text-brand-600 font-bold">456 / 456 qeyd</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
