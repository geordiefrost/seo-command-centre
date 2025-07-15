import { supabase } from '../lib/supabase';

export const debugDatabaseSchema = async () => {
  try {
    console.log('=== DATABASE SCHEMA DEBUG ===');
    
    // Query keywords table structure using a simple select to see what columns exist
    const { data: sampleKeyword, error: sampleError } = await supabase
      .from('keywords')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Error querying keywords table:', sampleError);
    } else {
      const columns = sampleKeyword && sampleKeyword.length > 0 
        ? Object.keys(sampleKeyword[0]) 
        : ['No data in table'];
      
      console.log('Keywords table columns:', columns);
    }

    // Test a minimal insert to see what happens
    const testInsert = {
      project_id: '00000000-0000-0000-0000-000000000000', // This will fail but show us constraint errors
      keyword: 'test-keyword-debug-' + Date.now(),
      source: 'manual'
    };

    console.log('Testing minimal insert:', testInsert);
    const { data: testData, error: testError } = await supabase
      .from('keywords')
      .insert([testInsert]);

    if (testError) {
      console.log('Test insert error (expected):', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code
      });
    } else {
      console.log('Test insert unexpectedly succeeded:', testData);
      // Clean up the test record
      await supabase
        .from('keywords')
        .delete()
        .eq('keyword', testInsert.keyword);
    }

    console.log('=== END DATABASE DEBUG ===');
  } catch (error) {
    console.error('Database debug failed:', error);
  }
};

// Export function to be called from browser console
(window as any).debugDatabaseSchema = debugDatabaseSchema;