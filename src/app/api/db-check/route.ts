import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

export async function GET() {
  try {
    console.log('Checking database connection...');
    
    // Create a new connection pool
    const db = createPool();
    
    // Check connection
    const connectionInfo = await db.sql`
      SELECT 
        current_database() as database,
        current_schema() as schema,
        current_user as user
    `;
    
    // Check available schemas
    const schemas = await db.sql`
      SELECT schema_name
      FROM information_schema.schemata
      ORDER BY schema_name
    `;
    
    // Check tables in public schema
    const tables = await db.sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    // Check permissions
    const permissions = await db.sql`
      SELECT 
        grantee, 
        table_schema, 
        table_name, 
        privilege_type
      FROM information_schema.table_privileges
      WHERE table_schema = 'public'
      ORDER BY table_name, privilege_type
    `;
    
    return NextResponse.json({
      connection: connectionInfo.rows[0],
      schemas: schemas.rows.map(row => row.schema_name),
      tables: tables.rows.map(row => row.table_name),
      permissions: permissions.rows
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { error: 'Failed to check database', details: (error as Error).message },
      { status: 500 }
    );
  }
} 