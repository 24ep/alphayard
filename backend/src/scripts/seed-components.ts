// @ts-nocheck
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

// Helper to create solid color values
const solidColor = (color: string) => ({ mode: 'solid', solid: color });

// All UI Components organized by category
const UI_COMPONENTS = {
    // Buttons Category
    buttons: {
        name: 'Buttons',
        description: 'Configure interaction elements.',
        icon: 'buttons',
        components: [
            {
                id: 'primary',
                name: 'Primary Button',
                type: 'button',
                styles: { backgroundColor: solidColor('#FFB6C1'), textColor: solidColor('#FFFFFF'), borderRadius: 12, borderColor: solidColor('transparent'), shadowLevel: 'sm', clickAnimation: 'scale' },
                mobileConfig: { componentName: 'ThemedButton', filePath: 'components/common/ThemedButton.tsx', usageExample: '<ThemedButton componentId="primary" label="Click Me" onPress={handlePress} />' }
            },
            {
                id: 'secondary',
                name: 'Secondary Button',
                type: 'button',
                styles: { backgroundColor: solidColor('#F3F4F6'), textColor: solidColor('#4B5563'), borderRadius: 12, borderColor: solidColor('transparent'), shadowLevel: 'none', clickAnimation: 'scale' },
                mobileConfig: { componentName: 'ThemedButton', filePath: 'components/common/ThemedButton.tsx', usageExample: '<ThemedButton componentId="secondary" label="Cancel" onPress={handleCancel} />' }
            },
            {
                id: 'destructive',
                name: 'Destructive Button',
                type: 'button',
                styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF'), borderRadius: 12, borderColor: solidColor('transparent'), shadowLevel: 'none', clickAnimation: 'scale' },
                mobileConfig: { componentName: 'ThemedButton', filePath: 'components/common/ThemedButton.tsx', usageExample: '<ThemedButton componentId="destructive" label="Delete" onPress={handleDelete} />' }
            },
            {
                id: 'outline',
                name: 'Outline Button',
                type: 'button',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#6366F1'), borderRadius: 12, borderColor: solidColor('#6366F1'), shadowLevel: 'none', clickAnimation: 'scale' },
                mobileConfig: { componentName: 'ThemedButton', filePath: 'components/common/ThemedButton.tsx', usageExample: '<ThemedButton componentId="outline" label="Learn More" onPress={handlePress} />' }
            },
            {
                id: 'ghost',
                name: 'Ghost Button',
                type: 'button',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#64748B'), borderRadius: 12, borderColor: solidColor('transparent'), shadowLevel: 'none', clickAnimation: 'opacity' },
                mobileConfig: { componentName: 'ThemedButton', filePath: 'components/common/ThemedButton.tsx', usageExample: '<ThemedButton componentId="ghost" label="Skip" onPress={handleSkip} />' }
            },
            {
                id: 'icon-button',
                name: 'Icon Button',
                type: 'button',
                styles: { backgroundColor: solidColor('#F1F5F9'), textColor: solidColor('#475569'), borderRadius: 99, borderColor: solidColor('transparent'), shadowLevel: 'none' },
                mobileConfig: { componentName: 'IconButton', filePath: 'components/common/IconButton.tsx', usageExample: '<IconButton icon="settings" onPress={openSettings} />' }
            },
            {
                id: 'link-button',
                name: 'Link Button',
                type: 'button',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#3B82F6'), borderRadius: 0, borderColor: solidColor('transparent'), shadowLevel: 'none' },
                mobileConfig: { componentName: 'LinkButton', filePath: 'components/common/LinkButton.tsx', usageExample: '<LinkButton label="View Terms" onPress={openTerms} />' }
            }
        ]
    },

    // Cards Category
    cards: {
        name: 'Cards',
        description: 'Define content wrappers.',
        icon: 'cards',
        components: [
            {
                id: 'standard',
                name: 'Standard Card',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16, borderColor: solidColor('#E5E7EB'), shadowLevel: 'md' },
                mobileConfig: { componentName: 'Card', filePath: 'components/ui/Card.tsx', usageExample: '<Card><Text>Content goes here</Text></Card>' }
            },
            {
                id: 'elevated',
                name: 'Elevated Card',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 20, borderColor: solidColor('transparent'), shadowLevel: 'lg' },
                mobileConfig: { componentName: 'Card', filePath: 'components/ui/Card.tsx', usageExample: '<Card variant="elevated"><Content /></Card>' }
            },
            {
                id: 'outlined',
                name: 'Outlined Card',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16, borderColor: solidColor('#E2E8F0'), shadowLevel: 'none' },
                mobileConfig: { componentName: 'Card', filePath: 'components/ui/Card.tsx', usageExample: '<Card variant="outlined"><Content /></Card>' }
            },
            {
                id: 'glass',
                name: 'Glass Card',
                type: 'card',
                styles: { backgroundColor: solidColor('rgba(255,255,255,0.8)'), borderRadius: 24, borderColor: solidColor('rgba(255,255,255,0.2)'), shadowLevel: 'md' },
                mobileConfig: { componentName: 'GlassCard', filePath: 'components/ui/GlassCard.tsx', usageExample: '<GlassCard intensity={80}><Text>Frosted Glass Effect</Text></GlassCard>' }
            },
            {
                id: 'interactive',
                name: 'Interactive Card',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16, borderColor: solidColor('#E5E7EB'), shadowLevel: 'sm' },
                mobileConfig: { componentName: 'InteractiveCard', filePath: 'components/ui/InteractiveCard.tsx', usageExample: '<InteractiveCard onPress={handlePress}><Content /></InteractiveCard>' }
            }
        ]
    },

    // Inputs Category
    inputs: {
        name: 'Inputs',
        description: 'Text fields & form elements.',
        icon: 'inputs',
        components: [
            {
                id: 'text',
                name: 'Text Input',
                type: 'input',
                styles: { backgroundColor: solidColor('#F9FAFB'), borderRadius: 12, borderColor: solidColor('#E5E7EB'), textColor: solidColor('#111827'), focusBorderColor: solidColor('#3B82F6'), validBorderColor: solidColor('#10B981'), invalidBorderColor: solidColor('#EF4444') },
                mobileConfig: { componentName: 'Input', filePath: 'components/ui/Input.tsx', usageExample: '<Input placeholder="Enter name" value={name} onChangeText={setName} />' }
            },
            {
                id: 'password',
                name: 'Password Input',
                type: 'input',
                styles: { backgroundColor: solidColor('#F9FAFB'), borderRadius: 12, borderColor: solidColor('#E5E7EB'), textColor: solidColor('#111827'), focusBorderColor: solidColor('#3B82F6') },
                mobileConfig: { componentName: 'PasswordInput', filePath: 'components/ui/PasswordInput.tsx', usageExample: '<PasswordInput value={password} onChangeText={setPassword} />' }
            },
            {
                id: 'textarea',
                name: 'Text Area',
                type: 'input',
                styles: { backgroundColor: solidColor('#F9FAFB'), borderRadius: 12, borderColor: solidColor('#E5E7EB'), textColor: solidColor('#111827'), focusBorderColor: solidColor('#3B82F6') },
                mobileConfig: { componentName: 'TextArea', filePath: 'components/ui/TextArea.tsx', usageExample: '<TextArea placeholder="Enter message..." value={message} onChangeText={setMessage} />' }
            },
            {
                id: 'search',
                name: 'Search Input',
                type: 'input',
                styles: { backgroundColor: solidColor('#F1F5F9'), borderRadius: 99, borderColor: solidColor('transparent'), textColor: solidColor('#64748B') },
                mobileConfig: { componentName: 'SearchInput', filePath: 'components/ui/SearchInput.tsx', usageExample: '<SearchInput value={query} onChangeText={setQuery} onSubmit={handleSearch} />' }
            },
            {
                id: 'select',
                name: 'Dropdown Select',
                type: 'input',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 12, borderColor: solidColor('#E5E7EB'), textColor: solidColor('#111827') },
                mobileConfig: { componentName: 'Select', filePath: 'components/ui/Select.tsx', usageExample: '<Select options={options} value={selected} onChange={setSelected} />' }
            },
            {
                id: 'checkbox',
                name: 'Checkbox',
                type: 'input',
                styles: { backgroundColor: solidColor('#6366F1'), borderRadius: 4, borderColor: solidColor('#E5E7EB') },
                mobileConfig: { componentName: 'Checkbox', filePath: 'components/ui/Checkbox.tsx', usageExample: '<Checkbox checked={isChecked} onChange={setIsChecked} label="I agree" />' }
            },
            {
                id: 'radio',
                name: 'Radio Button',
                type: 'input',
                styles: { backgroundColor: solidColor('#6366F1'), borderColor: solidColor('#E5E7EB') },
                mobileConfig: { componentName: 'RadioButton', filePath: 'components/ui/RadioButton.tsx', usageExample: '<RadioButton selected={option === "a"} onPress={() => setOption("a")} label="Option A" />' }
            },
            {
                id: 'date-picker',
                name: 'Date Picker',
                type: 'input',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 12, borderColor: solidColor('#E5E7EB'), textColor: solidColor('#111827') },
                mobileConfig: { componentName: 'DatePicker', filePath: 'components/ui/DatePicker.tsx', usageExample: '<DatePicker value={date} onChange={setDate} />' }
            },
            {
                id: 'time-picker',
                name: 'Time Picker',
                type: 'input',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 12, borderColor: solidColor('#E5E7EB'), textColor: solidColor('#111827') },
                mobileConfig: { componentName: 'TimePicker', filePath: 'components/ui/TimePicker.tsx', usageExample: '<TimePicker value={time} onChange={setTime} />' }
            }
        ]
    },

    // Layout Category
    layout: {
        name: 'Layout',
        description: 'Structure & Containers.',
        icon: 'layout',
        components: [
            {
                id: 'container',
                name: 'Main Wrapper',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'Container', filePath: 'components/ui/Container.tsx', usageExample: '<Container><Header /><Content /></Container>' }
            },
            {
                id: 'screen',
                name: 'Screen Layout',
                type: 'card',
                styles: { backgroundColor: solidColor('#F8FAFC') },
                mobileConfig: { componentName: 'ScreenLayout', filePath: 'components/ui/ScreenLayout.tsx', usageExample: '<ScreenLayout header={<Header />}><Content /></ScreenLayout>' }
            },
            {
                id: 'divider',
                name: 'Divider',
                type: 'generic',
                styles: { backgroundColor: solidColor('#E5E7EB') },
                mobileConfig: { componentName: 'Divider', filePath: 'components/ui/Divider.tsx', usageExample: '<Divider />' }
            },
            {
                id: 'spacer',
                name: 'Spacer',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent') },
                mobileConfig: { componentName: 'Spacer', filePath: 'components/ui/Spacer.tsx', usageExample: '<Spacer size={16} />' }
            }
        ]
    },

    // Feedback Category
    feedback: {
        name: 'Feedback',
        description: 'Toasts & Modals.',
        icon: 'feedback',
        components: [
            {
                id: 'toast',
                name: 'Toast Message',
                type: 'card',
                styles: { backgroundColor: solidColor('#1F2937'), textColor: solidColor('#FFFFFF'), borderRadius: 8, borderColor: solidColor('transparent'), shadowLevel: 'sm' },
                mobileConfig: { componentName: 'Toast', filePath: 'components/ui/Toast.tsx', usageExample: "Toast.show({ type: 'success', text1: 'Hello', text2: 'This is a toast message' });" }
            },
            {
                id: 'success-toast',
                name: 'Success Toast',
                type: 'card',
                styles: { backgroundColor: solidColor('#10B981'), textColor: solidColor('#FFFFFF'), borderRadius: 8 },
                mobileConfig: { componentName: 'Toast', filePath: 'components/ui/Toast.tsx', usageExample: "Toast.show({ type: 'success', text1: 'Success!' });" }
            },
            {
                id: 'error-toast',
                name: 'Error Toast',
                type: 'card',
                styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF'), borderRadius: 8 },
                mobileConfig: { componentName: 'Toast', filePath: 'components/ui/Toast.tsx', usageExample: "Toast.show({ type: 'error', text1: 'Error occurred' });" }
            },
            {
                id: 'modal',
                name: 'Modal Dialog',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 20, shadowLevel: 'xl' },
                mobileConfig: { componentName: 'Modal', filePath: 'components/ui/Modal.tsx', usageExample: '<Modal visible={isOpen} onClose={close}><ModalContent /></Modal>' }
            },
            {
                id: 'alert',
                name: 'Alert Dialog',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16, shadowLevel: 'lg' },
                mobileConfig: { componentName: 'AlertDialog', filePath: 'components/ui/AlertDialog.tsx', usageExample: '<AlertDialog title="Confirm" message="Are you sure?" onConfirm={confirm} />' }
            }
        ]
    },

    // Mobile Navigation Category
    'mobile-nav': {
        name: 'Mobile Navigation',
        description: 'Tab bars, drawers, and menus.',
        icon: 'mobile-nav',
        components: [
            {
                id: 'bottom-sheet',
                name: 'Bottom Sheet',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 32, borderColor: solidColor('transparent'), shadowLevel: 'lg' },
                mobileConfig: { componentName: 'BottomSheet', filePath: 'components/ui/BottomSheet.tsx', usageExample: '<BottomSheet ref={sheetRef} snapPoints={["50%"]}><View><Text>Sheet Content</Text></View></BottomSheet>' }
            },
            {
                id: 'drawer-overlay',
                name: 'Side Drawer',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'Drawer', filePath: 'components/ui/Drawer.tsx', usageExample: '<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}><MenuContent /></Drawer>' }
            },
            {
                id: 'tab-navigation',
                name: 'Mobile Tabbar',
                type: 'tabbar',
                styles: { backgroundColor: solidColor('rgba(255,255,255,0.95)'), textColor: solidColor('#64748B') },
                mobileConfig: { componentName: 'Tabbar', filePath: 'components/ui/Tabbar.tsx', usageExample: '<Tabbar tabs={tabs} activeId={activeTab} onSelect={handleTabSelect} />' }
            },
            {
                id: 'segmented-control',
                name: 'Segmented Control',
                type: 'tabbar',
                styles: { backgroundColor: solidColor('#F1F5F9'), borderRadius: 16, borderColor: solidColor('transparent') },
                mobileConfig: { componentName: 'SegmentedControl', filePath: 'components/ui/SegmentedControl.tsx', usageExample: '<SegmentedControl values={["Map", "List"]} selectedIndex={idx} onChange={setIdx} />' }
            },
            {
                id: 'accordion-menu',
                name: 'Accordion Menu',
                type: 'accordion',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16 },
                mobileConfig: { componentName: 'Accordion', filePath: 'components/ui/Accordion.tsx', usageExample: '<Accordion title="Advanced Options"><SettingsList /></Accordion>' }
            },
            {
                id: 'header-bar',
                name: 'Header Bar',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), textColor: solidColor('#111827'), shadowLevel: 'sm' },
                mobileConfig: { componentName: 'HeaderBar', filePath: 'components/ui/HeaderBar.tsx', usageExample: '<HeaderBar title="Settings" leftIcon="back" onLeftPress={goBack} />' }
            }
        ]
    },

    // Mobile Actions Category
    'mobile-actions': {
        name: 'Mobile Actions',
        description: 'Floating buttons and quick actions.',
        icon: 'mobile-actions',
        components: [
            {
                id: 'fab-action',
                name: 'Floating Button',
                type: 'button',
                styles: { backgroundColor: solidColor('#6366F1'), textColor: solidColor('#FFFFFF'), borderRadius: 99 },
                mobileConfig: { componentName: 'FloatingActionButton', filePath: 'components/ui/FloatingActionButton.tsx', usageExample: '<FloatingActionButton icon={<PlusIcon />} onPress={handleCreate} />' }
            },
            {
                id: 'floating-menu',
                name: 'Radial Menu',
                type: 'button',
                styles: { backgroundColor: solidColor('#1E293B'), textColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'FloatingMenu', filePath: 'components/ui/FloatingMenu.tsx', usageExample: '<FloatingMenu items={[{ icon: "camera", onPress: openCamera }]} />' }
            },
            {
                id: 'action-sheet',
                name: 'Action Sheet',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 24 },
                mobileConfig: { componentName: 'ActionSheet', filePath: 'components/ui/ActionSheet.tsx', usageExample: 'ActionSheet.show({ options: ["Edit", "Delete", "Cancel"] }, handleSelect);' }
            },
            {
                id: 'pull-refresh',
                name: 'Pull Refresh',
                type: 'generic',
                styles: { textColor: solidColor('#6366F1') },
                mobileConfig: { componentName: 'PullToRefresh', filePath: 'components/ui/PullToRefresh.tsx', usageExample: '<ScrollView refreshControl={<PullToRefresh refreshing={loading} onRefresh={refetch} />}>{content}</ScrollView>' }
            },
            {
                id: 'swipe-actions',
                name: 'Swipe Actions',
                type: 'generic',
                styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'SwipeableRow', filePath: 'components/ui/SwipeableRow.tsx', usageExample: '<SwipeableRow leftActions={editAction} rightActions={deleteAction}><ListItem /></SwipeableRow>' }
            }
        ]
    },

    // Data Display Category
    'data-display': {
        name: 'Data Display',
        description: 'Charts, stats, and visualizers.',
        icon: 'data-display',
        components: [
            {
                id: 'metric-card',
                name: 'Metric Card',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 24, borderColor: solidColor('#F1F5F9'), shadowLevel: 'sm' },
                mobileConfig: { componentName: 'MetricCard', filePath: 'components/ui/MetricCard.tsx', usageExample: '<MetricCard title="Total Sales" value="$1,234" trend="+5%" trendColor="green" />' }
            },
            {
                id: 'stat-roll',
                name: 'Statistic Roll',
                type: 'generic',
                styles: { textColor: solidColor('#0F172A') },
                mobileConfig: { componentName: 'StatisticRoll', filePath: 'components/ui/StatisticRoll.tsx', usageExample: '<StatisticRoll label="Active Users" value={5432} duration={2000} />' }
            },
            {
                id: 'sparkline-chart',
                name: 'Sparkline Chart',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#6366F1') },
                mobileConfig: { componentName: 'Sparkline', filePath: 'components/ui/Sparkline.tsx', usageExample: '<Sparkline data={[10, 20, 15, 40, 30, 60]} width={100} height={50} />' }
            },
            {
                id: 'avatar-group',
                name: 'Avatar Stack',
                type: 'badge',
                styles: { borderColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'AvatarGroup', filePath: 'components/ui/AvatarGroup.tsx', usageExample: '<AvatarGroup images={[img1, img2, img3]} limit={3} size={40} />' }
            },
            {
                id: 'timeline-main',
                name: 'Timeline List',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), borderColor: solidColor('#E2E8F0') },
                mobileConfig: { componentName: 'Timeline', filePath: 'components/ui/Timeline.tsx', usageExample: '<Timeline data={events} renderItem={({ item }) => <EventCard event={item} />} />' }
            },
            {
                id: 'carousel-view',
                name: 'Carousel Gallery',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), borderRadius: 24 },
                mobileConfig: { componentName: 'Carousel', filePath: 'components/ui/Carousel.tsx', usageExample: '<Carousel data={banners} renderItem={renderBanner} loop={true} />' }
            },
            {
                id: 'progress-bar',
                name: 'Progress Bar',
                type: 'generic',
                styles: { backgroundColor: solidColor('#E2E8F0'), textColor: solidColor('#6366F1'), borderRadius: 8 },
                mobileConfig: { componentName: 'ProgressBar', filePath: 'components/ui/ProgressBar.tsx', usageExample: '<ProgressBar progress={0.65} />' }
            }
        ]
    },

    // Status & Feedback Category
    'status-feedback': {
        name: 'Status & Feedback',
        description: 'Indicators and progress.',
        icon: 'status-feedback',
        components: [
            {
                id: 'status-indicator',
                name: 'Status Indicator',
                type: 'badge',
                styles: { backgroundColor: solidColor('#10B981') },
                mobileConfig: { componentName: 'StatusIndicator', filePath: 'components/ui/StatusIndicator.tsx', usageExample: '<StatusIndicator status="online" label="Active" />' }
            },
            {
                id: 'notification-dot',
                name: 'Badge Indicator',
                type: 'badge',
                styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'NotificationBadge', filePath: 'components/ui/NotificationBadge.tsx', usageExample: '<View><Icon name="bell" /><NotificationBadge count={5} /></View>' }
            },
            {
                id: 'progress-ring',
                name: 'Progress Ring',
                type: 'generic',
                styles: { textColor: solidColor('#6366F1'), backgroundColor: solidColor('#E2E8F0') },
                mobileConfig: { componentName: 'ProgressRing', filePath: 'components/ui/ProgressRing.tsx', usageExample: '<ProgressRing progress={0.75} strokeWidth={4} size={60} />' }
            },
            {
                id: 'skeleton-wrapper',
                name: 'Skeleton Loader',
                type: 'generic',
                styles: { backgroundColor: solidColor('#F1F5F9'), borderRadius: 16 },
                mobileConfig: { componentName: 'SkeletonWrapper', filePath: 'components/ui/SkeletonWrapper.tsx', usageExample: '<SkeletonWrapper loading={isLoading}><UserProfile /></SkeletonWrapper>' }
            },
            {
                id: 'rating-stars',
                name: 'Rating Stars',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#FBBF24') },
                mobileConfig: { componentName: 'Rating', filePath: 'components/ui/Rating.tsx', usageExample: '<Rating startingValue={4.5} imageSize={20} onFinishRating={ratingCompleted} />' }
            },
            {
                id: 'loading-spinner',
                name: 'Loading Spinner',
                type: 'generic',
                styles: { textColor: solidColor('#6366F1') },
                mobileConfig: { componentName: 'Spinner', filePath: 'components/ui/Spinner.tsx', usageExample: '<Spinner size="large" />' }
            }
        ]
    },

    // Advanced Inputs Category
    'advanced-inputs': {
        name: 'Advanced Inputs',
        description: 'Sliders, toggles, chips.',
        icon: 'advanced-inputs',
        components: [
            {
                id: 'otp-input',
                name: 'OTP field',
                type: 'input',
                styles: { backgroundColor: solidColor('#F8FAFC'), borderRadius: 12, borderColor: solidColor('#E2E8F0'), shadowLevel: 'none', focusBorderColor: solidColor('#6366F1'), validBorderColor: solidColor('#10B981'), invalidBorderColor: solidColor('#EF4444') },
                mobileConfig: { componentName: 'OTPInput', filePath: 'components/ui/OTPInput.tsx', usageExample: '<OTPInput code={code} onCodeChanged={setCode} pinCount={6} />' }
            },
            {
                id: 'mobile-slider',
                name: 'Mobile Slider',
                type: 'input',
                styles: { backgroundColor: solidColor('#6366F1'), borderRadius: 8 },
                mobileConfig: { componentName: 'Slider', filePath: 'components/ui/Slider.tsx', usageExample: '<Slider value={brightness} minimumValue={0} maximumValue={1} onValueChange={setBrightness} />' }
            },
            {
                id: 'stepper-control',
                name: 'Quantifier Stepper',
                type: 'input',
                styles: { backgroundColor: solidColor('#F1F5F9'), borderRadius: 12 },
                mobileConfig: { componentName: 'Stepper', filePath: 'components/ui/Stepper.tsx', usageExample: '<Stepper value={quantity} onIncrement={inc} onDecrement={dec} />' }
            },
            {
                id: 'toggle-switch',
                name: 'Modern Toggle',
                type: 'input',
                styles: { backgroundColor: solidColor('#E2E8F0') },
                mobileConfig: { componentName: 'ToggleSwitch', filePath: 'components/ui/ToggleSwitch.tsx', usageExample: '<ToggleSwitch isOn={isEnabled} onToggle={toggleSwitch} />' }
            },
            {
                id: 'chip-group',
                name: 'Chip Tags',
                type: 'badge',
                styles: { backgroundColor: solidColor('#E2E8F0'), borderRadius: 99, textColor: solidColor('#475569') },
                mobileConfig: { componentName: 'ChipField', filePath: 'components/ui/ChipField.tsx', usageExample: '<ChipField tags={["React", "Native"]} onTagPress={handleTagPress} />' }
            },
            {
                id: 'search-overlay',
                name: 'Full Search',
                type: 'input',
                styles: { backgroundColor: solidColor('rgba(255,255,255,0.98)') },
                mobileConfig: { componentName: 'SearchOverlay', filePath: 'components/ui/SearchOverlay.tsx', usageExample: '<SearchOverlay visible={isSearching} onClose={() => setIsSearching(false)} onSearch={performSearch} />' }
            },
            {
                id: 'color-picker',
                name: 'Color Picker',
                type: 'input',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16, borderColor: solidColor('#E5E7EB') },
                mobileConfig: { componentName: 'ColorPicker', filePath: 'components/ui/ColorPicker.tsx', usageExample: '<ColorPicker color={color} onColorChange={setColor} />' }
            }
        ]
    },

    // Lists & Grids Category
    'lists-grids': {
        name: 'Lists & Grids',
        description: 'Advanced data repeaters.',
        icon: 'lists-grids',
        components: [
            {
                id: 'swipeable-list',
                name: 'Swipeable Rows',
                type: 'generic',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderColor: solidColor('#F1F5F9'), borderRadius: 12 },
                mobileConfig: { componentName: 'SwipeableList', filePath: 'components/ui/SwipeableList.tsx', usageExample: '<SwipeableList data={messages} renderItem={renderMessage} renderHiddenItem={renderActions} />' }
            },
            {
                id: 'sortable-list',
                name: 'Sortable DND List',
                type: 'generic',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 12 },
                mobileConfig: { componentName: 'SortableList', filePath: 'components/ui/SortableList.tsx', usageExample: '<SortableList data={playlist} onRowMoved={handleRowMove} renderRow={renderSong} />' }
            },
            {
                id: 'infinite-scroll',
                name: 'Infinite Scroll',
                type: 'generic',
                styles: { textColor: solidColor('#94A3B8') },
                mobileConfig: { componentName: 'InfiniteScroll', filePath: 'components/ui/InfiniteScroll.tsx', usageExample: '<InfiniteScroll renderItem={renderItem} data={data} loadMore={fetchNextPage} />' }
            },
            {
                id: 'grid-view',
                name: 'Grid View',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent') },
                mobileConfig: { componentName: 'GridView', filePath: 'components/ui/GridView.tsx', usageExample: '<GridView data={items} numColumns={2} renderItem={renderItem} />' }
            },
            {
                id: 'masonry-grid',
                name: 'Masonry Grid',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent') },
                mobileConfig: { componentName: 'MasonryList', filePath: 'components/ui/MasonryList.tsx', usageExample: '<MasonryList data={images} numColumns={2} renderItem={renderImage} />' }
            }
        ]
    },

    // Communication UI Category
    communication: {
        name: 'Communication UI',
        description: 'Chat bubbles, inputs, and status.',
        icon: 'communication',
        components: [
            {
                id: 'message-bubble-sent',
                name: 'Sent Message',
                type: 'card',
                styles: { backgroundColor: solidColor('#E8B4A1'), textColor: solidColor('#FFFFFF'), borderRadius: 16 },
                mobileConfig: { componentName: 'MessageBubble', filePath: 'components/chat/MessageBubble.tsx', usageExample: '<MessageBubble isOwnMessage={true} text="Hello!" />' }
            },
            {
                id: 'message-bubble-received',
                name: 'Received Message',
                type: 'card',
                styles: { backgroundColor: solidColor('#F3F4F6'), textColor: solidColor('#111827'), borderRadius: 16 },
                mobileConfig: { componentName: 'MessageBubble', filePath: 'components/chat/MessageBubble.tsx', usageExample: '<MessageBubble isOwnMessage={false} text="Hi there!" />' }
            },
            {
                id: 'chat-input',
                name: 'Chat Input',
                type: 'input',
                styles: { backgroundColor: solidColor('#F8FAFC'), borderRadius: 24, borderColor: solidColor('#E5E7EB') },
                mobileConfig: { componentName: 'ChatInput', filePath: 'components/chat/ChatInput.tsx', usageExample: '<ChatInput value={message} onChangeText={setMessage} onSend={sendMessage} />' }
            },
            {
                id: 'typing-indicator',
                name: 'Typing Indicator',
                type: 'generic',
                styles: { backgroundColor: solidColor('#F3F4F6'), textColor: solidColor('#9CA3AF'), borderRadius: 16 },
                mobileConfig: { componentName: 'TypingIndicator', filePath: 'components/chat/TypingIndicator.tsx', usageExample: '<TypingIndicator isTyping={otherUserTyping} />' }
            },
            {
                id: 'read-receipt',
                name: 'Read Receipt',
                type: 'generic',
                styles: { textColor: solidColor('#3B82F6') },
                mobileConfig: { componentName: 'ReadReceipt', filePath: 'components/chat/ReadReceipt.tsx', usageExample: '<ReadReceipt status="read" />' }
            }
        ]
    },

    // Media & Assets Category
    'media-assets': {
        name: 'Media & Assets',
        description: 'Avatars, images, and galleries.',
        icon: 'media-assets',
        components: [
            {
                id: 'avatar-standard',
                name: 'User Avatar',
                type: 'badge',
                styles: { borderRadius: 99, borderColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'Avatar', filePath: 'components/common/Avatar.tsx', usageExample: '<Avatar source={userImage} size={40} />' }
            },
            {
                id: 'avatar-with-badge',
                name: 'Avatar with Badge',
                type: 'badge',
                styles: { borderRadius: 99, borderColor: solidColor('#FFFFFF') },
                mobileConfig: { componentName: 'AvatarWithBadge', filePath: 'components/common/AvatarWithBadge.tsx', usageExample: '<AvatarWithBadge source={userImage} badgeIcon="verified" />' }
            },
            {
                id: 'image-gallery',
                name: 'Image Gallery',
                type: 'generic',
                styles: { backgroundColor: solidColor('#000000'), borderRadius: 0 },
                mobileConfig: { componentName: 'ImageGallery', filePath: 'components/ui/ImageGallery.tsx', usageExample: '<ImageGallery images={photos} initialIndex={0} />' }
            },
            {
                id: 'video-player',
                name: 'Video Player',
                type: 'generic',
                styles: { backgroundColor: solidColor('#000000'), borderRadius: 16 },
                mobileConfig: { componentName: 'VideoPlayer', filePath: 'components/ui/VideoPlayer.tsx', usageExample: '<VideoPlayer source={videoUrl} autoPlay={false} />' }
            }
        ]
    },

    // Safety UI Category
    'safety-ui': {
        name: 'Safety & SOS',
        description: 'Emergency controls and alerts.',
        icon: 'safety-ui',
        components: [
            {
                id: 'sos-button',
                name: 'SOS Panic Button',
                type: 'button',
                styles: { backgroundColor: solidColor('#EF4444'), textColor: solidColor('#FFFFFF'), borderRadius: 99 },
                mobileConfig: { componentName: 'SOSButton', filePath: 'components/safety/SOSButton.tsx', usageExample: '<SOSButton onPress={handleSOS} />' }
            },
            {
                id: 'emergency-alert',
                name: 'Emergency Alert',
                type: 'card',
                styles: { backgroundColor: solidColor('#FEF2F2'), textColor: solidColor('#991B1B'), borderRadius: 16, borderColor: solidColor('#FCA5A5') },
                mobileConfig: { componentName: 'EmergencyAlert', filePath: 'components/safety/EmergencyAlert.tsx', usageExample: '<EmergencyAlert message="Help is on the way" />' }
            },
            {
                id: 'safety-check',
                name: 'Safety Check-in',
                type: 'card',
                styles: { backgroundColor: solidColor('#ECFDF5'), textColor: solidColor('#065F46'), borderRadius: 16, borderColor: solidColor('#6EE7B7') },
                mobileConfig: { componentName: 'SafetyCheckIn', filePath: 'components/safety/SafetyCheckIn.tsx', usageExample: '<SafetyCheckIn onCheckIn={handleCheckIn} />' }
            }
        ]
    },

    // Charts & Analytics Category
    'charts-data': {
        name: 'Charts & Analytics',
        description: 'Heatmaps, bar charts, and data viz.',
        icon: 'charts-data',
        components: [
            {
                id: 'heatmap-personal',
                name: 'Personal Wellbeing Heatmap',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), borderRadius: 12 },
                mobileConfig: { componentName: 'EmotionHeatMap', filePath: 'components/EmotionHeatMap.tsx', usageExample: '<EmotionHeatMap type="personal" data={records} />' }
            },
            {
                id: 'bar-chart',
                name: 'Bar Chart',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#6366F1') },
                mobileConfig: { componentName: 'BarChart', filePath: 'components/charts/BarChart.tsx', usageExample: '<BarChart data={chartData} />' }
            },
            {
                id: 'line-chart',
                name: 'Line Chart',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#6366F1') },
                mobileConfig: { componentName: 'LineChart', filePath: 'components/charts/LineChart.tsx', usageExample: '<LineChart data={trendData} />' }
            },
            {
                id: 'pie-chart',
                name: 'Pie Chart',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent') },
                mobileConfig: { componentName: 'PieChart', filePath: 'components/charts/PieChart.tsx', usageExample: '<PieChart data={distribution} />' }
            }
        ]
    },

    // Dashboard Widgets Category
    'app-widgets': {
        name: 'Dashboard Widgets',
        description: 'HomeScreen overview components.',
        icon: 'app-widgets',
        components: [
            {
                id: 'weather-widget',
                name: 'Weather Widget',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16 },
                mobileConfig: { componentName: 'WeatherWidget', filePath: 'components/widgets/WeatherWidget.tsx', usageExample: '<WeatherWidget />' }
            },
            {
                id: 'quick-actions-widget',
                name: 'Quick Actions',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16 },
                mobileConfig: { componentName: 'QuickActionsWidget', filePath: 'components/widgets/QuickActionsWidget.tsx', usageExample: '<QuickActionsWidget actions={quickActions} />' }
            },
            {
                id: 'summary-widget',
                name: 'Summary Widget',
                type: 'card',
                styles: { backgroundColor: solidColor('#FFFFFF'), borderRadius: 16, shadowLevel: 'sm' },
                mobileConfig: { componentName: 'SummaryWidget', filePath: 'components/widgets/SummaryWidget.tsx', usageExample: '<SummaryWidget title="Today" stats={dailyStats} />' }
            }
        ]
    },

    // Navigation UI Category
    'navigation-ui': {
        name: 'Navigation UI',
        description: 'Tab bars, drawers, and menus.',
        icon: 'navigation-ui',
        components: [
            {
                id: 'main-tab-bar',
                name: 'Main Bottom Tabs',
                type: 'tabbar',
                styles: { backgroundColor: solidColor('#FFFFFF'), textColor: solidColor('#FA7272') },
                mobileConfig: { componentName: 'MainTabNavigator', filePath: 'navigation/MainTabNavigator.tsx', usageExample: 'Configure active/inactive tints and background.' }
            },
            {
                id: 'top-navigation',
                name: 'Top Navigation',
                type: 'tabbar',
                styles: { backgroundColor: solidColor('#FFFFFF'), textColor: solidColor('#6366F1') },
                mobileConfig: { componentName: 'TopNavigation', filePath: 'components/ui/TopNavigation.tsx', usageExample: '<TopNavigation tabs={tabs} activeTab={active} onTabPress={setActive} />' }
            },
            {
                id: 'breadcrumb',
                name: 'Breadcrumb',
                type: 'generic',
                styles: { backgroundColor: solidColor('transparent'), textColor: solidColor('#64748B') },
                mobileConfig: { componentName: 'Breadcrumb', filePath: 'components/ui/Breadcrumb.tsx', usageExample: '<Breadcrumb items={["Home", "Settings", "Profile"]} />' }
            }
        ]
    }
};

