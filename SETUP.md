# DevSum Web Setup Guide

This guide will help you set up the DevSum web application with Supabase and Prisma for dynamic analytics.

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- PostgreSQL database (or use Supabase's hosted PostgreSQL)

## Setup Steps

### 1. Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devsum"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# GitHub API (optional, for higher rate limits)
GITHUB_TOKEN="ghp_your_token_here"

# Next.js
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 2. Database Setup

#### Option A: Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string and update `DATABASE_URL` in your `.env.local`
4. Run the database migration:

```bash
npm run db:push
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `devsum`
3. Update `DATABASE_URL` in your `.env.local`
4. Run the database migration:

```bash
npm run db:push
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Schema

The application uses two main tables:

- `cli_usage_stats`: Tracks CLI command usage
- `analytics_cache`: Caches API responses for performance

## API Endpoints

- `GET /api/analytics` - Fetches combined GitHub and usage statistics
- `POST /api/usage/track` - Tracks CLI command usage

## CLI Integration

The CLI will automatically send usage data to the web application when users run commands. Users can control this with:

```bash
devsum telemetry --status    # Check current status
devsum telemetry --enable    # Enable tracking
devsum telemetry --disable   # Disable tracking
```

## Troubleshooting

### Database Connection Issues

1. Verify your `DATABASE_URL` is correct
2. Ensure your database is running and accessible
3. Check firewall settings if using a remote database

### API Errors

1. Verify all environment variables are set correctly
2. Check that the database tables exist (run `npm run db:push`)
3. Ensure GitHub API token is valid (if using one)

### CLI Tracking Issues

1. Check that the web application is running and accessible
2. Verify the API endpoint URL in the CLI configuration
3. Check network connectivity

## Development

### Database Management

```bash
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema changes
npm run db:migrate   # Create and run migrations
```

### Building for Production

```bash
npm run build
npm start
```

## Privacy

The usage tracking is designed to be privacy-first:

- Only anonymous usage statistics are collected
- No personal data or git content is transmitted
- Users can opt out at any time
- All data is stored securely in your own database
