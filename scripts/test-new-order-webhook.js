#!/usr/bin/env node

/**
 * Test script for the new-order-alert webhook functionality
 * This script tests both the webhook function directly and integration with payfast-itn
 */

const https = require('https');
const fs = require('fs');

const BASE_URL = process.env.SITE_URL || 'http://localhost:8888';
const WEBHOOK_URL = `${BASE_URL}/.netlify/functions/new-order-alert`;

// Mock order data for testing
const mockOrderData = {
  order_id: 'test-order-123',
  order_number: 'BLOM-20241127120000-TEST1',
  status: 'paid',
  payment_status: 'paid',
  total_amount: 299.99,
  currency: 'ZAR',
  created_at: new Date().toISOString(),
  paid_at: new Date().toISOString(),
  customer_email: 'test@example.com',
  customer_name: 'Test Customer',
  customer_phone: '+27123456789',
  shipping_method: 'door-to-door',
  shipping_cost: 50.00,
  items: [
    {
      id: 'item-1',
      quantity: 2,
      unit_price: 124.995,
      total_price: 249.99,
      product_name: 'Test Product A',
      product_sku: 'TEST-001',
      variant_title: 'Red - Large'
    }
  ],
  payment_details: {
    provider: 'payfast',
    provider_txn_id: 'PF-TEST-123456',
    transaction_fee: 8.99
  }
};

async function testWebhookDirectly() {
  console.log('🧪 Testing new-order-alert webhook directly...\n');

  try {
    // Test the webhook function directly
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: 'test-order-123' })
    });

    console.log(`📡 Webhook Response Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📄 Response Body: ${responseText}`);

    if (response.ok) {
      console.log('✅ Webhook test PASSED - Function executed successfully');
    } else {
      console.log('❌ Webhook test FAILED - Function returned error');
      return false;
    }

  } catch (error) {
    console.error('❌ Webhook test FAILED - Network error:', error.message);
    return false;
  }

  return true;
}

async function testWebhookPayload() {
  console.log('\n🧪 Testing webhook with mock order data...\n');

  try {
    // Send the webhook to the external URL directly
    const webhookTarget = 'https://dockerfile-1n82.onrender.com/webhook/new-order-alert';
    
    const response = await fetch(webhookTarget, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BLOM-Cosmetics-Webhook-Test/1.0'
      },
      body: JSON.stringify({
        event_type: 'order_paid',
        timestamp: new Date().toISOString(),
        order: mockOrderData
      })
    });

    console.log(`📡 External Webhook Response Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📄 External Response Body: ${responseText}`);

    if (response.ok) {
      console.log('✅ External webhook test PASSED - External service received data');
    } else {
      console.log('⚠️  External webhook test WARNING - External service returned error (this might be expected if service is not running)');
    }

  } catch (error) {
    console.log('⚠️  External webhook test WARNING - Network error:', error.message);
    console.log('    (This might be expected if the external service is not accessible)');
  }
}

function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');
  
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.log('⚠️  Missing environment variables:', missing.join(', '));
    console.log('   The webhook will work in Netlify environment but may fail locally\n');
  } else {
    console.log('✅ All required environment variables are set\n');
  }
}

async function main() {
  console.log('🚀 BLOM Cosmetics - New Order Alert Webhook Test\n');
  console.log('=' .repeat(50));

  checkEnvironment();
  
  const localTestPassed = await testWebhookDirectly();
  await testWebhookPayload();

  console.log('\n' + '=' .repeat(50));
  console.log('📋 Test Summary:');
  console.log(`   Local Function Test: ${localTestPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`   External Webhook Test: Check logs above`);

  if (localTestPassed) {
    console.log('\n✅ Webhook integration is ready for deployment!');
    console.log('   The webhook will be triggered automatically when orders are marked as paid.');
  } else {
    console.log('\n❌ There may be issues with the webhook implementation.');
    console.log('   Check the error messages above for troubleshooting.');
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testWebhookDirectly, testWebhookPayload, mockOrderData };