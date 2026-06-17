import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://svfppxpunsuvwskkmgtj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2ZnBweHB1bnN1dndza2ttZ3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzcxNTMsImV4cCI6MjA5NTc1MzE1M30.CzNZPi9qbQGO6H7OkWU3Bug_eK5lDATmLm1Q-3fynSk'
)

async function inspect() {
  const tables = ['peticiones_enviadas', 'destinatarios_peticion', 'colaboradores', 'diputados', 'senadores'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Error reading ${table}:`, error.message);
    } else {
      console.log(`\nTable ${table} schema (from first row):`);
      if (data.length > 0) {
        console.log(Object.keys(data[0]));
        console.log(data[0]);
      } else {
        console.log('No rows found to inspect schema.');
      }
    }
  }
}

inspect();
