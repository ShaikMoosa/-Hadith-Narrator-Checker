import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { user, account, profile } = await request.json() as {
      user?: { id?: string; email?: string; name?: string; image?: string };
      account?: { email?: string };
      profile?: { email?: string; name?: string; picture?: string };
    }

    const supabase = createSupabaseAdminClient()
    const userId = user?.id
    const email = user?.email ?? profile?.email ?? account?.email ?? null

    if (!userId || !email) {
      console.warn('[Auth] Missing user id or email when storing profile', { userId, email })
      return NextResponse.json({ success: false, error: 'Missing user id or email' }, { status: 400 })
    }

    const fullName = user?.name ?? profile?.name ?? null
    const avatarUrl = user?.image ?? profile?.picture ?? null
    const timestamp = new Date().toISOString()

    const { error } = await supabase
      .from('user_profile')
      .upsert({
        user_id: userId,
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
        last_login: timestamp
      })

    if (error) {
      console.error('[Auth] Failed to persist user profile', { error, userId })
      return NextResponse.json({ success: false, error: 'Failed to store user' }, { status: 500 })
    }

    console.log('[Auth] Stored user profile', { userId, email })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Auth] Unexpected error storing user', error)
    return NextResponse.json({ success: false, error: 'Failed to store user' }, { status: 500 })
  }
}
