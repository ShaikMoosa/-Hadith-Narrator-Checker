'use server'

import { auth } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/utils/supabase/server'
import type { Database } from '@/types/database.types'

interface UserProfileResponse {
  success: boolean
  data?: Database['public']['Tables']['user_profile']['Row']
  error?: string
}

export async function getCurrentUserProfile(): Promise<UserProfileResponse> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Not authenticated'
    }
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error) {
    console.error('[Auth] Failed to load user profile', error)
    return {
      success: false,
      error: 'Failed to load profile'
    }
  }

  return {
    success: true,
    data: data ?? undefined
  }
}
