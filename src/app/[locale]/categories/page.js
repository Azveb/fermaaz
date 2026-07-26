import React from 'react';
import { Link } from "@/i18n/routing";
import { prisma } from '@/lib/prisma';
import Icon from '@/components/ui/Icon';

export const metadata = {
  title: 'Bütün Kateqoriyalar | FermerMarket',
  description: 'FermerMarket - Gübrələr, toxumlar, bitki mühafizə vasitələri və digər aqrar kateqoriyalar.',
};

export default async function CategoriesPage() {
  const rootCategories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      }
    }
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
        
        <div className="space-y-12">
          {rootCategories.map((root) => (
            <div key={root.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-inner">
                  {root.image ? (
                    <img src={root.image} alt={root.nameAz} className="w-8 h-8 object-contain" />
                  ) : (
                    <Icon name={root.icon || "sprout"} size={32} />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{root.nameAz}</h2>
                  <Link href={`/products?category=${root.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700 mt-1 inline-block">Bütün {root.nameAz} →</Link>
                </div>
              </div>

              {root.children && root.children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {root.children.map(sub => (
                    <div key={sub.id} className="group">
                      <Link href={`/products?category=${sub.slug}`} className="text-lg font-bold text-gray-800 hover:text-brand-600 mb-3 flex items-center gap-2 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 opacity-50 group-hover:opacity-100"></span>
                        {sub.nameAz}
                      </Link>
                      
                      {sub.children && sub.children.length > 0 && (
                        <ul className="pl-4 space-y-2 border-l-2 border-brand-50 ml-0.5 mt-2">
                          {sub.children.map(gch => (
                            <li key={gch.id}>
                              <Link href={`/products?category=${gch.slug}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors inline-block py-1">
                                {gch.nameAz}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Alt kateqoriya yoxdur.</p>
              )}
            </div>
          ))}

          {rootCategories.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Heç bir kateqoriya tapılmadı.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
