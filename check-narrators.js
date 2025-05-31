const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Current narrators:');
  const { data, error } = await supabase
    .from('narrator')
    .select('id, name_arabic, name_transliteration, credibility')
    .order('id');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.table(data);
  
  // Check if we already have a weak narrator
  const weakNarrator = data.find(n => n.credibility === 'weak');
  
  if (!weakNarrator) {
    console.log('\nAdding a weak narrator for testing...');
    
    const { data: newNarrator, error: insertError } = await supabase
      .from('narrator')
      .insert({
        name_arabic: 'عبد الكريم بن أبي المخارق',
        name_transliteration: 'Abd al-Kareem ibn Abi al-Mukhariq',
        credibility: 'weak',
        region: 'Baghdad',
        birth_year: 150,
        death_year: 220,
        biography: 'A narrator considered weak by hadith scholars due to memory issues and unreliable transmission.',
        sources: ['Mizan al-I\'tidal', 'Lisan al-Mizan']
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error adding weak narrator:', insertError);
    } else {
      console.log('Added weak narrator:', newNarrator);
    }
  } else {
    console.log('\nWeak narrator already exists:', weakNarrator);
  }
}

main().catch(console.error); 