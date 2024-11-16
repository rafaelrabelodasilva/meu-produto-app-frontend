import { NextRequest, NextResponse } from 'next/server'
import { getCookieServer } from '@/lib/cookieServer'
import { api } from './app/services/app';


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/") {
    return NextResponse.next();
  }

  const token = await getCookieServer(); // Adicione `await` para resolver a Promise

  if (!token) { // Agora `token` é uma string ou null, e não uma Promise
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isValid = await validateToken(token);
  console.log(isValid);

  if (!isValid) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}


async function validateToken(token: string){
  if (!token) return false;

  try{
    await api.get("/me", {
      headers:{
        Authorization: `Bearer ${token}`
      }
    })

    return true;
  }catch(err){
    return false;
  }
}