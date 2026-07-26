import React from 'react';
import Icon from '@/components/ui/Icon';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">İstifadəçilər</h1>
          <p className="text-gray-500 mt-1">Platforma üzvlərini, rolları və icazələri idarə edin.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Filtr
          </button>
          <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            Yeni İstifadəçi
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">İstifadəçi</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Əlaqə</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rolu</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qeydiyyat Tarixi</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Əməliyyat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Example row 1 */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    ƏA
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Əli Əliyev</p>
                    <p className="text-xs text-gray-500">ID: #9042</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900">+994 50 123 45 67</p>
                <p className="text-xs text-gray-500">ali@example.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">Fermer</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                12 Yan 2026
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Aktiv</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-brand-600 transition-colors p-1">
                  <Icon name="edit" size={18} />
                </button>
              </td>
            </tr>

            {/* Example row 2 */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                    MQ
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Məmməd Quliyev</p>
                    <p className="text-xs text-gray-500">ID: #9043</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900">+994 70 987 65 43</p>
                <p className="text-xs text-gray-500">m.quliyev@company.az</p>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">Satıcı Şirkət</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                15 Yan 2026
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Bloklanıb</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-brand-600 transition-colors p-1">
                  <Icon name="edit" size={18} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
