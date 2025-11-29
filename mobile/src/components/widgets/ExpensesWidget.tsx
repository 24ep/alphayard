import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Badge } from 'native-base';
import { analyticsService } from '../../services/analytics/AnalyticsService';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: number;
  paidBy: string;
  sharedWith: string[];
  isRecurring: boolean;
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  receipt?: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalAmount: number;
  percentage: number;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate: number;
  categories: string[];
}

interface ExpensesWidgetProps {
  onPress?: () => void;
  maxExpenses?: number;
  showBudget?: boolean;
}

const ExpensesWidget: React.FC<ExpensesWidgetProps> = ({
  onPress,
  maxExpenses = 5,
  showBudget = true,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExpensesData();
  }, []);

  const loadExpensesData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading expenses data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockExpenses: Expense[] = [
        {
          id: '1',
          title: 'Grocery Shopping',
          amount: 85.50,
          category: 'groceries',
          date: Date.now() - 86400000,
          paidBy: 'Sarah',
          sharedWith: ['Mike', 'Emma'],
          isRecurring: false,
          notes: 'Weekly groceries',
        },
        {
          id: '2',
          title: 'Electricity Bill',
          amount: 120.00,
          category: 'utilities',
          date: Date.now() - 172800000,
          paidBy: 'Mike',
          sharedWith: ['Sarah', 'Emma'],
          isRecurring: true,
          recurringPeriod: 'monthly',
          notes: 'Monthly electricity bill',
        },
        {
          id: '3',
          title: 'Dinner Out',
          amount: 65.00,
          category: 'dining',
          date: Date.now() - 259200000,
          paidBy: 'Emma',
          sharedWith: ['Sarah', 'Mike'],
          isRecurring: false,
          notes: 'hourse dinner',
        },
        {
          id: '4',
          title: 'Gas',
          amount: 45.00,
          category: 'transportation',
          date: Date.now() - 345600000,
          paidBy: 'Sarah',
          sharedWith: ['Mike'],
          isRecurring: false,
          notes: 'Car fuel',
        },
        {
          id: '5',
          title: 'Internet Bill',
          amount: 89.99,
          category: 'utilities',
          date: Date.now() - 432000000,
          paidBy: 'Mike',
          sharedWith: ['Sarah', 'Emma'],
          isRecurring: true,
          recurringPeriod: 'monthly',
          notes: 'Monthly internet',
        },
      ];

      const mockCategories: ExpenseCategory[] = [
        { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#4CAF50', totalAmount: 85.50, percentage: 25 },
        { id: 'utilities', name: 'Utilities', icon: 'lightning-bolt', color: '#2196F3', totalAmount: 209.99, percentage: 35 },
        { id: 'dining', name: 'Dining', icon: 'silverware-fork-knife', color: '#FF9800', totalAmount: 65.00, percentage: 15 },
        { id: 'transportation', name: 'Transportation', icon: 'car', color: '#9C27B0', totalAmount: 45.00, percentage: 10 },
        { id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#E91E63', totalAmount: 35.00, percentage: 8 },
        { id: 'other', name: 'Other', icon: 'package-variant', color: '#607D8B', totalAmount: 15.00, percentage: 7 },
      ];

      const mockBudgets: Budget[] = [
        {
          id: '1',
          name: 'Monthly Budget',
          amount: 2000,
          spent: 455.49,
          remaining: 1544.51,
          period: 'monthly',
          startDate: Date.now() - 2592000000,
          endDate: Date.now() + 2592000000,
          categories: ['groceries', 'utilities', 'dining', 'transportation'],
        },
      ];

      setExpenses(mockExpenses.slice(0, maxExpenses));
      setCategories(mockCategories);
      setBudgets(mockBudgets);
    } catch (error) {
      console.error('Failed to load expenses data:', error);
      Alert.alert('Error', 'Failed to load expenses data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpensesData();
    setRefreshing(false);
  };

  const handleExpensePress = (expense: Expense) => {
    analyticsService.trackEvent('expense_pressed', {
      expenseId: expense.id,
      category: expense.category,
      amount: expense.amount,
    });
    
    if (onPress) {
      onPress();
    }
  };

  const handleBudgetPress = (budget: Budget) => {
    analyticsService.trackEvent('budget_pressed', {
      budgetId: budget.id,
      budgetName: budget.name,
      spentPercentage: (budget.spent / budget.amount) * 100,
    });
    
    if (onPress) {
      onPress();
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || 'package-variant';
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.color || '#9E9E9E';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getBudgetProgress = (budget: Budget) => {
    return (budget.spent / budget.amount) * 100;
  };

  const getBudgetStatus = (budget: Budget) => {
    const progress = getBudgetProgress(budget);
    if (progress >= 90) return { status: 'Critical', color: '#F44336' };
    if (progress >= 75) return { status: 'Warning', color: '#FF9800' };
    if (progress >= 50) return { status: 'Good', color: '#4CAF50' };
    return { status: 'Excellent', color: '#2196F3' };
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseContainer}
      onPress={() => handleExpensePress(item)}
    >
      <View style={styles.expenseContent}>
        <View style={styles.expenseLeft}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            <Icon 
              name={getCategoryIcon(item.category)}
              size={16} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.expenseDetails}>
              {formatDate(item.date)} • {item.paidBy}
            </Text>
          </View>
        </View>
        
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>
            ${item.amount.toFixed(2)}
          </Text>
          {item.isRecurring && (
            <Icon name="refresh" size={14} color="#666666" />
          )}
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.expenseNotesContainer}>
          <Icon name="note-text" size={12} color="#999999" />
          <Text style={styles.expenseNotes} numberOfLines={1}>
            {item.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getRecurringExpenses = () => {
    return expenses.filter(expense => expense.isRecurring).length;
  };

  const getSharedExpenses = () => {
    return expenses.filter(expense => expense.sharedWith.length > 0).length;
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <Icon name="cash-multiple" size={24} color="#4A90E2" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onPress}>
        <Text style={styles.title}>Expenses</Text>
        <Icon name="cash-multiple" size={24} color="#4A90E2" />
      </TouchableOpacity>

      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cash-outline" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>No expenses recorded</Text>
          <Text style={styles.emptySubtext}>Start tracking your hourse expenses</Text>
        </View>
      ) : (
        <>
          {/* Budget Overview */}
          {showBudget && budgets.length > 0 && (
            <View style={styles.budgetContainer}>
              {budgets.map((budget) => {
                const progress = getBudgetProgress(budget);
                const status = getBudgetStatus(budget);
                
                return (
                  <TouchableOpacity
                    key={budget.id}
                    style={styles.budgetCard}
                    onPress={() => handleBudgetPress(budget)}
                  >
                    <View style={styles.budgetHeader}>
                      <Text style={styles.budgetTitle}>{budget.name}</Text>
                      <Badge
                        colorScheme={status.color === '#F44336' ? 'red' : 
                                   status.color === '#FF9800' ? 'orange' : 
                                   status.color === '#4CAF50' ? 'green' : 'blue'}
                        rounded="full"
                        variant="solid"
                      >
                        {status.status}
                      </Badge>
                    </View>
                    
                    <View style={styles.budgetProgress}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: status.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {progress.toFixed(1)}%
                      </Text>
                    </View>
                    
                    <View style={styles.budgetStats}>
                      <View style={styles.budgetStat}>
                        <Text style={styles.budgetLabel}>Spent</Text>
                        <Text style={styles.budgetValue}>
                          ${budget.spent.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.budgetStat}>
                        <Text style={styles.budgetLabel}>Remaining</Text>
                        <Text style={styles.budgetValue}>
                          ${budget.remaining.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.budgetStat}>
                        <Text style={styles.budgetLabel}>Total</Text>
                        <Text style={styles.budgetValue}>
                          ${budget.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Recent Expenses */}
          <View style={styles.expensesSection}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <FlatList
              data={expenses}
              renderItem={renderExpense}
              keyExtractor={(item) => item.id}
              style={styles.expensesList}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </View>
        </>
      )}

      {expenses.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Total: ${getTotalExpenses().toFixed(2)}
            </Text>
            {getRecurringExpenses() > 0 && (
              <Text style={styles.recurringText}>
                {getRecurringExpenses()} recurring
              </Text>
            )}
            {getSharedExpenses() > 0 && (
              <Text style={styles.sharedText}>
                {getSharedExpenses()} shared
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.viewAllButton} onPress={onPress}>
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="chevron-right" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#999999',
  },
  budgetContainer: {
    marginBottom: 16,
  },
  budgetCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  budgetProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    minWidth: 40,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStat: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  expensesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  expensesList: {
    maxHeight: 300,
  },
  expenseContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  expenseDetails: {
    fontSize: 14,
    color: '#666666',
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  expenseNotesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  expenseNotes: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
  },
  recurringText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  sharedText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default ExpensesWidget; 