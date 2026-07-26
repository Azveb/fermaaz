import React from 'react';
import Icon from '@/components/ui/Icon';

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Məhsullar</h1>
          <p className="text-gray-500 mt-1">Platformadakı bütün elanları idarə edin.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Elan axtar..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Icon name="search" size={16} />
            </div>
          </div>
          <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            Yeni Məhsul
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Məhsul ID / Adı</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategoriyası</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qiymət</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tərcümə Statusu</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Əməliyyat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Example row 1 */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0"></div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Ammonium Nitrat</p>
                    <p className="text-xs text-gray-500">ID: #10024</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">Gübrə</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">45.00 ₼</td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">AZ</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">EN</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">RU</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Aktiv</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-brand-600 transition-colors p-1">
                  <Icon name="edit" size={18} />
                </button>
                <button className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-2">
                  <Icon name="trash" size={18} />
                </button>
              </td>
            </tr>

            {/* Example row 2 */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0"></div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Pomidor Toxumu (Pink)</p>
                    <p className="text-xs text-gray-500">ID: #10025</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">Toxum</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">120.00 ₼</td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">AZ</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">EN (Gözləyir)</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">RU</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Təsdiq Gözləyir</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-brand-600 transition-colors p-1">
                  <Icon name="edit" size={18} />
                </button>
                <button className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-2">
                  <Icon name="trash" size={18} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-500">Göstərilir 1 - 2 (Cəmi 456)</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 text-gray-400 cursor-not-allowed">Əvvəlki</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50">Növbəti</button>
          </div>
        </div>
      </div>
    </div>
  );
}
