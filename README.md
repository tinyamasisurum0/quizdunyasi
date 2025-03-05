# Quiz Dünyası - Next.js Quiz Application

A modern quiz application built with Next.js, TypeScript, and Vercel Postgres.

## Features

- Server-side rendering with Next.js App Router
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Database integration with Vercel Postgres
- Multiple quiz categories
- Timer-based questions
- Leaderboard functionality
- Score tracking and submission

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Vercel account (for Postgres database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quizdunyasi-next.git
cd quizdunyasi-next
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
POSTGRES_URL="your-postgres-connection-string"
POSTGRES_PRISMA_URL="your-postgres-prisma-connection-string"
POSTGRES_URL_NON_POOLING="your-postgres-non-pooling-connection-string"
POSTGRES_USER="your-postgres-user"
POSTGRES_HOST="your-postgres-host"
POSTGRES_PASSWORD="your-postgres-password"
POSTGRES_DATABASE="your-postgres-database"
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The easiest way to deploy this application is using Vercel:

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Set up the environment variables in the Vercel dashboard.
4. Deploy!

## Project Structure

- `src/app`: Next.js App Router pages and API routes
- `src/components`: Reusable React components
- `src/lib`: Utility functions and database connection
- `src/types`: TypeScript type definitions
- `public/questions`: JSON files containing quiz questions

## Database Schema

The application uses a simple database schema with a single table:

- `scores`: Stores user scores
  - `id`: UUID primary key
  - `username`: User's name
  - `score`: User's score
  - `category`: Quiz category
  - `created_at`: Timestamp

## Database Setup

This application uses PostgreSQL for storing questions and scores. You can use any PostgreSQL provider, such as Supabase, Neon, or your own PostgreSQL server.

### Local Development

1. Create a `.env.local` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
```

2. Start the development server:

```bash
npm run dev
```

### Vercel Deployment

When deploying to Vercel, you need to set up the database connection:

1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add the following environment variable:
   - Key: `DATABASE_URL` or `POSTGRES_URL`
   - Value: Your PostgreSQL connection string (e.g., `postgresql://username:password@hostname:port/database`)

#### Troubleshooting Database Connection on Vercel

If you encounter database connection issues on Vercel, try the following:

1. **Check environment variables**: Make sure `DATABASE_URL` or `POSTGRES_URL` is correctly set in your Vercel project settings.

2. **SSL Configuration**: Most PostgreSQL providers require SSL connections. The application is configured to handle SSL connections automatically, including self-signed certificates.

3. **IP Restrictions**: If your database has IP restrictions, you need to allow Vercel's IP ranges.
   - For Supabase: Go to your project settings, navigate to "Database" > "Connection Pooling", and add Vercel's IP ranges.

4. **Connection String Format**: Make sure your connection string is properly formatted:
   ```
   postgresql://username:password@hostname:port/database
   ```

5. **Database Initialization**: After deployment, visit the admin page (`/admin`) and click "Initialize Database" to create the necessary tables.

6. **Dynamic API Routes**: If you're seeing errors about dynamic server usage, make sure all your API routes have `export const dynamic = 'force-dynamic'` at the top of the file.

7. **Client Components with useSearchParams**: If you're using `useSearchParams` in client components, make sure they're wrapped in a Suspense boundary.

## Admin Interface

The application includes an admin interface for managing the database:

- **Admin Dashboard**: `/admin`
- **Database Statistics**: `/admin/db-stats`
- **Database Management**: `/admin/db-manage`
- **Test Database Questions**: `/admin/test-db`

### Database Management

The Database Management page (`/admin/db-manage`) allows you to:

- Execute SQL queries directly against the database
- Use predefined queries for common operations
- Delete specific questions or entire categories
- Find questions by content
- Reset or recreate tables

## API Routes

The application provides several API routes for interacting with the database:

- `/api/questions`: Get questions (with optional database source)
- `/api/db-questions`: Get questions directly from the database
- `/api/direct-sql`: Execute SQL queries directly
- `/api/init-db`: Initialize the database tables
- `/api/import-questions`: Import questions from JSON files to the database

## License

This project is licensed under the MIT License - see the LICENSE file for details.
