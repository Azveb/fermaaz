import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export const metadata = {
  title: 'Kampaniyalar və Endirimlər | FermerMarket',
  description: 'FermerMarket-də mövcud olan ən son kampaniyalar, endirimli aqro məhsullar və topdan satış təklifləri.',
};

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-700 to-green-600 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-md">Xüsusi Təkliflər</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Kampaniyalar və Endirimlər</h1>
          <p className="text-lg md:text-xl text-green-50 opacity-90">
            Fermerlər üçün ən uyğun qiymətlər. Mövsümi endirimlərdən və topdan satış təkliflərindən yararlanın.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl -mt-10 relative z-20">
        
        {/* TODO: Fetch active campaigns from Prisma and map here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Example Campaign 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-5xl font-black">-30%</span>
                <span className="font-bold text-lg mt-1">Yaz Əkini Kampaniyası</span>
              </div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/30">
                <Icon name="clock" size={14} /> 2 gün qaldı
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-xl text-gray-900 mb-2">Seçilmiş Gübrələrdə 30% Endirim</h3>
              <p className="text-gray-500 text-sm mb-6 flex-1">
                Aprel ayının sonuna kimi Azotlu və Fosforlu gübrələrdə xüsusi endirimdən yararlanın.
              </p>
              <Link href="/products?category=gubrek" className="w-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white font-bold py-3 rounded-xl transition-colors text-center inline-block">
                Məhsullara Bax
              </Link>
            </div>
          </div>

          {/* Example Campaign 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-4xl font-black">2 AL 1 ÖDƏ</span>
                <span className="font-bold text-lg mt-1">Dərman vasitələri</span>
              </div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/30">
                <Icon name="clock" size={14} /> 5 gün qaldı
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-xl text-gray-900 mb-2">Bitki Mühafizə Məhsulları</h3>
              <p className="text-gray-500 text-sm mb-6 flex-1">
                Eyni tərkibli seçilmiş dərman vasitələrindən 2 ədəd alın, 1-i bizdən hədiyyə olsun.
              </p>
              <Link href="/products?category=derman" className="w-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white font-bold py-3 rounded-xl transition-colors text-center inline-block">
                Məhsullara Bax
              </Link>
            </div>
          </div>

          {/* Example Campaign 3 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-600"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-5xl font-black"><Icon name="truck" size={48} /></span>
                <span className="font-bold text-lg mt-1">Pulsuz Çatdırılma</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-xl text-gray-900 mb-2">Bölgələrə Pulsuz Çatdırılma</h3>
              <p className="text-gray-500 text-sm mb-6 flex-1">
                Məbləği 500 AZN-dən yuxarı olan bütün kənd təsərrüfatı texnikası və ehtiyat hissələri üçün qüvvədədir.
              </p>
              <Link href="/products?category=texnika" className="w-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white font-bold py-3 rounded-xl transition-colors text-center inline-block">
                Məhsullara Bax
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
