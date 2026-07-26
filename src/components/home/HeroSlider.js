"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const SLIDES = [
  {
    title: "Kənd Təsərrüfatının Rəqəmsal Bazarı",
    text: "Fermerlər, mağazalar və alıcılar üçün vahid ekosistem. Alış-verişə indi başlayın.",
    icon: "🛒",
    bg: "from-brand-700 via-brand-600 to-brand-500",
    href: "/products",
    btn: "Elanları Gör"
  },
  {
    title: "Süni İntellekt Dəstəyi",
    text: "Aqronom asistanı ilə məhsul, xəstəlik və çeşidləmə ilə bağlı 24/7 pulsuz cavablar alın.",
    icon: "🤖",
    bg: "from-sky-600 via-blue-600 to-indigo-600",
    href: "/agronom",
    btn: "Aqronoma Soruş"
  },
  {
    title: "Premium Təcrübə & Satış",
    text: "Sürətli axtarış, premium elanlar və 24/7 onlayn sifariş sistemi ilə satışınızı artırın.",
    icon: "✨",
    bg: "from-amber-500 via-orange-500 to-red-500",
    href: "/elan-yerlesdir",
    btn: "Elan Yerləşdir"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden w-full h-[320px] md:h-[400px] bg-gray-900 group mb-6">
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-gradient-to-br ${slide.bg} flex items-center justify-center text-center px-4 ${
            current === idx ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
           {/* Decorative circles */}
           <div className="absolute inset-0 pointer-events-none" aria-hidden>
             <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
             <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
           </div>

           <div className="relative max-w-2xl mx-auto flex flex-col items-center">
              <span className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-[2rem] bg-white/20 text-3xl md:text-4xl shadow-lg backdrop-blur-md mb-5 animate-fade-in-up">
                {slide.icon}
              </span>
              <h2 className="text-2xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md tracking-tight leading-tight animate-fade-in-up" style={{animationDelay: "0.1s"}}>
                {slide.title}
              </h2>
              <p className="text-white/90 text-sm md:text-lg max-w-lg mb-8 animate-fade-in-up" style={{animationDelay: "0.2s"}}>
                {slide.text}
              </p>
              
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-bold px-8 py-3.5 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-xl animate-fade-in-up"
                style={{animationDelay: "0.3s"}}
              >
                {slide.btn}
              </Link>
           </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${current === idx ? "bg-white w-8 shadow-md" : "bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>
      
      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-6 md:h-10">
          <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
