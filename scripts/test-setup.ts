/**
 * Test script to verify setup and identify issues
 * Run with: npx tsx scripts/test-setup.ts
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testSetup() {
  console.log('🔍 Testing Credit Card Recommendation Setup...\n');

  // Test 1: Environment variables
  console.log('1. Checking environment variables...');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in .env.local');
    console.log('   Please add your OpenAI API key to .env.local');
    process.exit(1);
  } else if (apiKey.includes('your_openai_api_key_here') || apiKey.length < 20) {
    console.error('❌ OPENAI_API_KEY appears to be invalid or placeholder');
    console.log('   Please set a valid OpenAI API key in .env.local');
    process.exit(1);
  } else {
    console.log('✅ OPENAI_API_KEY is set');
  }

  // Test 2: Google Sheets access
  console.log('\n2. Testing Google Sheets access...');
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID || '19ioGC8Oj8ej7QP_MG87FyMuAC3AdgGwRrEuKk5wZHZI';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch Google Sheet: ${response.status} ${response.statusText}`);
      console.log('   Please check that the Google Sheet is public');
      process.exit(1);
    }
    
    const csvText = await response.text();
    if (!csvText || csvText.length < 100) {
      console.error('❌ Google Sheet appears to be empty or invalid');
      process.exit(1);
    }
    
    console.log(`✅ Successfully fetched Google Sheet (${csvText.length} bytes)`);
  } catch (error) {
    console.error('❌ Error fetching Google Sheet:', error);
    process.exit(1);
  }

  // Test 3: OpenAI API access
  console.log('\n3. Testing OpenAI API access...');
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: apiKey });
    
    // Test with a simple embedding call
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test',
    });
    
    if (response.data && response.data.length > 0) {
      console.log('✅ OpenAI API is working (embeddings)');
    } else {
      console.error('❌ OpenAI API returned unexpected response');
      process.exit(1);
    }
  } catch (error: any) {
    if (error?.status === 401) {
      console.error('❌ OpenAI API key is invalid or unauthorized');
      console.log('   Please check your API key at https://platform.openai.com/api-keys');
    } else if (error?.status === 429) {
      console.error('❌ OpenAI API rate limit exceeded');
      console.log('   Please wait a moment and try again');
    } else {
      console.error('❌ Error testing OpenAI API:', error.message);
    }
    process.exit(1);
  }

  // Test 4: Data loading
  console.log('\n4. Testing data loading...');
  try {
    const { getCreditCards } = await import('../lib/data');
    const cards = await getCreditCards();
    
    if (cards.length === 0) {
      console.error('❌ No credit cards found in the sheet');
      console.log('   Please check that the sheet has data and correct column names');
      process.exit(1);
    }
    
    console.log(`✅ Successfully loaded ${cards.length} credit cards`);
    
    // Check required columns
    const firstCard = cards[0];
    if (!firstCard.credit_card_name || !firstCard.url_application) {
      console.error('❌ Missing required columns in the sheet');
      console.log('   Required columns: credit_card_name, url_application');
      process.exit(1);
    }
    
    console.log(`   Sample card: ${firstCard.credit_card_name}`);
  } catch (error: any) {
    console.error('❌ Error loading data:', error.message);
    process.exit(1);
  }

  console.log('\n✅ All tests passed! Your setup is ready.');
  console.log('\nNext steps:');
  console.log('1. Run: npm run generate-embeddings (optional, but recommended)');
  console.log('2. Run: npm run dev');
  console.log('3. Open http://localhost:3000');
}

testSetup().catch(console.error);

