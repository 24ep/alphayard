
import React from 'react'
import { 
    PaintBrushIcon, 
    StopIcon, 
    CursorArrowRaysIcon, 
    QueueListIcon, 
    ViewColumnsIcon, 
    ChatBubbleBottomCenterTextIcon,
    PresentationChartLineIcon,
    AdjustmentsHorizontalIcon,
    ListBulletIcon,
    BellSnoozeIcon,
    Bars3Icon,
    ArrowPathIcon,
    DevicePhoneMobileIcon,
    ShareIcon,
    SwatchIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    PhotoIcon,
    ShieldExclamationIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import { CategoryConfig, ColorValue, ColorMode } from '../../appearance/types'

export const CategoryIcons: Record<string, React.ReactNode> = {
  // Pillar 1: Identity
  identity: <DevicePhoneMobileIcon className="w-5 h-5" />,
  branding: <PaintBrushIcon className="w-5 h-5" />,
  'mobile-quick-settings': <PaintBrushIcon className="w-5 h-5" />,
  'mobile-splash': <SparklesIcon className="w-5 h-5" />,
  social: <ShareIcon className="w-5 h-5" />,
  'mobile-screens': <DevicePhoneMobileIcon className="w-5 h-5" />,
  
  // Pillar 2: Experience
  onboarding: <PresentationChartLineIcon className="w-5 h-5" />,
  navigation: <ListBulletIcon className="w-5 h-5" />,
  engagement: <SparklesIcon className="w-5 h-5" />,
  announcements: <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />,
  ux: <SparklesIcon className="w-5 h-5" />,
  
  // Pillar 3: Design
  tokens: <SwatchIcon className="w-5 h-5" />,
  typography: <Bars3Icon className="w-5 h-5 rotate-90" />,
  library: <ViewColumnsIcon className="w-5 h-5" />,
  export: <ArrowPathIcon className="w-5 h-5" />,
  
  // Pillar 4: Advanced
  security: <QueueListIcon className="w-5 h-5" />,
  localization: <QueueListIcon className="w-5 h-5" />,
  seo: <QueueListIcon className="w-5 h-5" />,
  updates: <ArrowPathIcon className="w-5 h-5" />,
  
  // Pillar 5: Backend/Ops
  api: <QueueListIcon className="w-5 h-5" />,
  features: <AdjustmentsHorizontalIcon className="w-5 h-5" />,
  terms: <ListBulletIcon className="w-5 h-5" />,
  team: <QueueListIcon className="w-5 h-5" />,
  payment: <QueueListIcon className="w-5 h-5" />,

  notifications: <BellSnoozeIcon className="w-5 h-5" />,
  
  // New Component Categories (Pillar Styles)
  buttons: <CursorArrowRaysIcon className="w-5 h-5" />,
  cards: <StopIcon className="w-5 h-5" />,
  inputs: <QueueListIcon className="w-5 h-5" />,
  layout: <ViewColumnsIcon className="w-5 h-5" />,
  feedback: <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />,
  
  'mobile-nav': <ListBulletIcon className="w-5 h-5" />,
  'mobile-actions': <CursorArrowRaysIcon className="w-5 h-5" />,
  'lists-grids': <QueueListIcon className="w-5 h-5" />,
  'communication': <ChatBubbleLeftRightIcon className="w-5 h-5" />,
  'media-assets': <PhotoIcon className="w-5 h-5" />,
  'safety-ui': <ShieldExclamationIcon className="w-5 h-5" />,
  'member-exp': <UserGroupIcon className="w-5 h-5" />,
  'charts-data': <PresentationChartLineIcon className="w-5 h-5" />,
  'app-widgets': <DevicePhoneMobileIcon className="w-5 h-5" />,
  'navigation-ui': <ListBulletIcon className="w-5 h-5" />,
}

export const solidColor = (color: string): ColorValue => ({ mode: 'solid' as ColorMode, solid: color })

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'buttons',
    name: 'Buttons',
    description: 'Configure interaction elements.',
    icon: 'buttons',
    components: [
      {
          id: 'primary', 
          name: 'Primary Button', 
          type: 'button',
          styles: { backgroundColor: solidColor('#FFB6C1'), textColor: solidColor('#FFFFFF'), borderRadius: 12, borderColor: solidColor('transparent'), shadowLevel: 'sm', clickAnimation: 'scale' } as any,
          mobileConfig: { 
              componentName: 'ThemedButton', 
              filePath: 'components/common/ThemedButton.tsx', 
              usageExample: '<ThemedButton \n  componentId="primary" \n  label="Click Me" \n  onPress={handlePress} \n/>' 
          }
      },
      {
          id: 'secondary', 
          name: 'Secondary Button', 
          type: 'button',
          styles: { backgroundColor: solidColor('#F3F4F6'), textColor: solidColor('#4B5563'), borderRadius: 12, borderColor: solidColor('transparent'), shadowLevel: 'none', clickAnimation: 'scale' } as any,
          mobileConfig: { 
              componentName: 'ThemedButton', 
              filePath: 'components/common/ThemedButton.tsx', 
              usageExample: '<ThemedButton \n  componentId="secondary" \n  label="Cancel" \n  onPress={handleCancel} \n/>' 
          }
      },
      {
          id: 'destructive', 
          name: 'Destructive Button', 
          type: 'button',
          styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF'), borderRadius: 12, borderColor: solidColor('transparent'), shadowLevel: 'none', clickAnimation: 'scale' } as any,
          mobileConfig: { 
              componentName: 'ThemedButton', 
              filePath: 'components/common/ThemedButton.tsx', 
              usageExample: '<ThemedButton \n  componentId="destructive" \n  label="Delete" \n  onPress={handleDelete} \n/>' 
          }
      }
    ]
  },
  {
      id: 'cards',
      name: 'Cards',
      description: 'Define content wrappers.',
      icon: 'cards',
      components: [
          { 
            id: 'standard', 
            name: 'Standard Card', 
            type: 'card',
            styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16, borderColor: solidColor('#E5E7EB'), shadowLevel: 'md' } as any,
            mobileConfig: { componentName: 'Card', filePath: 'components/ui/Card.tsx', usageExample: '<Card>\n  <Text>Content goes here</Text>\n</Card>' }
          }
      ]
  },
  {
      id: 'inputs',
      name: 'Inputs',
      description: 'Text fields & form elements.',
      icon: 'inputs',
      components: [
          { 
            id: 'text', 
            name: 'Text Input', 
            type: 'input',
            styles: { 
              backgroundColor: solidColor('#F9FAFB'), 
              borderRadius: 12, 
              borderColor: solidColor('#E5E7EB'), 
              textColor: solidColor('#111827'),
              focusBorderColor: solidColor('#3B82F6'),
              validBorderColor: solidColor('#10B981'),
              invalidBorderColor: solidColor('#EF4444')
            } as any,
            mobileConfig: { componentName: 'Input', filePath: 'components/ui/Input.tsx', usageExample: '<Input \n  placeholder="Enter name" \n  value={name} \n  onChangeText={setName} \n/>' }
          }
      ]
  },
  {
      id: 'layout',
      name: 'Layout',
      description: 'Structure & Containers.',
      icon: 'layout',
      components: [
          { 
            id: 'container', 
            name: 'Main Wrapper', 
            type: 'card',
            styles: { backgroundColor: solidColor('#FFFFFF') } as any,
            mobileConfig: { componentName: 'Container', filePath: 'components/ui/Container.tsx', usageExample: '<Container>\n  <Header />\n  <Content />\n</Container>' }
          }
      ]
  },
  {
      id: 'feedback',
      name: 'Feedback',
      description: 'Toasts & Modals.',
      icon: 'feedback',
      components: [
          { 
            id: 'toast', 
            name: 'Toast Message', 
            type: 'card',
            styles: { backgroundColor: solidColor('#1F2937'), textColor: solidColor('#FFFFFF'), borderRadius: 8, borderColor: solidColor('transparent'), shadowLevel: 'sm' } as any,
            mobileConfig: { componentName: 'Toast', filePath: 'components/ui/Toast.tsx', usageExample: "Toast.show({\n  type: 'success',\n  text1: 'Hello',\n  text2: 'This is a toast message'\n});" }
          }
    ]
  },
  {
    id: 'mobile-nav',
    name: 'Mobile Navigation',
    description: 'Tab bars, drawers, and menus.',
    icon: 'mobile-nav',
    components: [
      { 
        id: 'bottom-sheet', 
        name: 'Bottom Sheet', 
        type: 'card',
        styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 32, borderColor: solidColor('transparent'), shadowLevel: 'lg' } as any,
        mobileConfig: { componentName: 'BottomSheet', filePath: 'admin/components/ui/BottomSheet.tsx', usageExample: '<BottomSheet ref={sheetRef} snapPoints={["50%"]}>\n  <View><Text>Sheet Content</Text></View>\n</BottomSheet>' }
      },
      { 
        id: 'drawer-overlay', 
        name: 'Side Drawer', 
        type: 'card',
        styles: { backgroundColor: solidColor('#FFFFFF') } as any,
        mobileConfig: { componentName: 'Drawer', filePath: 'admin/components/ui/Drawer.tsx', usageExample: '<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>\n  <MenuContent />\n</Drawer>' }
      },
      { 
        id: 'tab-navigation', 
        name: 'Mobile Tabbar', 
        type: 'tabbar',
        styles: { backgroundColor: solidColor('rgba(255,255,255,0.95)'), textColor: solidColor('#64748B') } as any,
        mobileConfig: { componentName: 'Tabbar', filePath: 'admin/components/ui/Tabbar.tsx', usageExample: '<Tabbar \n  tabs={tabs} \n  activeId={activeTab} \n  onSelect={handleTabSelect} \n/>' }
      },
      { 
        id: 'segmented-control', 
        name: 'Segmented Control', 
        type: 'tabbar',
        styles: { backgroundColor: solidColor('#F1F5F9'), borderRadius: 16, borderColor: solidColor('transparent') } as any,
        mobileConfig: { componentName: 'SegmentedTabs', filePath: 'components/common/SegmentedTabs.tsx', usageExample: '<SegmentedTabs \n  tabs={["Map", "List"]} \n  activeId={activeId} \n  onChange={setId} \n/>' },
        config: {
            activeColor: '#FA7272',
            inactiveColor: '#F3F4F6',
            activeTextColor: '#FFFFFF',
            inactiveTextColor: '#6B7280',
            cornerRadius: 24
        }
      },
      { 
        id: 'selection-tabs', 
        name: 'Icon Selection Tabs', 
        type: 'tabbar',
        styles: { backgroundColor: solidColor('#FA7272'), textColor: solidColor('#FA7272'), borderRadius: 12 } as any,
        mobileConfig: { componentName: 'CircleSelectionTabs', filePath: 'components/common/CircleSelectionTabs.tsx', usageExample: '<CircleSelectionTabs \n  tabs={tabs} \n  activeTab={activeTab} \n  onTabPress={setActiveTab} \n  fit={true} \n/>' },
        config: {
            activeColor: '#FA7272',
            inactiveColor: '#F3F4F6',
            activeTextColor: '#FA7272',
            inactiveTextColor: '#6B7280',
            activeIconColor: '#FFFFFF',
            inactiveIconColor: '#6B7280',
            menuBackgroundColor: 'transparent',
            fit: true,
            menuShowShadow: 'none',
            activeShowShadow: 'none',
            inactiveShowShadow: 'none',

            // Layout
            itemSpacing: 8,
            itemBorderRadius: 12,
            pinnedFirstTab: false,
            showPinnedSeparator: false,
            pinnedSeparatorColor: '#E5E7EB',

            // Borders
            activeBorderColor: 'transparent',
            inactiveBorderColor: 'transparent',
            activeBorderWidth: 0,
            inactiveBorderWidth: 0,

            // Opacity
            activeOpacity: 1,
            inactiveOpacity: 1
        }
      },
      { 
        id: 'circle-selection-tabs', 
        name: 'Circle Selection Tabs', 
        type: 'tabbar',
        styles: { backgroundColor: solidColor('#FA7272'), textColor: solidColor('#FA7272'), borderRadius: 12 } as any,
        mobileConfig: { componentName: 'CircleSelectionTabs', filePath: 'components/common/CircleSelectionTabs.tsx', usageExample: '<CircleSelectionTabs \n  tabs={tabs} \n  activeTab={activeTab} \n  onTabPress={setActiveTab} \n  fit={true} \n/>' },
        config: {
            activeColor: '#FA7272',
            inactiveColor: '#F3F4F6',
            activeTextColor: '#FA7272',
            inactiveTextColor: '#6B7280',
            activeIconColor: '#FFFFFF',
            inactiveIconColor: '#6B7280',
            menuBackgroundColor: 'transparent',
            fit: true,
            menuShowShadow: 'none',
            activeShowShadow: 'none',
            inactiveShowShadow: 'none',

            // Visibility
            showLocationTab: true,
            showGalleryTab: true,
            showFinancialTab: true,
            showHealthTab: true,

            // Layout
            itemSpacing: 8,
            itemBorderRadius: 12,
            pinnedFirstTab: false,
            showPinnedSeparator: false,
            pinnedSeparatorColor: '#E5E7EB',

            // Borders
            activeBorderColor: 'transparent',
            inactiveBorderColor: 'transparent',
            activeBorderWidth: 0,
            inactiveBorderWidth: 0,

            // Opacity
            activeOpacity: 1,
            inactiveOpacity: 1
        }
      },
      { 
        id: 'health-selection-tabs', 
        name: 'Health Selection Tabs', 
        type: 'tabbar',
        styles: { backgroundColor: solidColor('#FA7272'), textColor: solidColor('#FA7272'), borderRadius: 12 } as any,
        mobileConfig: { componentName: 'HealthSelectionTabs', filePath: 'components/common/HealthSelectionTabs.tsx', usageExample: '<HealthSelectionTabs \n  activeTab={activeTab} \n  onTabPress={setActiveTab} \n/>' },
        config: {
            activeColor: '#FA7272',
            inactiveColor: '#F3F4F6',
            activeTextColor: '#FA7272',
            inactiveTextColor: '#6B7280',
            activeIconColor: '#FFFFFF',
            inactiveIconColor: '#6B7280',
            menuBackgroundColor: 'transparent',
            fit: true,
            menuShowShadow: 'none',
            activeShowShadow: 'none',
            inactiveShowShadow: 'none',

            // Layout
            itemSpacing: 8,
            itemBorderRadius: 12,
            
            // Categories
            defaultCategories: [
                { id: 'common', label: 'Common', icon: 'emoticon-happy' },
                { id: 'metrics', label: 'Metrics', icon: 'chart-line' }
            ]
        }
      },
      { 
        id: 'accordion-menu', 
        name: 'Accordion Menu', 
        type: 'accordion',
        styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16 } as any,
        mobileConfig: { componentName: 'Accordion', filePath: 'admin/components/ui/Accordion.tsx', usageExample: '<Accordion title="Advanced Options">\n  <SettingsList />\n</Accordion>' }
      }
    ]
  },
  {
    id: 'mobile-actions',
    name: 'Mobile Actions',
    description: 'Floating buttons and quick actions.',
    icon: 'mobile-actions',
    components: [
      { 
        id: 'fab-action', 
        name: 'Floating Button', 
        type: 'button',
        styles: { backgroundColor: solidColor('#6366F1'), textColor: solidColor('#FFFFFF'), borderRadius: 99 } as any,
        mobileConfig: { componentName: 'FloatingCreatePostButton', filePath: 'components/home/FloatingCreatePostButton.tsx', usageExample: '<FloatingCreatePostButton visible={true} onPress={handlePress} />' },
        config: {
            buttonSize: 56,
            bottomOffset: 24,
            rightOffset: 24,
            iconSize: 28
        }
      },
      { 
        id: 'floating-menu', 
        name: 'Radial Menu', 
        type: 'button',
        styles: { backgroundColor: solidColor('#1E293B'), textColor: solidColor('#FFFFFF') } as any,
        mobileConfig: { componentName: 'FloatingMenu', filePath: 'admin/components/ui/FloatingMenu.tsx', usageExample: '<FloatingMenu \n  items={[ \n    { icon: "camera", onPress: openCamera }, \n    { icon: "photo", onPress: openGallery } \n  ]} \n/>' }
      },
      { 
        id: 'action-sheet', 
        name: 'Action Sheet', 
        type: 'card',
        styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 24 } as any,
        mobileConfig: { componentName: 'ActionSheet', filePath: 'admin/components/ui/ActionSheet.tsx', usageExample: 'const options = ["Edit", "Delete", "Cancel"];\nActionSheet.show({ options }, index => {\n  // Handle selection\n});' }
      },
      { 
        id: 'pull-refresh', 
        name: 'Pull Refresh', 
        type: 'generic',
        styles: { textColor: solidColor('#6366F1') } as any,
        mobileConfig: { componentName: 'PullToRefresh', filePath: 'admin/components/ui/PullToRefresh.tsx', usageExample: '<ScrollView \n  refreshControl={\n    <PullToRefresh refreshing={loading} onRefresh={refetch} />\n  }\n>\n  {content}\n</ScrollView>' }
      }
    ]
  },
  {
    id: 'data-display',
    name: 'Data Display',
    description: 'Charts, stats, and visualizers.',
    icon: 'data-display',
    components: [
      { 
        id: 'metric-card', 
        name: 'Metric Card', 
        type: 'card',
        styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 24, borderColor: solidColor('#F1F5F9'), shadowLevel: 'sm' } as any,
        mobileConfig: { componentName: 'MetricCard', filePath: 'admin/components/ui/MetricCard.tsx', usageExample: '<MetricCard \n  title="Total Sales" \n  value="$1,234" \n  trend="+5%" \n  trendColor="green" \n/>' }
      },
      { 
        id: 'stat-roll', 
        name: 'Statistic Roll', 
        type: 'generic',
        styles: { textColor: solidColor('#0F172A') } as any,
        mobileConfig: { componentName: 'StatisticRoll', filePath: 'admin/components/ui/StatisticRoll.tsx', usageExample: '<StatisticRoll \n  label="Active Users" \n  value={5432} \n  duration={2000} \n/>' }
      },
      { 
        id: 'sparkline-chart', 
        name: 'Sparkline Chart', 
        type: 'generic',
        styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#6366F1') } as any,
        mobileConfig: { componentName: 'Sparkline', filePath: 'admin/components/ui/Sparkline.tsx', usageExample: '<Sparkline \n  data={[10, 20, 15, 40, 30, 60]} \n  width={100} \n  height={50} \n/>' }
      },
      { 
        id: 'avatar-group', 
        name: 'Avatar Stack', 
        type: 'badge',
        styles: { borderColor: solidColor('#FFFFFF') } as any,
        mobileConfig: { componentName: 'AvatarGroup', filePath: 'admin/components/ui/AvatarGroup.tsx', usageExample: '<AvatarGroup \n  images={[img1, img2, img3]} \n  limit={3} \n  size={40} \n/>' }
      },
      { 
        id: 'timeline-main', 
        name: 'Timeline List', 
        type: 'generic',
        styles: { backgroundColor: solidColor('transparent'), borderColor: solidColor('#E2E8F0') } as any,
        mobileConfig: { componentName: 'Timeline', filePath: 'admin/components/ui/Timeline.tsx', usageExample: '<Timeline \n  data={events} \n  renderItem={({ item }) => <EventCard event={item} />} \n/>' }
      },
      { 
        id: 'carousel-view', 
        name: 'Carousel Gallery', 
        type: 'generic',
        styles: { backgroundColor: solidColor('transparent'), borderRadius: 24 } as any,
        mobileConfig: { componentName: 'Carousel', filePath: 'admin/components/ui/Carousel.tsx', usageExample: '<Carousel \n  data={banners} \n  renderItem={renderBanner} \n  loop={true} \n/>' }
      },
      { 
        id: 'glass-card', 
        name: 'Glass Card', 
        type: 'card',
        styles: { backgroundColor: solidColor('rgba(255,255,255,0.8)'), borderRadius: 24, borderColor: solidColor('rgba(255,255,255,0.2)'), shadowLevel: 'md' } as any,
        mobileConfig: { componentName: 'GlassCard', filePath: 'admin/components/ui/GlassCard.tsx', usageExample: '<GlassCard intensity={80}>\n  <Text>Frosted Glass Effect</Text>\n</GlassCard>' }
      }
    ]
  },
  {
    id: 'status-feedback',
    name: 'Status & Feedback',
    description: 'Indicators and progress.',
    icon: 'status-feedback',
    components: [
      { 
        id: 'status-indicator', 
        name: 'Status Indicator', 
        type: 'badge',
        styles: { backgroundColor: solidColor('#10B981') } as any,
        mobileConfig: { componentName: 'StatusIndicator', filePath: 'admin/components/ui/StatusIndicator.tsx', usageExample: '<StatusIndicator status="online" label="Active" />' }
      },
       { 
        id: 'notification-dot', 
        name: 'Badge Indicator', 
        type: 'badge',
        styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF') } as any,
        mobileConfig: { componentName: 'NotificationBadge', filePath: 'admin/components/ui/NotificationBadge.tsx', usageExample: '<View>\n  <Icon name="bell" />\n  <NotificationBadge count={5} />\n</View>' }
      },
      { 
        id: 'progress-ring', 
        name: 'Progress Ring', 
        type: 'generic',
        styles: { textColor: solidColor('#6366F1'), backgroundColor: solidColor('#E2E8F0') } as any,
        mobileConfig: { componentName: 'ProgressRing', filePath: 'admin/components/ui/ProgressRing.tsx', usageExample: '<ProgressRing \n  progress={0.75} \n  strokeWidth={4} \n  size={60} \n/>' }
      },
      { 
        id: 'skeleton-wrapper', 
        name: 'Skeleton Loader', 
        type: 'generic',
        styles: { backgroundColor: solidColor('#F1F5F9'), borderRadius: 16 } as any,
        mobileConfig: { componentName: 'SkeletonWrapper', filePath: 'components/common/SkeletonWrapper.tsx', usageExample: '<SkeletonWrapper loading={isLoading}>\n  <UserProfile />\n</SkeletonWrapper>' }
      },
      { 
        id: 'rating-stars', 
        name: 'Rating Stars', 
        type: 'generic',
        styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#FBBF24') } as any,
        mobileConfig: { componentName: 'Rating', filePath: 'admin/components/ui/Rating.tsx', usageExample: '<Rating \n  startingValue={4.5} \n  imageSize={20} \n  onFinishRating={ratingCompleted} \n/>' }
      }
    ]
  },
  {
    id: 'advanced-inputs',
    name: 'Advanced Inputs',
    description: 'Sliders, toggles, chips.',
    icon: 'advanced-inputs',
    components: [
      { 
        id: 'otp-input', 
        name: 'OTP field', 
        type: 'input',
        styles: { 
          backgroundColor: solidColor('#F8FAFC'), 
          borderRadius: 12, 
          borderColor: solidColor('#E2E8F0'), 
          shadowLevel: 'none',
          focusBorderColor: solidColor('#6366F1'),
          validBorderColor: solidColor('#10B981'),
          invalidBorderColor: solidColor('#EF4444')
        } as any,
        mobileConfig: { componentName: 'OTPInput', filePath: 'admin/components/ui/OTPInput.tsx', usageExample: '<OTPInput \n  code={code} \n  onCodeChanged={setCode} \n  pinCount={6} \n/>' }
      },
      { 
        id: 'mobile-slider', 
        name: 'Mobile Slider', 
        type: 'input',
        styles: { backgroundColor: solidColor('#6366F1'), borderRadius: 8 } as any,
        mobileConfig: { componentName: 'Slider', filePath: 'admin/components/ui/Slider.tsx', usageExample: '<Slider \n  value={brightness} \n  minimumValue={0} \n  maximumValue={1} \n  onValueChange={setBrightness} \n/>' }
      },
      { 
        id: 'stepper-control', 
        name: 'Quantifier Stepper', 
        type: 'input',
        styles: { backgroundColor: solidColor('#F1F5F9'), borderRadius: 12 } as any,
        mobileConfig: { componentName: 'Stepper', filePath: 'admin/components/ui/Stepper.tsx', usageExample: '<Stepper \n  value={quantity} \n  onIncrement={inc} \n  onDecrement={dec} \n/>' }
      },
      { 
        id: 'toggle-switch', 
        name: 'Modern Toggle', 
        type: 'input',
        styles: { backgroundColor: solidColor('#E2E8F0') } as any,
        mobileConfig: { componentName: 'ToggleSwitch', filePath: 'admin/components/ui/ToggleSwitch.tsx', usageExample: '<ToggleSwitch \n  isOn={isEnabled} \n  onToggle={toggleSwitch} \n/>' }
      },
      { 
        id: 'chip-group', 
        name: 'Chip Tags', 
        type: 'badge',
        styles: { backgroundColor: solidColor('#E2E8F0'), borderRadius: 99, textColor: solidColor('#475569') } as any,
        mobileConfig: { componentName: 'ChipField', filePath: 'admin/components/ui/ChipField.tsx', usageExample: '<ChipField \n  tags={["React", "Native"]} \n  onTagPress={handleTagPress} \n/>' }
      },
      { 
        id: 'search-overlay', 
        name: 'Full Search', 
        type: 'input',
        styles: { backgroundColor: solidColor('rgba(255,255,255,0.98)') } as any,
        mobileConfig: { componentName: 'SearchDrawer', filePath: 'components/home/SearchDrawer.tsx', usageExample: '<SearchDrawer \n  visible={isSearching} \n  onClose={() => setIsSearching(false)} \n/>' }
      },
      {
        id: 'datetime-picker',
        name: 'Date & Time Picker',
        type: 'input',
        styles: { 
            backgroundColor: solidColor('#FFFFFF'), 
            borderRadius: 16, 
            borderColor: solidColor('#E5E7EB'), 
            textColor: solidColor('#1F2937'),
            shadowLevel: 'sm'
        } as any,
        mobileConfig: { componentName: 'DateTimePickerDrawer', filePath: 'components/calendar/DateTimePickerDrawer.tsx', usageExample: '<DateTimePickerDrawer \n  visible={show} \n  onConfirm={handleDate} \n/>' },
        config: {
            dateFormat: 'MMM DD, YYYY',
            timeFormat: 'h:mm A',
            pickerMode: 'datetime', // 'date' | 'time' | 'datetime'
            displayFormat: 'MMM DD, YYYY h:mm A'
        }
      }
    ]
  },
  {
    id: 'lists-grids',
    name: 'Lists & Grids',
    description: 'Advanced data repeaters.',
    icon: 'lists-grids',
    components: [
      { 
        id: 'swipeable-list', 
        name: 'Swipeable Rows', 
        type: 'generic',
        styles: { backgroundColor: solidColor('#FFFFFF'), borderColor: solidColor('#F1F5F9'), borderRadius: 12 } as any,
        mobileConfig: { componentName: 'SwipeableList', filePath: 'admin/components/ui/SwipeableList.tsx', usageExample: '<SwipeableList \n  data={messages} \n  renderItem={renderMessage} \n  renderHiddenItem={renderActions} \n/>' }
      },
      { 
        id: 'sortable-list', 
        name: 'Sortable DND List', 
        type: 'generic',
        styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 12 } as any,
        mobileConfig: { componentName: 'SortableList', filePath: 'admin/components/ui/SortableList.tsx', usageExample: '<SortableList \n  data={playlist} \n  onRowMoved={handleRowMove} \n  renderRow={renderSong} \n/>' }
      },
      { 
        id: 'infinite-scroll', 
        name: 'Infinite Scroll', 
        type: 'generic',
        styles: { textColor: solidColor('#94A3B8') } as any,
        mobileConfig: { componentName: 'InfiniteScroll', filePath: 'admin/components/ui/InfiniteScroll.tsx', usageExample: '<InfiniteScroll \n  renderItem={renderItem} \n  data={data} \n  loadMore={fetchNextPage} \n/>' }
      }
    ]
  },
  {
    id: 'communication',
    name: 'Communication UI',
    description: 'Chat bubbles, inputs, and status.',
    icon: 'communication',
    components: [
      { 
        id: 'message-bubble-sent', 
        name: 'Sent Message', 
        type: 'card',
        styles: { backgroundColor: solidColor('#E8B4A1'), textColor: solidColor('#FFFFFF'), borderRadius: 16 } as any,
        mobileConfig: { componentName: 'MessageBubble', filePath: 'components/chat/MessageBubble.tsx', usageExample: '<MessageBubble isOwnMessage={true} text="Hello!" />' }
      },
      { 
        id: 'message-bubble-received', 
        name: 'Received Message', 
        type: 'card',
        styles: { backgroundColor: solidColor('#F3F4F6'), textColor: solidColor('#111827'), borderRadius: 16 } as any,
        mobileConfig: { componentName: 'MessageBubble', filePath: 'components/chat/MessageBubble.tsx', usageExample: '<MessageBubble isOwnMessage={false} text="Hi there!" />' }
      }
    ]
  },
  {
    id: 'media-assets',
    name: 'Media & Assets',
    description: 'Avatars, images, and galleries.',
    icon: 'media-assets',
    components: [
      { 
        id: 'avatar-standard', 
        name: 'User Avatar', 
        type: 'badge',
        styles: { borderRadius: 99, borderColor: solidColor('#FFFFFF') } as any,
        mobileConfig: { componentName: 'Avatar', filePath: 'components/common/Avatar.tsx', usageExample: '<Avatar source={userImage} size={40} />' }
      }
    ]
  },
  {
    id: 'safety-ui',
    name: 'Safety & SOS',
    description: 'Emergency controls and alerts.',
    icon: 'safety-ui',
    components: [
      { 
        id: 'sos-button', 
        name: 'SOS Panic Button', 
        type: 'button',
        styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF'), borderRadius: 99 } as any,
        mobileConfig: { componentName: 'EmergencyAlertButton', filePath: 'components/emergency/EmergencyAlertButton.tsx', usageExample: '<EmergencyAlertButton />' },
        config: {
            buttonSize: 80,
            verticalOffset: 20,
            horizontalOffset: 20,
            pulseColor: '#FF5A5A'
        }
      }
    ]
  },
  {
    id: 'charts-data',
    name: 'Charts & Analytics',
    description: 'Heatmaps, bar charts, and data viz.',
    icon: 'charts-data',
    components: [
      { 
        id: 'heatmap-personal', 
        name: 'Personal Wellbeing Heatmap', 
        type: 'generic',
        styles: { backgroundColor: solidColor('transparent'), borderRadius: 12 } as any,
        mobileConfig: { componentName: 'EmotionHeatMap', filePath: 'components/EmotionHeatMap.tsx', usageExample: '<EmotionHeatMap type="personal" data={records} />' }
      }
    ]
  },
  {
    id: 'app-widgets',
    name: 'Dashboard Widgets',
    description: 'HomeScreen overview components.',
    icon: 'app-widgets',
    components: [
      { 
        id: 'weather-widget', 
        name: 'Weather Widget', 
        type: 'card',
        styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16 } as any,
        mobileConfig: { componentName: 'WeatherWidget', filePath: 'components/widgets/WeatherWidget.tsx', usageExample: '<WeatherWidget />' }
      }
    ]
  },
  {
    id: 'navigation-ui',
    name: 'Navigation UI',
    description: 'Tab bars, drawers, and menus.',
    icon: 'navigation-ui',
    components: [
      { 
        id: 'main-tab-bar', 
        name: 'Main Bottom Tabs', 
        type: 'tabbar',
        styles: { backgroundColor: solidColor('#FFFFFF'), textColor: solidColor('#FA7272') } as any,
        mobileConfig: { componentName: 'MainTabNavigator', filePath: 'navigation/MainTabNavigator.tsx', usageExample: 'Configure active/inactive tints and background.' }
      }
    ]
  },
  {
    id: 'social-icons',
    name: 'Social Media Icons',
    description: 'Upload and manage social media platform icons. Data loaded from database.',
    icon: 'social',
    components: [] // Loaded dynamically from database (branding.icons.social)
  },
  {
    id: 'flag-icons',
    name: 'Country Flag Icons',
    description: 'Upload and manage country flag icons for language selection. Data loaded from database.',
    icon: 'localization',
    components: [] // Loaded dynamically from database (branding.icons.flags)
  }
]

