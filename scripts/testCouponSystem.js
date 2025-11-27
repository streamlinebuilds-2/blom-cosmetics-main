// ================================================
// COMPREHENSIVE COUPON SYSTEM TEST SCRIPT
// ================================================
// This script tests all aspects of the fixed coupon system

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

async function testCouponSystem() {
  console.log('🧪 Starting Coupon System Test...');
  console.log('=====================================');

  // Test 1: Database Connection
  console.log('\n📡 Test 1: Database Connection');
  try {
    const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/coupons?limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (dbResponse.ok) {
      console.log('✅ Database connection successful');
    } else {
      throw new Error(`Database connection failed: ${dbResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }

  // Test 2: Test Fixed Discount Coupon
  console.log('\n💰 Test 2: Fixed Discount Coupon (TESTFIXED250)');
  try {
    const testFixedResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_coupon`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_code: 'TESTFIXED250',
        p_email: 'test@example.com',
        p_order_total_cents: 100000, // R1000
        p_cart_items: JSON.stringify([])
      })
    });

    if (testFixedResponse.ok) {
      const result = await testFixedResponse.json();
      const row = Array.isArray(result) ? result[0] : result;
      
      if (row.valid) {
        const discountRands = row.discount_cents / 100;
        console.log(`✅ Fixed discount working: R${discountRands} off (expected R250)`);
        console.log(`   Message: ${row.message}`);
        console.log(`   Type: ${row.discount_type}, Value: ${row.discount_value}`);
        
        if (discountRands !== 250) {
          console.log(`⚠️  Warning: Expected R250, got R${discountRands}`);
        }
      } else {
        console.log('❌ Fixed discount failed:', row.message);
      }
    } else {
      console.log('❌ Fixed discount RPC call failed:', testFixedResponse.status);
    }
  } catch (error) {
    console.error('❌ Fixed discount test error:', error.message);
  }

  // Test 3: Test Percentage Discount Coupon
  console.log('\n📊 Test 3: Percentage Discount Coupon (TESTPERCENT20)');
  try {
    const testPercentResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_coupon`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_code: 'TESTPERCENT20',
        p_email: 'test@example.com',
        p_order_total_cents: 100000, // R1000
        p_cart_items: JSON.stringify([])
      })
    });

    if (testPercentResponse.ok) {
      const result = await testPercentResponse.json();
      const row = Array.isArray(result) ? result[0] : result;
      
      if (row.valid) {
        const discountRands = row.discount_cents / 100;
        console.log(`✅ Percentage discount working: R${discountRands} off (expected R200)`);
        console.log(`   Message: ${row.message}`);
        console.log(`   Type: ${row.discount_type}, Value: ${row.discount_value}%`);
        
        if (Math.abs(discountRands - 200) > 0.01) {
          console.log(`⚠️  Warning: Expected R200, got R${discountRands}`);
        }
      } else {
        console.log('❌ Percentage discount failed:', row.message);
      }
    } else {
      console.log('❌ Percentage discount RPC call failed:', testPercentResponse.status);
    }
  } catch (error) {
    console.error('❌ Percentage discount test error:', error.message);
  }

  // Test 4: Test Below Minimum Order
  console.log('\n🚫 Test 4: Below Minimum Order');
  try {
    const testBelowMinResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_coupon`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_code: 'TESTFIXED250',
        p_email: 'test@example.com',
        p_order_total_cents: 30000, // R300 (below R500 minimum)
        p_cart_items: JSON.stringify([])
      })
    });

    if (testBelowMinResponse.ok) {
      const result = await testBelowMinResponse.json();
      const row = Array.isArray(result) ? result[0] : result;
      
      if (!row.valid && row.message.includes('must be at least R500')) {
        console.log('✅ Minimum order validation working correctly');
        console.log(`   Rejection message: ${row.message}`);
      } else if (row.valid) {
        console.log('❌ Minimum order validation failed - coupon accepted below minimum');
      } else {
        console.log('⚠️  Unexpected rejection message:', row.message);
      }
    }
  } catch (error) {
    console.error('❌ Minimum order test error:', error.message);
  }

  // Test 5: Test apply-coupon Netlify Function
  console.log('\n🌐 Test 5: Apply-Coupon Function');
  try {
    const applyCouponResponse = await fetch('/.netlify/functions/apply-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'TESTFIXED250',
        email: 'test@example.com',
        cart: [
          { product_id: 'test-product-1', price: 500, quantity: 2 },
          { product_id: 'test-product-2', price: 300, quantity: 1 }
        ]
      })
    });

    if (applyCouponResponse.ok) {
      const result = await applyCouponResponse.json();
      if (result.ok) {
        console.log('✅ Apply-coupon function working');
        console.log(`   Discount: R${result.discount}`);
        console.log(`   Code: ${result.code}`);
        console.log(`   Message: ${result.message}`);
      } else {
        console.log('❌ Apply-coupon function failed:', result.error);
      }
    } else {
      console.log('❌ Apply-coupon function call failed:', applyCouponResponse.status);
    }
  } catch (error) {
    console.error('❌ Apply-coupon function test error:', error.message);
  }

  // Test 6: Test Invalid Coupon
  console.log('\n❌ Test 6: Invalid Coupon');
  try {
    const testInvalidResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_coupon`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_code: 'INVALID999',
        p_email: 'test@example.com',
        p_order_total_cents: 100000,
        p_cart_items: JSON.stringify([])
      })
    });

    if (testInvalidResponse.ok) {
      const result = await testInvalidResponse.json();
      const row = Array.isArray(result) ? result[0] : result;
      
      if (!row.valid) {
        console.log('✅ Invalid coupon correctly rejected');
        console.log(`   Rejection message: ${row.message}`);
      } else {
        console.log('❌ Invalid coupon was accepted - system error!');
      }
    }
  } catch (error) {
    console.error('❌ Invalid coupon test error:', error.message);
  }

  // Test 7: Check Database Schema
  console.log('\n📋 Test 7: Database Schema Check');
  try {
    const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/coupons?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (schemaResponse.ok) {
      const coupons = await schemaResponse.json();
      if (coupons.length > 0) {
        const coupon = coupons[0];
        const requiredFields = ['type', 'value', 'percent', 'locked_email', 'max_discount_cents', 'excluded_product_ids'];
        const missingFields = requiredFields.filter(field => !(field in coupon));
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields present in coupons table');
        } else {
          console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
        }
        
        console.log('   Sample coupon fields:', Object.keys(coupon).slice(0, 10).join(', '));
      }
    }
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }

  console.log('\n🏁 Coupon System Test Complete!');
  console.log('=====================================');
  console.log('\n💡 Next Steps:');
  console.log('1. Run the migration: Run the SQL in supabase/migrations/20251127000000_coupon_system_complete_fix.sql');
  console.log('2. Test in browser: Go to checkout and try coupon codes TESTFIXED250 and TESTPERCENT20');
  console.log('3. Check logs: Monitor browser console and Netlify function logs for errors');
  console.log('\n🔍 Debugging Tips:');
  console.log('- If tests fail, check database connection and environment variables');
  console.log('- Check Supabase logs for detailed error messages');
  console.log('- Verify the migration was run successfully');
  console.log('- Ensure test coupons were created (TESTFIXED250, TESTPERCENT20)');
}

// Run the tests
testCouponSystem().catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});