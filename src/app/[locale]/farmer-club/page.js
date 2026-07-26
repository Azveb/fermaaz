import React from 'react';
import { Link } from "@/i18n/routing";
import Icon from '@/components/ui/Icon';

export const metadata = {
  title: 'Fermer Klubu | FermerMarket',
  description: 'Fermer Klubuna qoşulun, xüsusi endirimlər və bonuslar qazanın.',
};

export default function FarmerClubPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* Hero Section */}
      <div className="relative bg-[#0d3b1e] text-white py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl bottom-0 right-0"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 shadow-yellow-500/30 border border-white/10">
            <Icon name="star" size={40} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Fermer Klubu
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl font-medium">
            Alış-veriş etdikcə qazanın. FermerMarket-in sadiq müştəriləri üçün xüsusi imtiyazlar, bonuslar və qapalı endirim şəbəkəsi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1">
              Kainata Qoşul
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 max-w-5xl -mt-10 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white p-8 md:p-12">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Klubun Üstünlükləri</h2>
            <p className="text-gray-500 mt-2">Niyə Fermer Klubuna qoşulmalısınız?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                <Icon name="tag" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Cashback (Geri Ödəniş)</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Hər alış-verişinizdən 2-5% aralığında bonuslar cüzdanınıza qayıdır. Növbəti alış-verişdə ondan istifadə edin.
              </p>
            </div>
            
            {/* Benefit 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Icon name="users" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Referal Proqramı</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Dostunuzu FermerMarket-ə dəvət edin, həm siz, həm də dostunuz ilk sifarişdə 10 AZN bonus qazansın.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <Icon name="award" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Pulsuz Aqronom Dəstəyi</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Klub üzvləri süni intellekt və peşəkar aqronomlarımıza limitsiz sual verə və prioritet cavab ala bilərlər.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How to earn points */}
      <div className="container mx-auto px-4 max-w-4xl mt-20">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">Necə Bonus Qazanmaq Olar?</h2>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center font-bold text-brand-600 shrink-0">1</div>
            <div>
              <h4 className="font-bold text-gray-900">Qeydiyyatdan Keçin</h4>
              <p className="text-sm text-gray-500">Hesab yaradın və profil məlumatlarınızı tam doldurun (+50 Xal).</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center font-bold text-brand-600 shrink-0">2</div>
            <div>
              <h4 className="font-bold text-gray-900">Sifariş Edin</h4>
              <p className="text-sm text-gray-500">Hər 100 AZN dəyərində uğurlu alış-veriş üçün +10 Xal əldə edin.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center font-bold text-brand-600 shrink-0">3</div>
            <div>
              <h4 className="font-bold text-gray-900">Rəy Yazın</h4>
              <p className="text-sm text-gray-500">Aldığınız məhsula rəy yazaraq keyfiyyətə nəzarətə kömək edin (+5 Xal).</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
