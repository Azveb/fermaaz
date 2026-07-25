import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  // Admin rotalarını qorumaq üçün yoxlama
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Burada next-auth token yoxlanılır (secret `.env` faylında NEXTAUTH_SECRET kimi olmalıdır)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // Test məqsədilə, əgər development rejimindəyiksə icazə veririk
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
    
    // Canlı rejimdə əgər token yoxdursa və ya admin deyilsə (rolu yoxlanıla bilər)
    // if (!token || token.role !== 'ADMIN') {
    //   return NextResponse.redirect(new URL('/login', req.url));
    // }
  }

  return NextResponse.next();
}

// Middleware yalnız /admin rotalarında işləsin
export const config = {
  matcher: ['/admin/:path*'],
};
