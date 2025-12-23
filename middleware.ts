import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const response = NextResponse.next();

  // Buscar token en cookies
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

  // Validar usuario (opcional, simplificado para rendimiento)
  let user: any = null;
  if (token) {
     // Aquí podrías validar contra Supabase, por ahora asumimos que si hay token es válido
     // para no bloquear la navegación rápida.
     user = true; 
  }

  // Si NO hay usuario y NO estamos en login, redirigir
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Excluir rutas de API, estáticos, imágenes, favicon Y MANIFIESTO
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest).*)',
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'
  ],
};