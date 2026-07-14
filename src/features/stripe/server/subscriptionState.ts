import type { HandlerDeps, SubscriptionPayload } from './handlers/types';

export const planForSubscriptionStatus = (status: SubscriptionPayload['status']) =>
  status === 'active' || status === 'trialing' ? 'pro' : 'free';

export const currentSubscriptionIdOf = (userDoc: Record<string, unknown> | null) => {
  const value = userDoc?.stripeSubscriptionId;
  return typeof value === 'string' && value.length > 0 ? value : null;
};

export const isStaleSubscription = async (
  userDoc: Record<string, unknown> | null,
  candidate: SubscriptionPayload,
  getSubscriptionById: HandlerDeps['getSubscriptionById'],
) => {
  const currentSubscriptionId = currentSubscriptionIdOf(userDoc);
  if (!currentSubscriptionId || currentSubscriptionId === candidate.id) return false;

  const currentSubscription = await getSubscriptionById(currentSubscriptionId);
  return candidate.created <= currentSubscription.created;
};
