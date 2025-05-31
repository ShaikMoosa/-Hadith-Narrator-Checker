'use server'

import { createSupabaseAdminClient } from '@/utils/supabase/server'

export async function addWeakNarrator() {
  try {
    const supabase = await createSupabaseAdminClient();
    
    // Check if weak narrator already exists
    const { data: existing } = await supabase
      .from('narrator')
      .select('id')
      .eq('name_transliteration', 'Abd al-Kareem ibn Abi al-Mukhariq')
      .single();
    
    if (existing) {
      console.log('Weak narrator already exists');
      return { success: true, message: 'Weak narrator already exists' };
    }
    
    // Add weak narrator
    const { data: newNarrator, error } = await supabase
      .from('narrator')
      .insert({
        name_arabic: 'عبد الكريم بن أبي المخارق',
        name_transliteration: 'Abd al-Kareem ibn Abi al-Mukhariq',
        credibility: 'weak',
        region: 'Baghdad',
        birth_year: 150,
        death_year: 220,
        biography: 'A narrator considered weak by hadith scholars due to memory issues and unreliable transmission. Often confused names and details in his narrations.'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding weak narrator:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Added weak narrator:', newNarrator);
    return { success: true, narrator: newNarrator };
    
  } catch (error) {
    console.error('Error in addWeakNarrator:', error);
    return { success: false, error: error.message };
  }
} 