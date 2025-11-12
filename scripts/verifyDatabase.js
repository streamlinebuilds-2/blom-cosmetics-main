import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yvmnedjybrpvlupygusf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bW5lZGp5YnJwdmx1cHlndXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwOTY0MywiZXhwIjoyMDc0MTg1NjQzfQ.dI1D3wtCcM_HwBDyT5bg_H5Yj5e0GUT2ILjDfw6gSyI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('🔍 SUPABASE DATABASE VERIFICATION');
console.log('='.repeat(80));
console.log(`📍 URL: ${SUPABASE_URL}\n`);

async function checkTableStructure(tableName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 TABLE: ${tableName.toUpperCase()}`);
  console.log('='.repeat(80));

  // Get a sample record to see structure
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No records found in table');
    return null;
  }

  console.log('\n📊 COLUMNS:');
  const sample = data[0];
  Object.keys(sample).forEach(key => {
    const value = sample[key];
    const type = value === null ? 'null' : typeof value;
    const displayValue = value === null ? 'NULL' :
                        type === 'object' ? JSON.stringify(value).substring(0, 50) + '...' :
                        String(value).substring(0, 50);
    console.log(`  ✓ ${key.padEnd(25)} [${type}] = ${displayValue}`);
  });

  return sample;
}

async function main() {
  try {
    // Task 1: CHECK REVIEWS TABLE STRUCTURE
    await checkTableStructure('product_reviews');

    const { data: reviewsData } = await supabase
      .from('product_reviews')
      .select('*');

    console.log(`\n📈 Total reviews: ${reviewsData?.length || 0}`);

    // Task 2: CHECK ORDERS TABLE STRUCTURE
    await checkTableStructure('orders');

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*');

    console.log(`\n📈 Total orders: ${ordersData?.length || 0}`);

    // Task 3: LIST ALL PAID ORDERS
    console.log(`\n${'='.repeat(80)}`);
    console.log('💰 PAID ORDERS (Last 10)');
    console.log('='.repeat(80));

    const { data: paidOrders, error: paidError } = await supabase
      .from('orders')
      .select('order_number, buyer_name, buyer_email, total, fulfillment_method, delivery_address, created_at, paid_at, status')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(10);

    if (paidError) {
      console.log(`❌ Error: ${paidError.message}`);
    } else if (!paidOrders || paidOrders.length === 0) {
      console.log('⚠️  No paid orders found');
    } else {
      console.log(`\nFound ${paidOrders.length} paid orders:\n`);
      paidOrders.forEach((order, i) => {
        console.log(`${i + 1}. Order #${order.order_number || 'N/A'}`);
        console.log(`   Buyer: ${order.buyer_name} (${order.buyer_email})`);
        console.log(`   Total: R${order.total || 0}`);
        console.log(`   Method: ${order.fulfillment_method || 'N/A'}`);
        console.log(`   Address: ${order.delivery_address || 'N/A'}`);
        console.log(`   Created: ${order.created_at}`);
        console.log(`   Paid: ${order.paid_at || 'Not set'}`);
        console.log('');
      });
    }

    // Task 4: COUNT ORDERS BY STATUS
    console.log(`${'='.repeat(80)}`);
    console.log('📊 ORDERS BY STATUS');
    console.log('='.repeat(80) + '\n');

    const { data: allOrders } = await supabase
      .from('orders')
      .select('status');

    if (allOrders) {
      const statusCounts = {};
      allOrders.forEach(order => {
        const status = order.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      Object.entries(statusCounts).forEach(([status, count]) => {
        const icon = status === 'paid' ? '✅' : status === 'pending' ? '⏳' : status === 'cancelled' ? '❌' : '❓';
        console.log(`${icon} ${status.toUpperCase().padEnd(15)} ${count}`);
      });
      console.log(`\n📈 Total: ${allOrders.length}`);
    }

    // Task 5: CHECK RECENT REVIEWS
    console.log(`\n${'='.repeat(80)}`);
    console.log('⭐ RECENT REVIEWS (Last 5)');
    console.log('='.repeat(80));

    const { data: recentReviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select('product_slug, reviewer_name, reviewer_email, status, rating, body, created_at, name, email')
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewsError) {
      console.log(`❌ Error: ${reviewsError.message}`);
    } else if (!recentReviews || recentReviews.length === 0) {
      console.log('⚠️  No reviews found');
    } else {
      console.log(`\nFound ${recentReviews.length} reviews:\n`);
      recentReviews.forEach((review, i) => {
        console.log(`${i + 1}. Product: ${review.product_slug || 'N/A'}`);
        console.log(`   Reviewer: ${review.reviewer_name || review.name || 'N/A'} (${review.reviewer_email || review.email || 'N/A'})`);
        console.log(`   Status: ${review.status || 'N/A'} | Rating: ${review.rating || 'N/A'}/5`);
        console.log(`   Review: ${review.body?.substring(0, 100) || 'N/A'}...`);
        console.log(`   Created: ${review.created_at}`);
        console.log('');
      });
    }

    // Task 6: IDENTIFY ISSUES
    console.log(`${'='.repeat(80)}`);
    console.log('🔍 DATA QUALITY ISSUES');
    console.log('='.repeat(80) + '\n');

    let issuesFound = 0;

    // Check orders with NULL required fields
    const { data: ordersWithIssues } = await supabase
      .from('orders')
      .select('order_number, buyer_name, buyer_email, status, fulfillment_method, delivery_address, total, m_payment_id');

    if (ordersWithIssues) {
      ordersWithIssues.forEach(order => {
        const issues = [];
        if (!order.buyer_email) issues.push('buyer_email is NULL');
        if (!order.buyer_name) issues.push('buyer_name is NULL');
        if (!order.status) issues.push('status is NULL');
        if (!order.fulfillment_method) issues.push('fulfillment_method is NULL');
        if (order.total === null || order.total === undefined) issues.push('total is NULL');

        if (issues.length > 0) {
          issuesFound++;
          console.log(`❌ Order #${order.order_number || 'N/A'}:`);
          issues.forEach(issue => console.log(`   - ${issue}`));
        }
      });
    }

    // Check reviews with NULL reviewer_name
    const { data: reviewsWithIssues } = await supabase
      .from('product_reviews')
      .select('id, product_slug, reviewer_name, name, reviewer_email, email');

    if (reviewsWithIssues) {
      reviewsWithIssues.forEach(review => {
        const issues = [];
        if (!review.reviewer_name && !review.name) issues.push('reviewer_name/name is NULL');
        if (!review.reviewer_email && !review.email) issues.push('reviewer_email/email is NULL');
        if (!review.product_slug) issues.push('product_slug is NULL');

        if (issues.length > 0) {
          issuesFound++;
          console.log(`❌ Review ${review.id}:`);
          issues.forEach(issue => console.log(`   - ${issue}`));
        }
      });
    }

    if (issuesFound === 0) {
      console.log('✅ No data quality issues found!');
    } else {
      console.log(`\n⚠️  Total issues found: ${issuesFound}`);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

main();