async function main() {
    await client.connect();
    console.log('Connected to database');

    // Get all active applications
    console.log('Fetching active applications...');
    const result = await client.query('SELECT id, name, branding FROM applications WHERE is_active = true');
    const apps = result.rows;

    if (apps.length === 0) {
        console.log('No active applications found. Create an application first.');
        return;
    }

    console.log(`Found ${apps.length} active applications.`);

    for (const app of apps) {
        console.log(`\nSeeding UI components for app: ${app.name} (${app.id})...`);

        // Get current branding
        let branding = app.branding || {};
        
        // Initialize uiComponents config if not exists
        if (!branding.uiComponents) {
            branding.uiComponents = {};
        }

        let totalCategories = 0;
        let totalComponents = 0;

        // Seed all UI component categories
        for (const [categoryId, category] of Object.entries(UI_COMPONENTS)) {
            if (!branding.uiComponents[categoryId]) {
                branding.uiComponents[categoryId] = {
                    id: categoryId,
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    components: {}
                };
                totalCategories++;
            }

            // Add/Update components
            for (const component of category.components) {
                const existingComp = branding.uiComponents[categoryId].components[component.id];
                branding.uiComponents[categoryId].components[component.id] = {
                    ...existingComp,
                    ...component,
                    styles: {
                        ...(existingComp?.styles || {}),
                        ...component.styles
                    }
                };
                totalComponents++;
            }
        }

        // Update the application with new branding
        await client.query(
            'UPDATE applications SET branding = $1 WHERE id = $2',
            [JSON.stringify(branding), app.id]
        );

        console.log(`   ✅ Added ${totalCategories} categories, ${totalComponents} components.`);
    }

    console.log('\n✅ UI component seeding complete for all applications.');
}

main()
    .catch((e) => {
        console.error('Error seeding components:', e);
        process.exit(1);
    })
    .finally(async () => {
        await client.end();
    });
