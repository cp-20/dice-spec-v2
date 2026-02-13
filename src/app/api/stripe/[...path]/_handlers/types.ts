import type Stripe from 'stripe';

type FirestoreGetter = () => FirebaseFirestore.Firestore;

export type CheckoutSessionPayload = Stripe.Checkout.Session;

export type SubscriptionPayload = Stripe.Subscription;

export type InvoicePayload = Stripe.Invoice;

export type HandlerDeps = {
  stripe: Stripe;
  getFirestoreInstance: FirestoreGetter;
};

type HandlerLogLevel = 'info' | 'success' | 'warning';

export type HandlerLog = {
  level: HandlerLogLevel;
  eventType: string;
  message: string;
  userId?: string;
  details?: Record<string, unknown>;
};

export class StripeWebhookHandlerError extends Error {
  readonly eventType: string;
  readonly userId?: string;
  readonly details?: Record<string, unknown>;
  readonly fatal: boolean;
  readonly cause?: unknown;

  constructor(params: {
    message: string;
    eventType: string;
    userId?: string;
    details?: Record<string, unknown>;
    fatal?: boolean;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = 'StripeWebhookHandlerError';
    this.eventType = params.eventType;
    this.userId = params.userId;
    this.details = params.details;
    this.fatal = params.fatal ?? false;
    this.cause = params.cause;
  }
}

export type HandlerResult =
  | {
      ok: true;
      log?: HandlerLog;
    }
  | {
      ok: false;
      error: StripeWebhookHandlerError;
    };
