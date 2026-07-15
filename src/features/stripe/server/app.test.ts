import { expect, mock, test, vi } from 'bun:test';

import * as auth from './auth';
import * as clients from './clients';
import * as logger from './logger';
import * as webhook from './webhook';

const createStripeCustomerMock = vi.fn(async () => ({ id: 'cus_1' }));
const updateUserMock = vi.fn(async () => {
  throw new Error('User not found');
});

mock.module('./auth', () => ({
  ...auth,
  getAuthenticatedUser: vi.fn(async () => ({ uid: 'user_1', name: 'User', email: 'user@example.com' })),
}));
mock.module('./clients', () => ({
  ...clients,
  getPriceId: vi.fn(() => 'price_1'),
  getStripeClient: vi.fn(async () => ({
    customers: { create: createStripeCustomerMock },
  })),
  getStripeCustomerIdByUserId: vi.fn(async () => undefined),
  getSubscriptionById: vi.fn(),
  getUserById: vi.fn(async () => null),
  updateUserById: updateUserMock,
}));
mock.module('./logger', () => ({ ...logger, scheduleStripeLog: vi.fn() }));
mock.module('./webhook', () => ({
  ...webhook,
  appendEventContext: vi.fn(),
  constructStripeEvent: vi.fn(),
  processStripeEvent: vi.fn(),
}));

test('以前は Customer 作成後に User not found になった文書不在リクエストを Stripe の前で拒否する', async () => {
  const { stripeApp } = await import('./app');
  const response = await stripeApp.request('/api/stripe/create-customer', { method: 'POST' });

  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({ error: 'User not found' });
  expect(createStripeCustomerMock).not.toHaveBeenCalled();
  expect(updateUserMock).not.toHaveBeenCalled();
});
