import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Helper function to get database URL from various environment variables
function getDatabaseUrl(): string {
  // Check for different possible environment variable names
  const possibleEnvVars = [
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING'
  ];
  
  for (const envVar of possibleEnvVars) {
    const url = process.env[envVar];
    if (url) {
      console.log(`Using database connection from ${envVar}`);
      return url;
    }
  }
  
  throw new Error('No database connection URL found in environment variables. Please set DATABASE_URL or POSTGRES_URL.');
}

export async function GET(request: NextRequest) {
  const results = {
    connectionTests: [] as any[],
    success: false,
    error: null as string | null,
    details: null as any,
    timestamp: new Date().toISOString()
  };
  
  try {
    console.log('Testing direct score saving...');
    
    // Get connection details from environment variables
    const connectionString = getDatabaseUrl();
    console.log('Using connection string (masked):', connectionString.replace(/:[^:@]*@/, ':***@'));
    
    // Test different SSL configurations
    const sslConfigs = [
      { name: 'SSL disabled', config: false },
      { name: 'SSL with rejectUnauthorized=false', config: { rejectUnauthorized: false } },
      { name: 'SSL with rejectUnauthorized=true', config: { rejectUnauthorized: true } }
    ];
    
    // Try each SSL configuration
    for (const sslTest of sslConfigs) {
      const testResult = {
        name: sslTest.name,
        success: false,
        error: null as string | null
      };
      
      try {
        console.log(`Testing connection with ${sslTest.name}...`);
        
        // Create a pool with the current SSL configuration
        const pool = new Pool({ 
          connectionString,
          ssl: sslTest.config
        });
        
        // Set a short timeout for the connection attempt
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });
        
        // Try to connect
        const client = await Promise.race([
          pool.connect(),
          timeoutPromise
        ]) as any;
        
        console.log(`Connected successfully with ${sslTest.name}`);
        testResult.success = true;
        
        // If this is the SSL disabled or rejectUnauthorized=false config and it worked,
        // try to save a test score
        if (sslTest.name === 'SSL with rejectUnauthorized=false') {
          try {
            // Check if scores table exists
            const tableCheckResult = await client.query(`
              SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'scores'
              )
            `);
            
            const tableExists = tableCheckResult.rows[0].exists;
            console.log('Scores table exists:', tableExists);
            
            if (!tableExists) {
              console.log('Creating scores table...');
              await client.query(`
                CREATE TABLE IF NOT EXISTS scores (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  username VARCHAR(255) NOT NULL,
                  score INTEGER NOT NULL,
                  category VARCHAR(255) NOT NULL,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
              `);
              console.log('Scores table created successfully');
            }
            
            // Insert a test score
            console.log('Inserting test score...');
            const result = await client.query(`
              INSERT INTO scores (username, score, category)
              VALUES ($1, $2, $3)
              RETURNING id, username, score, category, created_at as "createdAt"
            `, ['test_user', 100, 'test_category']);
            
            console.log('Test score inserted successfully:', result.rows[0]);
            
            // Set the overall success flag
            results.success = true;
            results.details = {
              scoreInserted: true,
              score: result.rows[0]
            };
          } catch (scoreError) {
            console.error('Error saving test score:', scoreError);
            testResult.error = `Connected but failed to save score: ${scoreError instanceof Error ? scoreError.message : 'Unknown error'}`;
          }
        }
        
        client.release();
      } catch (connError) {
        console.error(`Connection failed with ${sslTest.name}:`, connError);
        testResult.error = connError instanceof Error ? connError.message : 'Unknown error';
      }
      
      results.connectionTests.push(testResult);
    }
    
    // If no tests succeeded, set the overall error
    if (!results.success) {
      results.error = 'All connection tests failed';
    }
    
    return NextResponse.json(results, { 
      status: results.success ? 200 : 500,
      headers: { 'Cache-Control': 'no-store, max-age=0' } 
    });
  } catch (error) {
    console.error('Error in test-score endpoint:', error);
    return NextResponse.json({
      ...results,
      success: false,
      error: 'Failed to save test score',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500, 
      headers: { 'Cache-Control': 'no-store, max-age=0' } 
    });
  }
} 