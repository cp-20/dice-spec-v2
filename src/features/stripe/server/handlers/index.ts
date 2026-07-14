import { createCheckoutHandler } from './checkout';
import { createCustomerCreatedHandler } from './customer';
import { createInvoicePaidHandler, createInvoicePaymentFailedHandler } from './invoice';
import {
  createSubscriptionCreatedHandler,
  createSubscriptionDeletedHandler,
  createSubscriptionUpdatedHandler,
} from './subscription';
import type { HandlerDeps } from './types';

export const createStripeHandlers = (deps: HandlerDeps) => {
  return {
    handleCheckoutCompleted: createCheckoutHandler(deps),
    handleSubscriptionCreated: createSubscriptionCreatedHandler(deps),
    handleSubscriptionUpdated: createSubscriptionUpdatedHandler(deps),
    handleSubscriptionDeleted: createSubscriptionDeletedHandler(deps),
    handleCustomerCreated: createCustomerCreatedHandler(deps),
    handleInvoicePaid: createInvoicePaidHandler(deps),
    handleInvoicePaymentFailed: createInvoicePaymentFailedHandler(deps),
  };
};