export const getSidebarSections = (categories: CategoryConfig[]) => [
    {
      id: 'pillar-1',
      title: 'Identity & Presence',
      items: [
        { id: 'mobile-identity', name: 'App Identity', icon: 'identity' },
        { id: 'mobile-splash', name: 'Splash Screen', icon: 'mobile-splash' },
        { id: 'mobile-social', name: 'Links & Support', icon: 'social' },
      ]
    },
    {
      id: 'pillar-2',
      title: 'App Experience',
      items: [
        { id: 'mobile-onboarding', name: 'Onboarding Flow', icon: 'onboarding' },
        { id: 'mobile-ux', name: 'UX & Motion', icon: 'ux' },
      ]
    },
    {
      id: 'pillar-3',
      title: 'Design System',
      items: [
        { id: 'mobile-tokens', name: 'Visual Tokens', icon: 'tokens' },
        { id: 'mobile-typography', name: 'Typography', icon: 'typography' },
        { id: 'mobile-library', name: 'UI Library', icon: 'library' },
        { id: 'mobile-export', name: 'Theme Export', icon: 'export' },
      ]
    },
    {
      id: 'pillar-4',
      title: 'Advanced Controls',
      items: [
        { id: 'mobile-security', name: 'Security Hub', icon: 'security' },
        { id: 'mobile-analytics', name: 'Analytics Hub', icon: 'identity' },
        { id: 'mobile-legal', name: 'Compliance Hub', icon: 'terms' },
        { id: 'mobile-localization', name: 'Localization', icon: 'localization' },
        { id: 'mobile-seo', name: 'SEO & Metadata', icon: 'seo' },
        { id: 'mobile-updates', name: 'Force Updates', icon: 'updates' },
      ]
    },
    {
      id: 'pillar-user-flows',
      title: 'User Flows',
      items: [
         // User requested: Engagement, Announcements, Billing, Backend & Ops
        { id: 'mobile-announcements', name: 'Banners', icon: 'announcements' },
        { id: 'mobile-api', name: 'API Settings', icon: 'api' },
        { id: 'mobile-features', name: 'Feature Flags', icon: 'features' },
        { id: 'mobile-legal', name: 'Legal & Terms', icon: 'terms' },
        { id: 'mobile-team', name: 'Team Manage', icon: 'team' },
      ]
    },
    {
      id: 'pillar-component-studio',
      title: 'Component Studio',
      items: [
        // UI Component Categories (loaded from database)
        { id: 'buttons', name: 'Buttons', icon: 'buttons' },
        { id: 'cards', name: 'Cards', icon: 'cards' },
        { id: 'inputs', name: 'Inputs', icon: 'inputs' },
        { id: 'layout', name: 'Layout', icon: 'layout' },
        { id: 'feedback', name: 'Feedback', icon: 'feedback' },
        { id: 'mobile-nav', name: 'Navigation', icon: 'mobile-nav' },
        { id: 'mobile-actions', name: 'Actions', icon: 'mobile-actions' },
        { id: 'data-display', name: 'Data Display', icon: 'charts-data' },
        { id: 'status-feedback', name: 'Status & Feedback', icon: 'feedback' },
        { id: 'advanced-inputs', name: 'Advanced Inputs', icon: 'inputs' },
        { id: 'lists-grids', name: 'Lists & Grids', icon: 'lists-grids' },
        { id: 'communication', name: 'Communication', icon: 'communication' },
        { id: 'media-assets', name: 'Media', icon: 'media-assets' },
        { id: 'safety-ui', name: 'Safety & SOS', icon: 'safety-ui' },
        { id: 'charts-data', name: 'Charts', icon: 'charts-data' },
        { id: 'app-widgets', name: 'Widgets', icon: 'app-widgets' },
        { id: 'navigation-ui', name: 'Navigation UI', icon: 'navigation-ui' },
        // Icon Categories
        { id: 'social-icons', name: 'Social Icons', icon: 'social' },
        { id: 'flag-icons', name: 'Country Flags', icon: 'localization' },
      ]
    }
  ]
