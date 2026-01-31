import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Icon, Badge, Progress, Divider } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { billingService } from '../../services/billing/BillingService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface BillingScreenProps {
  route?: {
    params?: {
      showUpgrade?: boolean;
    };
  };
}

const BillingScreen: React.FC<BillingScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { user, Circle } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      if (user && Circle) {
        const [sub, payments, invs, plans, usage] = await Promise.all([
          billingService.getSubscription(user.id, Circle.id),
          billingService.getPaymentMethods(user.id),
          billingService.getInvoices(user.id, 1, 10),
          billingService.getPricingPlans(),
          billingService.getUsageStats(user.id, Circle.id)
        ]);
        
        setSubscription(sub);
        setPaymentMethods(payments);
        setInvoices(invs.invoices);
        setPricingPlans(plans);
        setUsageStats(usage);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
      Alert.alert('Error', 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBillingData();
    setRefreshing(false);
  };

  const handleUpgradePlan = (plan: any) => {
    Alert.alert(
      'Upgrade Plan',
      `Are you sure you want to upgrade to ${plan.name} for $${plan.price}/${plan.billingCycle}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            try {
              if (subscription) {
                await billingService.upgradeSubscription(subscription.id, plan.id);
                await loadBillingData();
                Alert.alert('Success', 'Plan upgraded successfully!');
                
                analyticsService.trackEvent('subscription_upgraded', {
                  fromPlan: subscription.plan,
                  toPlan: plan.name,
                  price: plan.price
                });
              }
            } catch (error) {
              console.error('Failed to upgrade plan:', error);
              Alert.alert('Error', 'Failed to upgrade plan');
            }
          }
        }
      ]
    );
  };

  const handleDowngradePlan = (plan: any) => {
    Alert.alert(
      'Downgrade Plan',
      `Are you sure you want to downgrade to ${plan.name}? This will take effect at the end of your current billing period.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Downgrade',
          onPress: async () => {
            try {
              if (subscription) {
                await billingService.downgradeSubscription(subscription.id, plan.id);
                await loadBillingData();
                Alert.alert('Success', 'Plan downgraded successfully!');
                
                analyticsService.trackEvent('subscription_downgraded', {
                  fromPlan: subscription.plan,
                  toPlan: plan.name,
                  price: plan.price
                });
              }
            } catch (error) {
              console.error('Failed to downgrade plan:', error);
              Alert.alert('Error', 'Failed to downgrade plan');
            }
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              if (subscription) {
                await billingService.cancelSubscription(subscription.id, 'User requested cancellation');
                await loadBillingData();
                Alert.alert('Success', 'Subscription cancelled successfully!');
                
                analyticsService.trackEvent('subscription_cancelled', {
                  plan: subscription.plan,
                  reason: 'User requested cancellation'
                });
              }
            } catch (error) {
              console.error('Failed to cancel subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          }
        }
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddPaymentMethod');
  };

  const handleViewInvoice = (invoice: any) => {
    navigation.navigate('InvoiceDetails', { invoiceId: invoice.id });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return '#FFD700';
      case 'Circle':
        return '#4CAF50';
      case 'basic':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#F44336';
    if (percentage >= 75) return '#FF9800';
    return '#4CAF50';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Box style={styles.header}>
        <HStack space={3} alignItems="center" flex={1}>
          <Icon
            as={MaterialCommunityIcons}
            name="arrow-left"
            size="lg"
            color="primary.500"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Billing & Subscription</Text>
        </HStack>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Icon
            as={MaterialCommunityIcons}
            name="refresh"
            size="md"
            color="primary.500"
          />
        </TouchableOpacity>
      </Box>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Subscription */}
        {subscription && (
          <Box style={styles.section}>
            <Text style={styles.sectionTitle}>Current Plan</Text>
            <Box style={styles.subscriptionCard}>
              <HStack space={3} alignItems="center" marginBottom={4}>
                <Box
                  style={[
                    styles.planIcon,
                    { backgroundColor: getPlanColor(subscription.plan) }
                  ]}
                >
                  <Icon
                    as={MaterialCommunityIcons}
                    name="crown"
                    size="md"
                    color="white"
                  />
                </Box>
                <VStack flex={1}>
                  <HStack space={2} alignItems="center" marginBottom={2}>
                    <Text style={styles.planName}>
                      {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                    </Text>
                    <Badge
                      colorScheme={subscription.status === 'active' ? 'green' : 'red'}
                      rounded="full"
                      variant="solid"
                    >
                      {subscription.status}
                    </Badge>
                  </HStack>
                  <Text style={styles.planPrice}>
                    ${subscription.amount}/{subscription.billingCycle}
                  </Text>
                  <Text style={styles.planDate}>
                    Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>

              <HStack space={2}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('SubscriptionSettings')}
                >
                  <Icon
                    as={MaterialCommunityIcons}
                    name="settings"
                    size="sm"
                    color="primary.500"
                  />
                  <Text style={styles.actionText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCancelSubscription}
                >
                  <Icon
                    as={MaterialCommunityIcons}
                    name="cancel"
                    size="sm"
                    color="red.500"
                  />
                  <Text style={[styles.actionText, { color: '#F44336' }]}>Cancel</Text>
                </TouchableOpacity>
              </HStack>
            </Box>
          </Box>
        )}

        {/* Usage Stats */}
        {usageStats && (
          <Box style={styles.section}>
            <Text style={styles.sectionTitle}>Usage</Text>
            <VStack space={3}>
              <Box style={styles.usageItem}>
                <HStack space={3} alignItems="center" marginBottom={2}>
                  <Icon
                    as={MaterialCommunityIcons}
                    name="account-group"
                    size="md"
                    color="primary.500"
                  />
                  <VStack flex={1}>
                    <Text style={styles.usageLabel}>Circle Members</Text>
                    <Text style={styles.usageValue}>
                      {usageStats.circleMembers.current} / {usageStats.circleMembers.limit}
                    </Text>
                  </VStack>
                </HStack>
                <Progress
                  value={getUsagePercentage(usageStats.circleMembers.current, usageStats.circleMembers.limit)}
                  colorScheme={getUsageColor(getUsagePercentage(usageStats.circleMembers.current, usageStats.circleMembers.limit)) === '#F44336' ? 'red' : 'green'}
                  size="sm"
                />
              </Box>

              <Box style={styles.usageItem}>
                <HStack space={3} alignItems="center" marginBottom={2}>
                  <Icon
                    as={MaterialCommunityIcons}
                    name="cloud"
                    size="md"
                    color="primary.500"
                  />
                  <VStack flex={1}>
                    <Text style={styles.usageLabel}>Storage</Text>
                    <Text style={styles.usageValue}>
                      {Math.round(usageStats.storage.current / 1024)}GB / {Math.round(usageStats.storage.limit / 1024)}GB
                    </Text>
                  </VStack>
                </HStack>
                <Progress
                  value={getUsagePercentage(usageStats.storage.current, usageStats.storage.limit)}
                  colorScheme={getUsageColor(getUsagePercentage(usageStats.storage.current, usageStats.storage.limit)) === '#F44336' ? 'red' : 'green'}
                  size="sm"
                />
              </Box>
            </VStack>
          </Box>
        )}

        {/* Payment Methods */}
        <Box style={styles.section}>
          <HStack space={3} alignItems="center" marginBottom={12}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity onPress={handleAddPaymentMethod}>
              <Icon
                as={MaterialCommunityIcons}
                name="plus-circle"
                size="md"
                color="primary.500"
              />
            </TouchableOpacity>
          </HStack>

          {paymentMethods.length > 0 ? (
            <VStack space={2}>
              {paymentMethods.map((method) => (
                <Box key={method.id} style={styles.paymentMethodCard}>
                  <HStack space={3} alignItems="center">
                    <Icon
                      as={MaterialCommunityIcons}
                      name={method.type === 'card' ? 'credit-card' : 'bank'}
                      size="md"
                      color="primary.500"
                    />
                    <VStack flex={1}>
                      <Text style={styles.paymentMethodName}>
                        {method.type === 'card' ? `${method.brand} •••• ${method.last4}` : 'Bank Account'}
                      </Text>
                      <Text style={styles.paymentMethodExpiry}>
                        {method.type === 'card' ? `Expires ${method.expiryMonth}/${method.expiryYear}` : 'Direct Debit'}
                      </Text>
                    </VStack>
                    {method.isDefault && (
                      <Badge colorScheme="green" rounded="full" variant="solid">
                        Default
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <EmptyState
              icon="credit-card-outline"
              title="No payment methods"
              subtitle="Add a payment method to manage your subscription"
              actionText="Add Payment Method"
              onAction={handleAddPaymentMethod}
            />
          )}
        </Box>

        {/* Recent Invoices */}
        <Box style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          {invoices.length > 0 ? (
            <VStack space={2}>
              {invoices.slice(0, 5).map((invoice) => (
                <TouchableOpacity
                  key={invoice.id}
                  style={styles.invoiceCard}
                  onPress={() => handleViewInvoice(invoice)}
                >
                  <HStack space={3} alignItems="center">
                    <Icon
                      as={MaterialCommunityIcons}
                      name="file-document"
                      size="md"
                      color="primary.500"
                    />
                    <VStack flex={1}>
                      <Text style={styles.invoiceNumber}>Invoice #{invoice.id.slice(-8)}</Text>
                      <Text style={styles.invoiceDate}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <VStack alignItems="flex-end">
                      <Text style={styles.invoiceAmount}>${invoice.total}</Text>
                      <Badge
                        colorScheme={invoice.status === 'paid' ? 'green' : 'orange'}
                        rounded="full"
                        variant="solid"
                      >
                        {invoice.status}
                      </Badge>
                    </VStack>
                  </HStack>
                </TouchableOpacity>
              ))}
            </VStack>
          ) : (
            <EmptyState
              icon="file-document-outline"
              title="No invoices"
              subtitle="Your invoices will appear here"
            />
          )}
        </Box>

        {/* Available Plans */}
        <Box style={styles.section}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          <VStack space={3}>
            {pricingPlans.map((plan) => (
              <Box key={plan.id} style={styles.planCard}>
                <HStack space={3} alignItems="center" marginBottom={4}>
                  <Box
                    style={[
                      styles.planIcon,
                      { backgroundColor: getPlanColor(plan.name.toLowerCase()) }
                    ]}
                  >
                    <Icon
                      as={MaterialCommunityIcons}
                      name={plan.popular ? 'star' : 'package-variant'}
                      size="md"
                      color="white"
                    />
                  </Box>
                  <VStack flex={1}>
                    <HStack space={2} alignItems="center" marginBottom={2}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {plan.popular && (
                        <Badge colorScheme="yellow" rounded="full" variant="solid">
                          Popular
                        </Badge>
                      )}
                    </HStack>
                    <Text style={styles.planPrice}>
                      ${plan.price}/{plan.billingCycle}
                    </Text>
                    <Text style={styles.planFeatures}>
                      {plan.features.filter(f => f.included).slice(0, 3).map(f => f.name).join(' • ')}
                    </Text>
                  </VStack>
                </HStack>

                <TouchableOpacity
                  style={[
                    styles.planButton,
                    subscription?.plan === plan.name.toLowerCase() && styles.currentPlanButton
                  ]}
                  onPress={() => {
                    if (subscription?.plan === plan.name.toLowerCase()) {
                      Alert.alert('Current Plan', 'You are already on this plan');
                    } else if (subscription?.plan === 'premium' && plan.name.toLowerCase() === 'basic') {
                      handleDowngradePlan(plan);
                    } else {
                      handleUpgradePlan(plan);
                    }
                  }}
                >
                  <Text style={[
                    styles.planButtonText,
                    subscription?.plan === plan.name.toLowerCase() && styles.currentPlanButtonText
                  ]}>
                    {subscription?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </Box>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  subscriptionCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  planPrice: {
    fontSize: 16,
    color: '#666666',
  },
  planDate: {
    fontSize: 14,
    color: '#999999',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 4,
  },
  usageItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: '#666666',
  },
  usageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  paymentMethodCard: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: '#666666',
  },
  invoiceCard: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666666',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  planCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  planFeatures: {
    fontSize: 14,
    color: '#666666',
  },
  planButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#E0E0E0',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentPlanButtonText: {
    color: '#666666',
  },
});

export default BillingScreen; 
