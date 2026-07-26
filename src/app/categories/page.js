import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Icon from '@/components/ui/Icon';

export const metadata = {
  title: 'Bütün Kateqoriyalar | FermerMarket',
  description: 'FermerMarket - Gübrələr, toxumlar, bitki mühafizə vasitələri və digər aqrar kateqoriyalar.',
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { nameAz: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Məhsul <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-green-400">Kateqoriyaları</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Axtardığınız hər növ aqrar məhsulu, texnikanı və xidməti tapmaq üçün müvafiq bölməni seçin.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/products?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-200 transition-all duration-300 overflow-hidden flex flex-col items-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-inner z-10">
                {/* Fallback icon if there is no image */}
                {cat.image ? (
                  <img src={cat.image} alt={cat.nameAz} className="w-8 h-8 object-contain" />
                ) : (
                  <Icon name="search" size={28} />
                )}
              </div>
              <h2 className="font-bold text-gray-800 text-sm md:text-base z-10 group-hover:text-brand-700 transition-colors">
                {cat.nameAz}
              </h2>
            </Link>
          ))}

          {/* Placeholder for aesthetic fullness if DB is empty */}
          {categories.length === 0 && (
            <>
              {[
                { name: "Gübrələr", icon: "leaf" },
                { name: "Toxumlar", icon: "sprout" },
                { name: "Texnika", icon: "truck" },
                { name: "Heyvandarlıq", icon: "activity" }
              ].map((fallback, i) => (
                <div key={i} className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-200 transition-all duration-300 overflow-hidden flex flex-col items-center text-center cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-all duration-300 z-10">
                    <Icon name={fallback.icon} size={28} />
                  </div>
                  <h2 className="font-bold text-gray-800 text-sm md:text-base z-10 group-hover:text-brand-700">{fallback.name}</h2>
                </div>
              ))}
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
