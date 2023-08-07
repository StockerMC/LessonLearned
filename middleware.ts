import { createMiddlewareClient, createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession()
  
    if (!session?.user) {
        return res;
    }

    // REDIRECT LOGGED IN USERS TO /DASHBOARD

    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    // redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
}
