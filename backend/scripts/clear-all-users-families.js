/**
 * Script to clear all users and families from the database
 * WARNING: This will delete ALL data in users, families, and related tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function clearAllUsersAndFamilies() {
  console.log('🚀 Starting database cleanup...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check connection
    console.log('📡 Connecting to database...');
    const { data: testData, error: testError } = await supabase.from('users').select('id').limit(1);
    if (testError && testError.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    console.log('✅ Connected to database\n');

    // Get counts before deletion
    console.log('📊 Getting current counts...');
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: familyCount } = await supabase.from('families').select('*', { count: 'exact', head: true });
    const { count: memberCount } = await supabase.from('family_members').select('*', { count: 'exact', head: true });
    
    console.log(`   Users: ${userCount || 0}`);
    console.log(`   Families: ${familyCount || 0}`);
    console.log(`   Family Members: ${memberCount || 0}\n`);

    if ((userCount || 0) === 0 && (familyCount || 0) === 0) {
      console.log('✅ Database is already empty. Nothing to delete.\n');
      return;
    }

    // Delete in order (respecting foreign key constraints)
    // Due to CASCADE DELETE, deleting users will automatically delete related records
    console.log('🗑️  Deleting all users (this will cascade to families and related data)...');
    
    // Delete all users - this will cascade delete:
    // - families (via owner_id)
    // - family_members (via user_id)
    // - family_invitations (via invited_by)
    // - user_preferences (via user_id)
    // - refresh_tokens (via user_id)
    // - messages (via sender_id)
    // - location_history (via user_id)
    // - and other related tables
    
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using neq to match all)
    
    if (deleteError) {
      throw new Error(`Failed to delete users: ${deleteError.message}`);
    }

    console.log('✅ All users deleted\n');

    // Verify deletion
    console.log('🔍 Verifying deletion...');
    const { count: remainingUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: remainingFamilies } = await supabase.from('families').select('*', { count: 'exact', head: true });
    const { count: remainingMembers } = await supabase.from('family_members').select('*', { count: 'exact', head: true });
    
    console.log(`   Remaining Users: ${remainingUsers || 0}`);
    console.log(`   Remaining Families: ${remainingFamilies || 0}`);
    console.log(`   Remaining Family Members: ${remainingMembers || 0}\n`);

    if ((remainingUsers || 0) === 0 && (remainingFamilies || 0) === 0) {
      console.log('✅ Successfully cleared all users and families from the database!\n');
    } else {
      console.log('⚠️  Some records may still exist. Please check manually.\n');
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
clearAllUsersAndFamilies()
  .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

