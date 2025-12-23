import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verificamos si hay usuario
  const { data: { user } } = await supabase.auth.getUser();

  // RUTAS PROTEGIDAS (Dashboard, Espacios, Ciclos, etc.)
  // Si NO hay usuario y NO está en login, lo mandamos al login
  if (!user && request.nextUrl.pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // SI YA ESTÁ LOGUEADO y quiere ir al login, lo mandamos al home
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas EXCEPTO:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización imágenes)
     * - favicon.ico (icono)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest).*)',
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.png$).*)'
  ],
};