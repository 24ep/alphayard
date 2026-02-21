import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { UserModel } from '../../models/UserModel';
import { authenticateToken } from '../../middleware/auth';

const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Validation middleware
const validateSubscription = [
    body('planId').notEmpty(),
    body('paymentMethodId').optional().notEmpty(),
];

// @route   POST /api/billing/subscription
// @desc    Create new subscription
// @access  Private
router.post('/', authenticateToken as any, validateSubscription, async (req: any, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { planId, paymentMethodId, circleId, trialDays, seats = 1, coupon } = req.body;
        const userId = req.user.id;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user already has an active subscription
        const existingSub = await prisma.subscription.findFirst({
          where: {
            userId,
            status: {
              in: ['active', 'trialing']
            }
          },
          select: { id: true }
        });

        if (existingSub) {
            return res.status(400).json({ message: 'User already has an active subscription' });
        }

        // Get plan details from Stripe
        const plan = await stripe.plans.retrieve(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Create or get Stripe customer
        let stripeCustomerId = user.metadata?.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                metadata: { userId: user.id.toString() },
            });

            stripeCustomerId = customer.id;
            await UserModel.findByIdAndUpdate(userId, { stripeCustomerId });
        }

        // Attach payment method if provided
        if (paymentMethodId) {
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: stripeCustomerId,
            });

            await stripe.customers.update(stripeCustomerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: planId, quantity: Math.max(1, Number(seats) || 1) }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            trial_period_days: trialDays ? Number(trialDays) : undefined,
            coupon: coupon || undefined,
            metadata: {
                userId: user.id.toString(),
                circleId: circleId || (user.circleIds && user.circleIds[0]) || '',
                seats: String(Math.max(1, Number(seats) || 1)),
            },
        });

        // Create subscription record in database
        const subscriptionRecord = await prisma.subscription.create({
          data: {
            userId,
            applicationId: null, // Would need to be determined
            planId: null, // Would need to find or create plan record
            status: subscription.status,
            billingCycle: plan.interval,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            externalId: subscription.id,
            metadata: {
              stripeCustomerId,
              circleId: circleId || (user.circleIds && user.circleIds[0]) || null,
              planDetails: {
                id: plan.id,
                name: plan.nickname,
                price: plan.amount / 100,
                currency: plan.currency,
                interval: plan.interval,
                intervalCount: plan.interval_count,
              },
              cancelAtPeriodEnd: subscription.cancel_at_period_end
            }
          }
        });

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription: {
                id: subscriptionRecord.id,
                status: subscriptionRecord.status,
                plan: subscriptionRecord.plan,
                currentPeriodEnd: subscriptionRecord.current_period_end,
                circleId: subscriptionRecord.circle_id,
            },
            clientSecret: subscription.latest_invoice.payment_intent?.client_secret,
        });
    } catch (error: any) {
        console.error('Create subscription error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/billing/subscription
// @desc    Get current subscription
// @access  Private
router.get('/', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        const subscription = await prisma.subscription.findFirst({
          where: {
            userId,
            status: {
              in: ['active', 'trialing', 'past_due']
            }
          },
          include: {
            plan: true
          }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        const sub = subscription;
        res.json({ 
            subscription: {
                id: sub.id,
                userId: sub.userId,
                planId: sub.planId,
                plan: sub.plan,
                status: sub.status,
                billingCycle: sub.billingCycle,
                currentPeriodStart: sub.currentPeriodStart,
                currentPeriodEnd: sub.currentPeriodEnd,
                externalId: sub.externalId,
                metadata: sub.metadata,
                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt
            }
        });
    } catch (error: any) {
        console.error('Get subscription error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/billing/subscription/:id
// @desc    Update subscription
// @access  Private
router.put('/:id?', authenticateToken as any, [
    body('planId').notEmpty(),
], async (req: any, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { planId, seats } = req.body;
        const userId = req.user.id;

        const subscription = await prisma.subscription.findFirst({
          where: {
            userId,
            status: {
              in: ['active', 'trialing']
            }
          }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        // Update subscription in Stripe
        const current = await stripe.subscriptions.retrieve(subscription.externalId);
        const itemId = current.items.data[0]?.id;
        const updatedSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            items: [ itemId 
                ? { id: itemId, price: planId, quantity: seats ? Math.max(1, Number(seats)) : current.items.data[0]?.quantity || 1 } 
                : { price: planId, quantity: seats ? Math.max(1, Number(seats)) : 1 } 
            ],
            proration_behavior: 'create_prorations',
            metadata: {
                ...(current.metadata || {}),
                seats: String(seats ? Math.max(1, Number(seats)) : (current.metadata?.seats || current.items.data[0]?.quantity || 1)),
            }
        });

        const plan = await stripe.plans.retrieve(planId);
        const planData = {
            id: plan.id,
            name: plan.nickname,
            price: plan.amount / 100,
            currency: plan.currency,
            interval: plan.interval,
            intervalCount: plan.interval_count,
        };

        const sub = await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            billingCycle: plan.interval,
            currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
            metadata: {
              ...subscription.metadata,
              planDetails: planData
            }
          }
        });
        res.json({
            message: 'Subscription updated successfully',
            subscription: {
                id: sub.id,
                planId: sub.planId,
                plan: sub.plan,
                currentPeriodStart: sub.currentPeriodStart,
                currentPeriodEnd: sub.currentPeriodEnd,
                status: sub.status,
                billingCycle: sub.billingCycle
            },
        });
    } catch (error: any) {
        console.error('Update subscription error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/billing/subscription/:id/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/:id/cancel', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        const activeSubscription = await prisma.subscription.findFirst({
            where: {
              userId: userId,
              status: { in: ['active', 'trialing'] }
            }
          });

        if (!activeSubscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        await stripe.subscriptions.update(activeSubscription.stripe_subscription_id, {
            cancel_at_period_end: true,
        });

        const sub = await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                canceledAt: new Date(),
                metadata: {
                    ...activeSubscription.metadata,
                    cancelAtPeriodEnd: true
                },
                updatedAt: new Date()
            }
        });
        res.json({
            message: 'Subscription will be cancelled at the end of the current period',
            subscription: {
                id: sub.id,
                cancelAtPeriodEnd: (sub.metadata as any)?.cancelAtPeriodEnd || false,
                status: sub.status
            },
        });
    } catch (error: any) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/billing/subscription/:id/reactivate
// @desc    Reactivate cancelled subscription
// @access  Private
router.post('/:id/reactivate', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const subscriptionId = req.params.id;

        let cancelledSubscription: any;
        if (subscriptionId && subscriptionId !== 'current' && subscriptionId !== ':id') {
            cancelledSubscription = await prisma.subscription.findFirst({
                where: { id: subscriptionId, userId: userId }
            });
        } else {
            cancelledSubscription = await prisma.subscription.findFirst({
                where: {
                    userId: userId,
                    status: { in: ['active', 'trialing'] },
                    canceledAt: { not: null }
                }
            });
        }

        if (!cancelledSubscription) {
            return res.status(404).json({ message: 'No cancelled subscription found' });
        }

        await stripe.subscriptions.update(cancelledSubscription.externalId, {
            cancel_at_period_end: false,
        });

        const sub = await prisma.subscription.update({
            where: { id: cancelledSubscription.id },
            data: {
                canceledAt: null,
                metadata: {
                    ...cancelledSubscription.metadata,
                    cancelAtPeriodEnd: false
                },
                updatedAt: new Date()
            }
        });
        res.json({
            message: 'Subscription reactivated successfully',
            subscription: {
                id: sub.id,
                cancelAtPeriodEnd: (sub.metadata as any)?.cancelAtPeriodEnd || false,
                status: sub.status
            },
        });
    } catch (error: any) {
        console.error('Reactivate subscription error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
