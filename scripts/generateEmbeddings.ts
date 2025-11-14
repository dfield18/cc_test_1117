/**
 * Script to generate and save embeddings for all credit cards
 * Run with: npm run generate-embeddings
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { generateEmbeddings } from '../lib/embeddings';

async function main() {
  try {
    console.log('Starting embeddings generation...');
    const store = await generateEmbeddings();
    console.log(`✅ Successfully generated embeddings for ${store.embeddings.length} cards`);
    console.log(`Generated at: ${store.generatedAt}`);
  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    process.exit(1);
  }
}

main();

