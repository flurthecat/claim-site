# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Flur Token Claim Site** - a SvelteKit web application that allows users to connect their Phantom wallet and claim allocated tokens. The site integrates with Supabase for data persistence and Solana Web3 for wallet connectivity.

## Tech Stack

- **Framework**: SvelteKit 2 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Solana (using @solana/web3.js)
- **Deployment**: Vercel (via @sveltejs/adapter-vercel)
- **Styling**: Component-scoped CSS
- **Icons**: phosphor-svelte

## Development Commands

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
```

## Application Architecture

### Core Components

- **Main Page** (`src/routes/+page.svelte`): Single-page application handling wallet connection, allocation lookup, and claim functionality
- **Database Layer** (`src/lib/getAllocation.ts`): Contains `AllocationRow` interface and functions for querying/updating claims
- **Supabase Client** (`src/lib/supabase.ts`): Database connection setup using public environment variables

### Data Flow

1. User connects Phantom wallet → wallet address stored in Svelte store
2. Wallet address change triggers allocation lookup via `getAllocation()`
3. If allocation exists and unclaimed, user can execute claim via `markClaimed()`
4. Claim updates database and UI state reactively through Svelte stores

### Database Schema

The application expects a `flur_claims` table with:
- `wallet_address` (string, primary key)
- `allocation_amount` (number)
- `tokens_qualified_for` (string)
- `claimed` (boolean)
- `claimed_at` (timestamp, nullable)

### Environment Variables

Required in `.env` or deployment environment:
- `PUBLIC_SUPABASE_URL`: Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

### Key Implementation Details

- Uses browser-only wallet detection (`window.solana`)
- Reactive state management with Svelte stores (`walletAddress`, `allocation`, `loading`, `message`)
- Single-page application with no routing beyond the main claim interface
- TypeScript interfaces ensure type safety for database operations
- Error handling covers wallet connection, database queries, and claim processing

## Deployment Notes

- Configured for Vercel deployment with serverless functions
- Uses SvelteKit's static adapter configuration in `svelte.config.js`
- Build process: `svelte-kit sync && vite build`