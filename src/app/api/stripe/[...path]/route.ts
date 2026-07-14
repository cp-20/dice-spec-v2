import { handle } from 'hono/vercel';

import { stripeApp } from '@/features/stripe/server/app';

export const POST = handle(stripeApp);
