import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { chatbotBriefingStyles as styles } from '../../styles/home/chatbotBriefing';
import { 
  Sparkles, 
  Calendar, 
  CloudRain, 
  Newspaper, 
  Bot, 
  Settings,
  Star
} from 'lucide-react-native';
import { ScalePressable } from '../common/ScalePressable';
import { MiniAppsGrid } from './MiniAppsGrid';

// Wrapped Icon components for type safety
const SparklesIcon = Sparkles as any;
const CalendarIcon = Calendar as any;
const CloudRainIcon = CloudRain as any;
const NewspaperIcon = Newspaper as any;
const BotIcon = Bot as any;
const SettingsIcon = Settings as any;
const StarIcon = Star as any;

const ICON_MAP: Record<string, any> = {
    'sparkles': SparklesIcon,
    'calendar': CalendarIcon,
    'weather-pouring': CloudRainIcon,
    'newspaper': NewspaperIcon,
};

interface BriefingItem {
    id: string;
    type: 'insight' | 'news';
    title: string;
    description: string;
    subtext?: string;
    icon?: string;
    color?: string;
    iconType?: 'ion' | 'mc';
}

interface ChatbotBriefingProps {
    onCustomize?: () => void;
    onSeeAllApps?: () => void;
}

// Internal comments removed

const MOCK_DATA: BriefingItem[] = [
    // ... (rest of the file remains same, just updating usage)
    {
        id: '1',
        type: 'insight',
        title: 'Daily Luck',
        description: 'You will be lucky today! 🍀',
        subtext: 'Great things are coming your way.',
        icon: 'sparkles',
        color: '#F59E0B',
        iconType: 'ion',
    },
    {
        id: '2',
        type: 'insight',
        title: 'Schedule',
        description: '5 meetings scheduled.',
        subtext: 'First one starts in 30m.',
        icon: 'calendar',
        color: '#3B82F6',
        iconType: 'ion',
    },
    {
        id: '3',
        type: 'insight',
        title: 'Weather',
        description: 'Rainy today, bring umbrella ☔',
        subtext: 'High of 24°C.',
        icon: 'weather-pouring',
        color: '#6366F1',
        iconType: 'mc',
    },
    {
        id: '4',
        type: 'news',
        title: 'Tech News',
        description: 'The Future of AI Assistants',
        subtext: 'Boosting daily productivity.',
        icon: 'newspaper',
        color: '#10B981',
        iconType: 'ion',
    },
];

export const ChatbotBriefing: React.FC<ChatbotBriefingProps> = ({ onCustomize, onSeeAllApps }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const CARD_WIDTH = 220; // Fixed width for carousel item
    const GAP = 12;
    const SNAP_INTERVAL = CARD_WIDTH + GAP;

    // Auto-cycle effect
    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= MOCK_DATA.length) {
                nextIndex = 0;
            }

            setActiveIndex(nextIndex);

            // Programmatic scroll
            scrollRef.current?.scrollTo({
                x: nextIndex * SNAP_INTERVAL,
                animated: true,
            });
        }, 6000);

        return () => clearInterval(interval);
    }, [activeIndex]);

    // Update active index on manual scroll
    const onMomentumScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SNAP_INTERVAL);
        if (index !== activeIndex && index >= 0 && index < MOCK_DATA.length) {
            setActiveIndex(index);
        }
    };



    return (
        <View style={styles.container}>
            {/* Bot Avatar (Dynamic) */}
            <View style={styles.botContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
                    <View style={styles.botAvatar}>
                        <BotIcon size={28} color="#4F46E5" />
                    </View>
                    <Text style={styles.botName}>Bound</Text>
                </View>
                {onCustomize && (
                    <TouchableOpacity
                        onPress={onCustomize}
                        style={styles.customizeButton}
                    >
                        <SettingsIcon size={20} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Carousel */}
            <View style={styles.speechBubbleContainer}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    decelerationRate="fast"
                    snapToInterval={SNAP_INTERVAL}
                    disableIntervalMomentum={true}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                >
                    {MOCK_DATA.map((item) => (
                        <ScalePressable
                            key={item.id}
                            style={styles.briefingItem}
                        >
                            <View style={styles.itemHeader}>
                                <View style={[styles.itemIcon, { backgroundColor: `${item.color}15` }]}>
                                    {(() => {
                                        const Icon = ICON_MAP[item.icon || ''] || StarIcon;
                                        return <Icon size={16} color={item.color} />;
                                    })()}
                                </View>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                            </View>

                            <Text style={styles.itemDescription} numberOfLines={2}>
                                {item.description}
                            </Text>

                            {item.subtext && (
                                <Text style={styles.itemSubtext} numberOfLines={1}>
                                    {item.subtext}
                                </Text>
                            )}
                        </ScalePressable>
                    ))}
                </ScrollView>

                {/* Merged Activities Section */}
                <View style={{ marginTop: 4 }}>
                    <MiniAppsGrid onSeeAllPress={onSeeAllApps} hideTitle={true} />
                </View>
            </View>
        </View>
    );
};
