import { createCheckoutHandler } from './checkout';
import { createCustomerCreatedHandler } from './customer';
import { createSubscriptionDeletedHandler, createSubscriptionUpdatedHandler } from './subscription';
import type { HandlerDeps } from './types';

export const createStripeHandlers = (deps: HandlerDeps) => {
  return {
    handleCheckoutCompleted: createCheckoutHandler(deps),
    handleSubscriptionUpdated: createSubscriptionUpdatedHandler(deps),
    handleSubscriptionDeleted: createSubscriptionDeletedHandler(deps),
    handleCustomerCreated: createCustomerCreatedHandler(deps),
  };
};
