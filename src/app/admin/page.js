import React from 'react';

export default function AdminPage() {
  return (
    <div className="admin-layout min-h-screen bg-[var(--bg)] p-8 w-full flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-extrabold mb-6">Admin Panel</h1>
        <p className="text-lg text-gray-700 mb-8">Bu sayfa yönetim paneli için temel bir iskelet oluşturur. Sistem durumu, istatistikler ve günlük (log) izleme bu panelden sağlanabilir.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="stat-card">
            <h3 className="stat-label">Sistem Durumu</h3>
            <p className="stat-value text-brand-600">Aktiv</p>
            <p className="text-sm text-gray-500 mt-2">Bütün xidmətlər qaydasındadır.</p>
          </div>
          
          <div className="stat-card">
            <h3 className="stat-label">Xətalar (Son 24 saat)</h3>
            <p className="stat-value text-amber-600">0</p>
            <p className="text-sm text-gray-500 mt-2">Sentry vasitəsilə izlənilir.</p>
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <a href="/admin/live" className="btn-primary inline-block text-center">Canlı Monitorinq</a>
          <a href="/" className="btn-secondary inline-block text-center">Ana Səhifəyə Qayıt</a>
        </div>
      </div>
    </div>
  );
}
