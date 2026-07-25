# FermerMarket

Aqrar bazar platforması — Next.js (App Router) + PostgreSQL (Prisma).

## Quraşdırma
```bash
npm install
cp .env.example .env   # DATABASE_URL və JWT sirlərini doldurun
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Struktur
- `prisma/schema.prisma` — verilənlər bazası sxemi
- `src/lib/` — auth, validasiya, prisma client
- `src/app/api/` — bütün API endpoint-ləri (Next.js Route Handlers)

## Fazalar
- [x] Phase 1 — Əsas: auth, RBAC, çoxdilli infrastruktur
- [x] Phase 2 — İstifadəçi sistemi: profil, şifrə bərpası, admin panel
- [x] Phase 3 — Marketplace: kateqoriyalar, məhsullar
- [x] Phase 4 — Elan platforması: Premium/VIP listing-lər, kampaniyalar, CTR/impression izləmə
- [x] Phase 5 — Commerce: checkout, sifariş, kupon, komissiya, ödəniş skeleti
- [ ] Phase 6 — Süni İntellekt (AI Description/SEO/Agronomist)
- [ ] Phase 7 — WhatsApp Business inteqrasiyası
- [ ] Phase 8+ — bax layihə tapşırıqlarına

## Phase 5 qeydi — REAL İNTEQRASİYA TƏLƏB EDƏN HİSSƏLƏR
Checkout, komissiya hesablanması, kupon, stok azaldılması, sifariş statusu —
hamısı tam işlək və verilənlər bazası tranzaksiyası ilə qorunur.

Ödəniş isə **provayder-agnostik skeletdir**: `/api/orders/:id/pay` və
`/api/webhooks/payment` hazırdır və `PAYMENT_PROVIDER=manual` ilə (bank
köçürməsi/nağd ödəniş ssenarisi) tam işləyir. Kart ödənişi (Stripe, Payriff,
Kapital Bank və s.) üçün `src/app/api/orders/[id]/pay/route.js` daxilində
`createProviderCharge()` funksiyasını öz provayderinizin SDK-sı və **öz**
gizli açarınızla (`PAYMENT_PROVIDER_SECRET_KEY`) doldurmalısınız — bu açarı
sizin əvəzinizə yarada bilmərəm, çünki bu sizin bank/provayder hesabınıza
aiddir.
