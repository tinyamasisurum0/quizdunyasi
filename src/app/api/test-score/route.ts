import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get database URL from various environment variables
function getDatabaseUrl(): string | null {
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
  
  return null;
}

// Helper function to modify connection string for different SSL modes
function getConnectionWithSslMode(baseUrl: string, sslMode: string): string {
  // Remove any existing sslmode parameter
  let url = baseUrl.replace(/(\?|&)sslmode=[^&]*(&|$)/, '$1');
  
  // Add the new sslmode parameter
  if (url.includes('?')) {
    url = url + '&sslmode=' + sslMode;
  } else {
    url = url + '?sslmode=' + sslMode;
  }
  
  return url;
}

export async function GET(request: NextRequest) {
  const results = {
    connectionTests: [] as any[],
    envVars: {} as Record<string, boolean>,
    success: false,
    error: null as string | null,
    details: null as any,
    timestamp: new Date().toISOString()
  };
  
  try {
    console.log('Testing direct score saving...');
    
    // Check which environment variables are set
    const envVars = ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'];
    for (const envVar of envVars) {
      results.envVars[envVar] = !!process.env[envVar];
    }
    
    // Get connection details from environment variables
    const baseConnectionString = getDatabaseUrl();
    if (!baseConnectionString) {
      return NextResponse.json({
        ...results,
        success: false,
        error: 'No database connection URL found in environment variables',
        details: 'Please set DATABASE_URL or POSTGRES_URL in your environment variables'
      }, { 
        status: 500, 
        headers: { 'Cache-Control': 'no-store, max-age=0' } 
      });
    }
    
    console.log('Using connection string (masked):', baseConnectionString.replace(/:[^:@]*@/, ':***@'));
    
    // Test different SSL configurations
    const sslConfigs = [
      { name: 'Default connection string', connectionString: baseConnectionString, ssl: undefined },
      { name: 'SSL disabled', connectionString: baseConnectionString, ssl: false },
      { name: 'SSL with rejectUnauthorized=false', connectionString: baseConnectionString, ssl: { rejectUnauthorized: false } },
      { name: 'sslmode=require', connectionString: getConnectionWithSslMode(baseConnectionString, 'require'), ssl: undefined },
      { name: 'sslmode=prefer', connectionString: getConnectionWithSslMode(baseConnectionString, 'prefer'), ssl: undefined },
      { name: 'sslmode=disable', connectionString: getConnectionWithSslMode(baseConnectionString, 'disable'), ssl: undefined }
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
          connectionString: sslTest.connectionString,
          ssl: sslTest.ssl
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
        
        // If this configuration worked, try to save a test score
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
          const testId = uuidv4();
          const result = await client.query(`
            INSERT INTO scores (id, username, score, category)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, score, category, created_at as "createdAt"
          `, [testId, 'test_user', 100, 'test_category']);
          
          console.log('Test score inserted successfully:', result.rows[0]);
          
          // Set the overall success flag
          results.success = true;
          results.details = {
            scoreInserted: true,
            score: result.rows[0],
            connectionConfig: sslTest.name
          };
        } catch (scoreError) {
          console.error('Error saving test score:', scoreError);
          testResult.error = `Connected but failed to save score: ${scoreError instanceof Error ? scoreError.message : 'Unknown error'}`;
        }
        
        client.release();
      } catch (connError) {
        console.error(`Connection failed with ${sslTest.name}:`, connError);
        testResult.error = connError instanceof Error ? connError.message : 'Unknown error';
      }
      
      results.connectionTests.push(testResult);
      
      // If we've already found a working configuration and saved a score, we can stop testing
      if (results.success) {
        break;
      }
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