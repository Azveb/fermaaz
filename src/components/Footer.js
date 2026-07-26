import React from 'react';
import { Link } from "@/i18n/routing";
import Icon from './ui/Icon';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 md:py-16 pb-28 md:pb-16 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Description */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <span className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Icon name="sprout" size={20} strokeWidth={2.1} />
            </span>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Fermer<span className="text-brand-500">Market</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400">
            Fermerlər, mağazalar, aqronomlar və alıcılar üçün AI dəstəkli vahid kənd təsərrüfatı ekosistemi.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors">
              F
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors">
              In
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors">
              W
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h3 className="text-white font-bold mb-4">Platforma</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-brand-400 transition-colors">Elanlar</Link></li>
            <li><Link href="/categories" className="hover:text-brand-400 transition-colors">Kateqoriyalar</Link></li>
            <li><Link href="/campaigns" className="hover:text-brand-400 transition-colors">Kampaniyalar</Link></li>
            <li><Link href="/stores" className="hover:text-brand-400 transition-colors">Mağazalar</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h3 className="text-white font-bold mb-4">Xidmətlər & Məlumat</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/agronom" className="hover:text-brand-400 transition-colors flex items-center gap-2">AI Aqronom <span className="bg-brand-600/20 text-brand-400 px-1.5 py-0.5 rounded text-[10px] font-bold">YENİ</span></Link></li>
            <li><Link href="/farmer-club" className="hover:text-brand-400 transition-colors">Fermer Klubu</Link></li>
            <li><Link href="/blog" className="hover:text-brand-400 transition-colors">Bloq</Link></li>
            <li><Link href="/leaderboard" className="hover:text-brand-400 transition-colors">Liderlər lövhəsi</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-bold mb-4">Əlaqə & Şirkət</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-brand-400 transition-colors">Haqqımızda</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400 transition-colors">Əlaqə</Link></li>
            <li className="flex gap-2 mt-4"><Icon name="phone" size={16} className="text-brand-500" /> +994 50 000 00 00</li>
            <li className="flex gap-2"><Icon name="message" size={16} className="text-brand-500" /> info@fermermarket.az</li>
          </ul>
        </div>

      </div>
      
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500">© {currentYear} FermerMarket. Bütün hüquqlar qorunur.</p>
        <div className="flex gap-4">
          <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">İstifadə qaydaları</Link>
          <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Məxfilik siyasəti</Link>
        </div>
      </div>
    </footer>
  );
}
