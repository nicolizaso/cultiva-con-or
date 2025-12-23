// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Default response
  const response = NextResponse.next();

  // Buscar token en cookies (comprobar nombres comunes; ajusta si tu app usa otro)
  const cookieCandidates = [
    'sb-access-token',
    'sb-refresh-token',
    'sb:token',
    'supabase-auth-token',
    'supabase-session',
  ];

  let token: string | undefined = undefined;
  for (const name of cookieCandidates) {
    const c = request.cookies.get(name);
    if (c?.value) {
      token = c.value;
      break;
    }
  }

  // Si hay token, opcional: validar con Supabase Auth (petición server-side)
  let user: any = null;
  if (token) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && anonKey) {
        const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: anonKey,
          },
          cache: 'no-store',
        });

        if (res.ok) {
          // endpoint devuelve { id, email, ... } si el token es válido
          user = await res.json();
        } else {
          // no válido => tratar como no autenticado
          user = null;
        }
      }
    } catch (err) {
      // No lanzar: mantener middleware tolerante a errores externos
      console.error('Middleware Supabase user check failed:', err);
      user = null;
    }
  }

  // Lógica de redirección según autenticación
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};