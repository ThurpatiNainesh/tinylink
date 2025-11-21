import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🔌 Connecting to database...');
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // For development only
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Create the links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) NOT NULL UNIQUE,
        target_url TEXT NOT NULL,
        total_clicks INTEGER NOT NULL DEFAULT 0,
        last_clicked_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Created links table');

    // Create index on code column
    await client.query(`
      CREATE INDEX IF NOT EXISTS links_code_idx 
      ON public.links (code)
    `);
    console.log('✅ Created index on code column');

    // Add some sample data
    await client.query(`
      INSERT INTO public.links (code, target_url, total_clicks)
      VALUES 
        ('example1', 'https://example.com', 0),
        ('google', 'https://google.com', 0),
        ('github', 'https://github.com', 0)
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('✅ Added sample data');

    // Verify the data
    const result = await client.query('SELECT * FROM public.links');
    console.log('\n📊 Current links in the database:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error setting up database:');
    console.error(error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Add script to package.json
async function updatePackageJson() {
  try {
    const fs = await import('fs');
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (!packageJson.scripts['db:setup']) {
      packageJson.scripts['db:setup'] = 'tsx scripts/direct-connect.ts';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Added db:setup script to package.json');
    }
  } catch (error) {
    console.warn('⚠️ Could not update package.json:', error);
  }
}

updatePackageJson().then(setupDatabase);