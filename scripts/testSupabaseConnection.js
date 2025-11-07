import fetch from 'node-fetch';

const supabaseUrl = 'https://yvmnedjybrpvlupygusf.supabase.co'; // Supabase URL

async function testConnection() {
  try {
    const response = await fetch(supabaseUrl);
    if (response.ok) {
      console.log('Supabase URL is reachable');
    } else {
      console.error('Supabase URL is not reachable:', response.statusText);
    }
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

testConnection();