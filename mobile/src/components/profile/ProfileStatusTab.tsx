import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import EmotionHeatMap from '../EmotionHeatMap';
import { emotionService, EmotionRecord } from '../../services/emotionService';

interface ProfileStatusTabProps {
    userId?: string;
    heartRate?: number;
    location?: string;
    isOnline?: boolean;
    lastSeen?: string;
    stepsToday?: number;
    batteryLevel?: number;
}

export const ProfileStatusTab: React.FC<ProfileStatusTabProps> = ({
    heartRate = 72,
    location = 'Bangkok, Thailand',
    isOnline = true,
    lastSeen = 'Just now',
    stepsToday = 5420,
    batteryLevel = 85,
}) => {
    const [emotionData, setEmotionData] = useState<EmotionRecord[]>([]);
    const [loadingEmotion, setLoadingEmotion] = useState(true);

    useEffect(() => {
        loadEmotionData();
    }, []);

    const loadEmotionData = async () => {
        setLoadingEmotion(true);
        try {
            const data = await emotionService.getUserEmotionHistory(30);
            setEmotionData(data);
        } catch (error) {
            console.error('Error loading emotion data:', error);
        } finally {
            setLoadingEmotion(false);
        }
    };

    const StatusCard = ({
        icon,
        title,
        value,
        subtitle,
        color = '#6B7280'
    }: {
        icon: string;
        title: string;
        value: string;
        subtitle?: string;
        color?: string;
    }) => (
        <View style={styles.statusCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <IconMC name={icon} size={24} color={color} />
            </View>
            <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>{title}</Text>
                <Text style={styles.statusValue}>{value}</Text>
                {subtitle && <Text style={styles.statusSubtitle}>{subtitle}</Text>}
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Activity Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activity Status</Text>
                <View style={styles.statusGrid}>
                    <StatusCard
                        icon={isOnline ? "circle" : "circle-outline"}
                        title="Status"
                        value={isOnline ? "Online" : "Offline"}
                        subtitle={!isOnline ? lastSeen : undefined}
                        color={isOnline ? "#10B981" : "#6B7280"}
                    />
                    <StatusCard
                        icon="map-marker"
                        title="Location"
                        value={location}
                        color="#3B82F6"
                    />
                </View>
            </View>

            {/* Health Metrics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health & Wellness</Text>
                <View style={styles.statusGrid}>
                    <StatusCard
                        icon="heart-pulse"
                        title="Heart Rate"
                        value={`${heartRate} BPM`}
                        subtitle="Last updated 5 min ago"
                        color="#EF4444"
                    />
                    <StatusCard
                        icon="walk"
                        title="Steps Today"
                        value={stepsToday.toLocaleString()}
                        subtitle="Goal: 10,000"
                        color="#F59E0B"
                    />
                </View>
            </View>

            {/* Emotion Tracker */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emotion Tracking</Text>
                {loadingEmotion ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#F59E0B" />
                        <Text style={styles.loadingText}>Loading emotions...</Text>
                    </View>
                ) : emotionData && emotionData.length > 0 ? (
                    <EmotionHeatMap
                        type="personal"
                        data={emotionData}
                        onDayPress={() => { }}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <IconMC name="emoticon-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No Emotion Data</Text>
                        <Text style={styles.emptySubtitle}>
                            Start tracking your emotions to see your wellbeing chart here.
                        </Text>
                    </View>
                )}
            </View>

            {/* Device Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Device Status</Text>
                <View style={styles.statusGrid}>
                    <StatusCard
                        icon="battery"
                        title="Phone Battery"
                        value={`${batteryLevel}%`}
                        color={batteryLevel > 20 ? "#10B981" : "#EF4444"}
                    />
                    <StatusCard
                        icon="wifi"
                        title="Connection"
                        value="Connected"
                        subtitle="Wi-Fi"
                        color="#8B5CF6"
                    />
                </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityList}>
                    <View style={styles.activityItem}>
                        <IconMC name="login" size={20} color="#10B981" />
                        <Text style={styles.activityText}>Logged in from iPhone</Text>
                        <Text style={styles.activityTime}>2 hours ago</Text>
                    </View>
                    <View style={styles.activityItem}>
                        <IconMC name="map-marker-check" size={20} color="#3B82F6" />
                        <Text style={styles.activityText}>Location updated</Text>
                        <Text style={styles.activityTime}>4 hours ago</Text>
                    </View>
                    <View style={styles.activityItem}>
                        <IconMC name="heart" size={20} color="#EF4444" />
                        <Text style={styles.activityText}>Health sync completed</Text>
                        <Text style={styles.activityTime}>5 hours ago</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        marginTop: 16,
    },
    statusGrid: {
        gap: 12,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusContent: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    statusSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    activityList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    activityText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        marginLeft: 12,
    },
    activityTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 18,
    },
});

export default ProfileStatusTab;
