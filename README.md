# TinyLandlord

> Property management for landlords with 2–10 units. Never chase rent again.

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/tinylandlord.git
cd tinylandlord
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `database/schema.sql`
3. Create storage buckets: `receipts` and `leases` (Settings → Storage)

### 3. Set up Stripe
1. Create products in Stripe Dashboard:
   - Starter: $9/month recurring
   - Pro: $19/month recurring
2. Copy price IDs to `.env.local`
3. Configure webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`, `invoice.payment_failed`

### 4. Set up Twilio (for SMS)
1. Get a Twilio account + phone number
2. Add credentials to `.env.local`

### 5. Set up Resend (for email)
1. Create account at [resend.com](https://resend.com)
2. Add API key to `.env.local`
3. Update `FROM_EMAIL` in `lib/resend.ts`

### 6. Set up Groq (for AI messages — Pro tier)
1. Get API key at [console.groq.com](https://console.groq.com)
2. Add to `.env.local`

### 7. Environment Variables
```bash
cp .env.local.example .env.local
# Fill in all values
```

### 8. Run locally
```bash
npm run dev
```

### 9. Deploy to Vercel
```bash
npx vercel --prod
```
Add all environment variables in Vercel Dashboard → Settings → Environment Variables.

### 10. Set up GitHub Actions (Cron)
Add these secrets to your GitHub repo:
- `APP_URL`: your production URL
- `CRON_SECRET`: same value as in `.env.local`

## Subscription Tiers

| Feature | Free | Starter ($9) | Pro ($19) |
|---------|------|--------------|-----------|
| Properties | 1 | 5 | Unlimited |
| Email reminders | ✓ | ✓ | ✓ |
| SMS reminders | — | ✓ | ✓ |
| Late fee automation | — | ✓ | ✓ |
| Expense tracking | — | ✓ | ✓ |
| AI messages | — | — | ✓ |
| WhatsApp | — | — | ✓ |
| PDF reports | — | — | ✓ |

## Architecture

- **Frontend**: Next.js 14 App Router + TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth
- **Payments**: Stripe Subscriptions
- **SMS**: Twilio
- **Email**: Resend
- **AI**: Groq (Mixtral)
- **Cron**: GitHub Actions (daily at 9 AM UTC)
- **Hosting**: Vercel

## Key Files

```
app/
  page.tsx                          — Landing page
  (auth)/login|register/page.tsx    — Auth pages
  (dashboard)/dashboard/page.tsx    — Main dashboard
  api/cron/rent-reminders/route.ts  — Daily reminder cron
  api/stripe/webhook/route.ts       — Stripe webhook handler
lib/
  supabase.ts    — Database client
  stripe.ts      — Payment logic
  twilio.ts      — SMS helpers
  resend.ts      — Email helpers
database/
  schema.sql     — Full DB schema with RLS
```

## Security
- All routes protected via middleware
- RLS policies prevent cross-user data access
- Stripe webhooks verified with signature
- File uploads validated (type + size)
- Environment variables never exposed client-side

## License
MIT
