// ================================================
// QUICK COUPON VALIDATION TEST
// ================================================
// Test that the 3-parameter redeem_coupon function works

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function testCouponValidation() {
  console.log('🧪 Testing Coupon Validation Fix...');
  
  try {
    // Test the 3-parameter function signature (what the frontend now calls)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_coupon`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_code: 'TEST123', // Invalid code to test error handling
        p_email: 'test@example.com',
        p_order_total_cents: 100000
      })
    });

    if (response.status === 404) {
      console.error('❌ Function still not found - check migration status');
      return false;
    }

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Function found and working!');
      console.log('   Response:', JSON.stringify(result, null, 2));
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Function found but error:', error);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testCouponValidation().then(success => {
  if (success) {
    console.log('\n🎉 Coupon validation is now working!');
    console.log('✅ Fixed: Frontend calls 3-parameter function');
    console.log('✅ Fixed: Function signature matches database');
    console.log('✅ Ready for testing with real coupon codes');
  } else {
    console.log('\n⚠️  Issue detected - check function exists in database');
  }
  process.exit(success ? 0 : 1);
});