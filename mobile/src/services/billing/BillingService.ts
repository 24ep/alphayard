import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

export interface Subscription {
  id: string;
  userId: string;
  familyId: string;
  plan: 'free' | 'basic' | 'premium' | 'hourse';
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'past_due';
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  autoRenew: boolean;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    familyMembers: number;
    storage: number; // in GB
    apiCalls: number;
    customFeatures: number;
  };
  usage: {
    familyMembers: number;
    storageUsed: number;
    apiCallsUsed: number;
    customFeaturesUsed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidDate?: Date;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  pdfUrl?: string;
  createdAt: Date;
}

export interface BillingHistory {
  invoices: Invoice[];
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: Date;
  }>;
  refunds: Array<{
    id: string;
    amount: number;
    currency: string;
    reason: string;
    date: Date;
  }>;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: Array<{
    name: string;
    description: string;
    included: boolean;
    limit?: number;
  }>;
  limits: {
    familyMembers: number;
    storage: number;
    apiCalls: number;
    customFeatures: number;
  };
  popular: boolean;
  recommended: boolean;
}

class BillingService {
  async getSubscription(userId: string, familyId: string): Promise<Subscription> {
    try {
      const response = await apiClient.get(`/billing/subscription?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      throw error;
    }
  }

  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    try {
      const response = await apiClient.post('/billing/subscription', subscription);
      
      analyticsService.trackEvent('subscription_created', {
        plan: subscription.plan,
        billingCycle: subscription.billingCycle,
        amount: subscription.amount,
        userId: subscription.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    try {
      const response = await apiClient.put(`/billing/subscription/${subscriptionId}`, updates);
      
      analyticsService.trackEvent('subscription_updated', {
        subscriptionId,
        plan: updates.plan,
        status: updates.status
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`/billing/subscription/${subscriptionId}/cancel`, { reason });
      
      analyticsService.trackEvent('subscription_cancelled', {
        subscriptionId,
        reason
      });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/billing/subscription/${subscriptionId}/reactivate`);
      
      analyticsService.trackEvent('subscription_reactivated', {
        subscriptionId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get(`/billing/payment-methods?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post('/billing/payment-methods', paymentMethod);
      
      analyticsService.trackEvent('payment_method_added', {
        type: paymentMethod.type,
        userId: paymentMethod.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  }

  async updatePaymentMethod(paymentMethodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      const response = await apiClient.put(`/billing/payment-methods/${paymentMethodId}`, updates);
      
      analyticsService.trackEvent('payment_method_updated', {
        paymentMethodId,
        isDefault: updates.isDefault
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.delete(`/billing/payment-methods/${paymentMethodId}`);
      
      analyticsService.trackEvent('payment_method_deleted', {
        paymentMethodId
      });
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.post(`/billing/payment-methods/${paymentMethodId}/default`);
      
      analyticsService.trackEvent('default_payment_method_set', {
        paymentMethodId
      });
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw error;
    }
  }

  async getInvoices(userId: string, page: number = 1, limit: number = 20): Promise<{
    invoices: Invoice[];
    totalPages: number;
    currentPage: number;
    totalInvoices: number;
  }> {
    try {
      const response = await apiClient.get(`/billing/invoices?userId=${userId}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get invoices:', error);
      throw error;
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get(`/billing/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get invoice:', error);
      throw error;
    }
  }

  async downloadInvoice(invoiceId: string): Promise<string> {
    try {
      const response = await apiClient.get(`/billing/invoices/${invoiceId}/download`);
      
      analyticsService.trackEvent('invoice_downloaded', {
        invoiceId
      });
      
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Failed to download invoice:', error);
      throw error;
    }
  }

  async getBillingHistory(userId: string, months: number = 12): Promise<BillingHistory> {
    try {
      const response = await apiClient.get(`/billing/history?userId=${userId}&months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get billing history:', error);
      throw error;
    }
  }

  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const response = await apiClient.get('/billing/pricing-plans');
      return response.data;
    } catch (error) {
      console.error('Failed to get pricing plans:', error);
      throw error;
    }
  }

  async upgradeSubscription(subscriptionId: string, newPlan: string): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/billing/subscription/${subscriptionId}/upgrade`, {
        newPlan
      });
      
      analyticsService.trackEvent('subscription_upgraded', {
        subscriptionId,
        newPlan
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  }

  async downgradeSubscription(subscriptionId: string, newPlan: string): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/billing/subscription/${subscriptionId}/downgrade`, {
        newPlan
      });
      
      analyticsService.trackEvent('subscription_downgraded', {
        subscriptionId,
        newPlan
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to downgrade subscription:', error);
      throw error;
    }
  }

  async changeBillingCycle(subscriptionId: string, newCycle: 'monthly' | 'yearly'): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/billing/subscription/${subscriptionId}/billing-cycle`, {
        newCycle
      });
      
      analyticsService.trackEvent('billing_cycle_changed', {
        subscriptionId,
        newCycle
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to change billing cycle:', error);
      throw error;
    }
  }

  async getUsageStats(userId: string, familyId: string): Promise<{
    familyMembers: {
      current: number;
      limit: number;
      percentage: number;
    };
    storage: {
      current: number;
      limit: number;
      percentage: number;
    };
    apiCalls: {
      current: number;
      limit: number;
      percentage: number;
    };
    customFeatures: {
      current: number;
      limit: number;
      percentage: number;
    };
  }> {
    try {
      const response = await apiClient.get(`/billing/usage?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      throw error;
    }
  }

  async requestRefund(invoiceId: string, reason: string): Promise<{
    refundId: string;
    status: 'pending' | 'approved' | 'rejected';
    estimatedProcessing: Date;
  }> {
    try {
      const response = await apiClient.post(`/billing/invoices/${invoiceId}/refund`, { reason });
      
      analyticsService.trackEvent('refund_requested', {
        invoiceId,
        reason
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to request refund:', error);
      throw error;
    }
  }

  async getRefundStatus(refundId: string): Promise<{
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    amount: number;
    reason: string;
    processedDate?: Date;
  }> {
    try {
      const response = await apiClient.get(`/billing/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get refund status:', error);
      throw error;
    }
  }

  async createPaymentIntent(amount: number, currency: string, paymentMethodId: string): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    try {
      const response = await apiClient.post('/billing/payment-intent', {
        amount,
        currency,
        paymentMethodId
      });
      
      analyticsService.trackEvent('payment_intent_created', {
        amount,
        currency
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<{
    status: 'succeeded' | 'failed' | 'requires_action';
    transactionId: string;
  }> {
    try {
      const response = await apiClient.post(`/billing/payment-intent/${paymentIntentId}/confirm`);
      
      analyticsService.trackEvent('payment_confirmed', {
        paymentIntentId,
        status: response.data.status
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      throw error;
    }
  }
}

export const billingService = new BillingService(); 