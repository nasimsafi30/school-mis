# 🚀 School MIS Deployment Guide

## Prerequisites

- Node.js 18+
- Neon Database account (<https://neon.tech>)
- Vercel account (<https://vercel.com>)
- Git repository

## Step 1: Database Setup

1. Create a Neon database at <https://neon.tech>
2. Copy your connection string
3. Add to .env.local:
   \\\
   DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/school_mis?sslmode=require"
   \\\

## Step 2: Environment Variables

Create .env.local with:
\\\env
DATABASE_URL="your-neon-database-url"
NEXTAUTH_URL="<http://localhost:3000>"
NEXTAUTH_SECRET="your-secret-key"
RESEND_API_KEY="your-resend-key"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
\\\

## Step 3: Database Migration

\\\ash
npm run db:generate
npm run db:push
npm run db:seed
\\\

## Step 4: Deploy to Vercel

\\\ash

# Install Vercel CLI

npm i -g vercel

# Deploy

vercel

# Production deploy

vercel --prod
\\\

## Step 5: Post-Deployment

- Set environment variables in Vercel dashboard
- Configure custom domain
- Set up monitoring (Vercel Analytics)
- Create backup strategy
