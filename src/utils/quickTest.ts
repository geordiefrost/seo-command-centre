import { supabase } from '../lib/supabase';

export async function quickDatabaseTest() {
  console.log('🔍 Testing Supabase database connection...');
  
  try {
    // Simple test - just try to fetch clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('name, status')
      .limit(5);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${clients.length} clients:`);
    
    clients.forEach(client => {
      console.log(`  - ${client.name} (${client.status})`);
    });
    
    // Test integrations table
    const { data: integrations, error: intError } = await supabase
      .from('integrations')
      .select('name, status')
      .limit(3);
    
    if (!intError && integrations) {
      console.log('✅ Integrations table accessible:');
      integrations.forEach(integration => {
        console.log(`  - ${integration.name} (${integration.status})`);
      });
    }
    
    console.log('\n🎉 Database test passed! Ready to use.');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}