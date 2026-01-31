import { AssetCard, AttentionApp, ReportOption, Widget } from '../types/home';

export const ASSET_CARDS: AssetCard[] = [
  {
    id: '1',
    title: 'Total Assets',
    value: '$125,430',
    change: '+12.5%',
    changeType: 'positive',
    icon: 'wallet',
    color: '#4F46E5',
    progress: 75,
  },
  {
    id: '2',
    title: 'Monthly Savings',
    value: '$3,200',
    change: '+8.2%',
    changeType: 'positive',
    icon: 'trending-up',
    color: '#10B981',
    progress: 60,
  },
  {
    id: '3',
    title: 'Investment Portfolio',
    value: '$89,750',
    change: '+15.3%',
    changeType: 'positive',
    icon: 'chart-line',
    color: '#F59E0B',
    progress: 85,
  },
  {
    id: '4',
    title: 'Emergency Fund',
    value: '$15,000',
    change: '+5.1%',
    changeType: 'positive',
    icon: 'shield-check',
    color: '#EF4444',
    progress: 100,
  },
];

export const ATTENTION_APPS: AttentionApp[] = [
  {
    id: '1',
    name: 'Banking',
    icon: 'bank',
    color: '#4F46E5',
    notifications: 3,
    isUrgent: true,
  },
  {
    id: '2',
    name: 'Insurance',
    icon: 'shield-check',
    color: '#10B981',
    notifications: 1,
    isUrgent: false,
  },
  {
    id: '3',
    name: 'Investment',
    icon: 'chart-line',
    color: '#F59E0B',
    notifications: 2,
    isUrgent: false,
  },
  {
    id: '4',
    name: 'Tax',
    icon: 'file-document',
    color: '#EF4444',
    notifications: 5,
    isUrgent: true,
  },
  {
    id: '5',
    name: 'Credit Card',
    icon: 'credit-card',
    color: '#8B5CF6',
    notifications: 2,
    isUrgent: false,
  },
  {
    id: '6',
    name: 'Mortgage',
    icon: 'home',
    color: '#06B6D4',
    notifications: 1,
    isUrgent: true,
  },
  {
    id: '7',
    name: 'Retirement',
    icon: 'account-heart',
    color: '#F97316',
    notifications: 3,
    isUrgent: false,
  },
  {
    id: '8',
    name: 'Health Insurance',
    icon: 'medical-bag',
    color: '#10B981',
    notifications: 1,
    isUrgent: false,
  },
  {
    id: '9',
    name: 'Life Insurance',
    icon: 'shield-heart',
    color: '#EF4444',
    notifications: 2,
    isUrgent: true,
  },
  {
    id: '10',
    name: 'Auto Insurance',
    icon: 'car',
    color: '#3B82F6',
    notifications: 1,
    isUrgent: false,
  },
];

export const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'spam',
    title: 'Spam',
    description: 'This post is spam or misleading',
    icon: 'alert-circle',
  },
  {
    id: 'inappropriate',
    title: 'Inappropriate Content',
    description: 'This post contains inappropriate content',
    icon: 'eye-off',
  },
  {
    id: 'harassment',
    title: 'Harassment',
    description: 'This post is harassing or bullying',
    icon: 'account-remove',
  },
  {
    id: 'violence',
    title: 'Violence',
    description: 'This post promotes violence',
    icon: 'alert-triangle',
  },
  {
    id: 'fake',
    title: 'False Information',
    description: 'This post contains false information',
    icon: 'information',
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Other reasons not listed above',
    icon: 'ellipsis-horizontal',
  },
];

export const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'Circle-members',
    name: 'Circle Members',
    description: 'Show Circle member avatars and status',
    category: 'Circle',
    enabled: true,
  },
  {
    id: 'asset-cards',
    name: 'Asset Cards',
    description: 'Display financial asset information',
    category: 'finance',
    enabled: true,
  },
  {
    id: 'attention-apps',
    name: 'Attention Apps',
    description: 'Show apps requiring attention',
    category: 'apps',
    enabled: true,
  },
  {
    id: 'recently-used',
    name: 'Recently Used',
    description: 'Display recently used applications',
    category: 'apps',
    enabled: true,
  },
  {
    id: 'Circle-status-cards',
    name: 'Circle Status Cards',
    description: 'Show Circle member status information',
    category: 'Circle',
    enabled: true,
  },
  {
    id: 'social-posts',
    name: 'Social Posts',
    description: 'Display social media posts',
    category: 'social',
    enabled: true,
  },
];

export const WALLET_ICONS = [
  'wallet',
  'credit-card',
  'bank',
  'cash',
  'piggy-bank',
  'treasure-chest',
  'diamond',
  'gold',
  'bitcoin',
  'ethereum',
];

export const CIRCLE_MEMBER_TYPES = [
  'parent',
  'child',
  'spouse',
  'sibling',
  'grandparent',
  'grandchild',
  'uncle',
  'aunt',
  'cousin',
  'friend',
];

// Social posts are now fetched from socialService.getPosts()

// Circle status cards are now fetched from circleStatusService.getCircleMembers()

// Circle status members are now fetched from circleStatusService.getCircleMembers()

// Appointments are now fetched from appointmentService.getTodaysAppointments()

// Shopping list items are now fetched from shoppingListService.getShoppingItems()

// Recently used apps are now fetched from recentlyUsedService.getRecentlyUsedApps()

// Location data is now fetched from locationDataService.getLocations()

// Widget types are now fetched from widgetService.getWidgetTypes()


