import express, { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import emailService from '../../services/emailService';

const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/billing/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    let event: any;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});

// Webhook handlers
async function handleSubscriptionCreated(subscription: any) {
    try {
        const existingSub = await prisma.subscription.findFirst({
          where: { externalId: subscription.id },
          select: { id: true }
        });

        if (existingSub) {
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date()
              }
            });
        }
    } catch (error) {
        console.error('Handle subscription created error:', error);
    }
}

async function handleSubscriptionUpdated(subscription: any) {
    try {
        await prisma.subscription.updateMany({
          where: { externalId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            metadata: {
              cancelAtPeriodEnd: subscription.cancel_at_period_end
            },
            updatedAt: new Date()
          }
        });
    } catch (error) {
        console.error('Handle subscription updated error:', error);
    }
}

async function handleSubscriptionDeleted(subscription: any) {
    try {
        await prisma.subscription.updateMany({
          where: { externalId: subscription.id },
          data: {
            status: 'cancelled',
            canceledAt: new Date(),
            updatedAt: new Date()
          }
        });
    } catch (error) {
        console.error('Handle subscription deleted error:', error);
    }
}

async function handlePaymentSucceeded(invoice: any) {
    try {
        const subscription = await prisma.subscription.findFirst({
          where: { externalId: invoice.subscription },
          include: {
            user: {
              select: {
                email: true,
                firstName: true
              }
            }
          }
        });

        if (subscription && subscription.user) {
            await emailService.sendEmail({
                to: subscription.user.email,
                subject: 'Payment Successful',
                template: 'payment-success',
                data: {
                    name: subscription.user.firstName,
                    amount: invoice.amount_paid / 100,
                    currency: invoice.currency,
                    planName: subscription.plan?.name || 'Subscription',
                },
            });
        }
    } catch (error) {
        console.error('Handle payment succeeded error:', error);
    }
}

async function handlePaymentFailed(invoice: any) {
    try {
        const subscription = await prisma.subscription.findFirst({
          where: { externalId: invoice.subscription },
          include: {
            user: {
              select: {
                email: true,
                firstName: true
              }
            }
          }
        });

        if (subscription && subscription.user) {
            await emailService.sendEmail({
                to: subscription.user.email,
                subject: 'Payment Failed',
                template: 'payment-failed',
                data: {
                    name: subscription.user.firstName,
                    amount: invoice.amount_due / 100,
                    currency: invoice.currency,
                    planName: subscription.plan?.name || 'Subscription',
                    retryDate: new Date(invoice.next_payment_attempt * 1000),
                },
            });
        }
    } catch (error) {
        console.error('Handle payment failed error:', error);
    }
}

export default router;
