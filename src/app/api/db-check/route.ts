import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

export async function GET() {
  try {
    console.log('Checking database connection...');
    
    // Create a new connection pool
    const db = createPool();
    
    // Check connection - using simpler queries
    const databaseInfo = await db.sql`SELECT current_database()`;
    const schemaInfo = await db.sql`SELECT current_schema()`;
    const userInfo = await db.sql`SELECT current_user`;
    
    // Check if public schema exists
    const publicSchemaExists = await db.sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'public'
      )
    `;
    
    // Check tables in public schema if it exists
    let tables = [];
    if (publicSchemaExists.rows[0].exists) {
      const tablesResult = await db.sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `;
      tables = tablesResult.rows.map(row => row.table_name);
    }
    
    // Check if scores table exists
    const scoresTableExists = await db.sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scores'
      )
    `;
    
    // Check if questions table exists
    const questionsTableExists = await db.sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'questions'
      )
    `;
    
    // Check create table permission
    const createTablePermission = await db.sql`
      SELECT has_schema_privilege(current_user, 'public', 'CREATE')
    `;
    
    return NextResponse.json({
      connection: {
        database: databaseInfo.rows[0].current_database,
        schema: schemaInfo.rows[0].current_schema,
        user: userInfo.rows[0].current_user
      },
      publicSchemaExists: publicSchemaExists.rows[0].exists,
      tables,
      scoresTableExists: scoresTableExists.rows[0].exists,
      questionsTableExists: questionsTableExists.rows[0].exists,
      createTablePermission: createTablePermission.rows[0].has_schema_privilege
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { error: 'Failed to check database', details: (error as Error).message },
      { status: 500 }
    );
  }
} 