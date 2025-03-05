import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // List of required environment variables for database connection
    const requiredEnvVars = [
      'POSTGRES_URL',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD',
      'POSTGRES_HOST',
      'POSTGRES_DATABASE'
    ];
    
    // Check which variables are set (without revealing their values)
    const envStatus = requiredEnvVars.reduce((status, varName) => {
      status[varName] = {
        exists: !!process.env[varName],
        length: process.env[varName] ? process.env[varName].length : 0
      };
      return status;
    }, {} as Record<string, { exists: boolean, length: number }>);
    
    // Check if all required variables are set
    const allVarsExist = Object.values(envStatus).every(status => status.exists);
    
    // Get the URL structure (without revealing credentials)
    let urlStructure = null;
    if (process.env.POSTGRES_URL) {
      try {
        const url = new URL(process.env.POSTGRES_URL);
        urlStructure = {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          searchParams: Object.fromEntries(url.searchParams.entries())
        };
      } catch (urlError) {
        urlStructure = { error: 'Invalid URL format' };
      }
    }
    
    return NextResponse.json({
      success: allVarsExist,
      message: allVarsExist 
        ? 'All required environment variables are set' 
        : 'Some required environment variables are missing',
      envStatus,
      urlStructure,
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check environment variables',
      details: (error as Error).message
    }, { status: 500 });
  }
} 