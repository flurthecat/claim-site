# Flur Token Claim Site

A modern SvelteKit application that allows users to connect their Phantom wallet and claim allocated Flur tokens.

## Features

- 🔗 **Phantom Wallet Integration** - Secure wallet connection
- 💾 **Supabase Database** - Token allocation lookup and claim tracking  
- 🎨 **Modern UI** - Responsive design with gradient styling
- 📱 **Mobile Friendly** - Works across all devices
- ⚡ **Static Build** - Optimized for Vercel deployment

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flur_claim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials to `.env`:
   ```
   VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Database Schema**
   
   Create a `flur_claims` table in Supabase with:
   - `wallet_address` (text, primary key)
   - `allocation_amount` (numeric)
   - `tokens_qualified_for` (text)
   - `claimed` (boolean, default: false)
   - `claimed_at` (timestamp, nullable)

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This app is configured for automatic deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Tech Stack

- **SvelteKit** - Full-stack framework
- **TypeScript** - Type safety
- **Supabase** - Database and API
- **Solana Web3.js** - Blockchain integration
- **Phosphor Icons** - Modern iconography
- **Vite** - Build tool

## License

MIT