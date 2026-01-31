import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProfileInfoTabProps {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    bio?: string;
    hometown?: string;
    currentCity?: string;
    education?: Array<{
        school: string;
        degree?: string;
        year?: string;
    }>;
    work?: Array<{
        company: string;
        position?: string;
        current?: boolean;
    }>;
    circle?: {
        name: string;
        memberCount: number;
        role: string;
    };
    onEditPress?: () => void;
}

export const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
    firstName = 'John',
    lastName = 'Doe',
    email = 'john.doe@example.com',
    phone = '+66 123 456 789',
    bio = 'Living life to the fullest with my wonderful circle.',
    hometown = 'Chiang Mai, Thailand',
    currentCity = 'Bangkok, Thailand',
    education = [
        { school: 'Bangkok University', degree: 'Bachelor of Computer Science', year: '2018' },
    ],
    work = [
        { company: 'Tech Solutions Co.', position: 'Software Engineer', current: true },
    ],
    circle = { name: 'Doe Circle', memberCount: 4, role: 'Admin' },
    onEditPress,
}) => {
    const InfoSection = ({
        icon,
        title,
        children
    }: {
        icon: string;
        title: string;
        children: React.ReactNode;
    }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <IconMC name={icon} size={20} color="#6B7280" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );

    const InfoRow = ({
        label,
        value,
        icon
    }: {
        label: string;
        value: string;
        icon?: string;
    }) => (
        <View style={styles.infoRow}>
            {icon && <IconMC name={icon} size={18} color="#9CA3AF" style={styles.rowIcon} />}
            <View style={styles.rowContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Bio */}
            {bio && (
                <View style={styles.bioSection}>
                    <Text style={styles.bioText}>{bio}</Text>
                </View>
            )}

            {/* Basic Info */}
            <InfoSection icon="account" title="Basic Information">
                <InfoRow label="Full Name" value={`${firstName} ${lastName}`} icon="account-outline" />
                <InfoRow label="Email" value={email} icon="email-outline" />
                <InfoRow label="Phone" value={phone} icon="phone-outline" />
            </InfoSection>

            {/* Circle */}
            <InfoSection icon="home-heart" title="Circle">
                <View style={styles.circleCard}>
                    <View style={styles.circleInfo}>
                        <Text style={styles.circleName}>{circle.name}</Text>
                        <Text style={styles.circleMeta}>
                            {circle.memberCount} members • {circle.role}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                </View>
            </InfoSection>

            {/* Location */}
            <InfoSection icon="map-marker" title="Location">
                <InfoRow label="Current City" value={currentCity} icon="map-marker-outline" />
                <InfoRow label="Hometown" value={hometown} icon="home-outline" />
            </InfoSection>

            {/* Education */}
            <InfoSection icon="school" title="Education">
                {education.map((edu, index) => (
                    <View key={index} style={styles.historyItem}>
                        <View style={styles.historyIcon}>
                            <IconMC name="school-outline" size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.historyContent}>
                            <Text style={styles.historyTitle}>{edu.school}</Text>
                            {edu.degree && <Text style={styles.historySubtitle}>{edu.degree}</Text>}
                            {edu.year && <Text style={styles.historyMeta}>{edu.year}</Text>}
                        </View>
                    </View>
                ))}
            </InfoSection>

            {/* Work */}
            <InfoSection icon="briefcase" title="Work">
                {work.map((job, index) => (
                    <View key={index} style={styles.historyItem}>
                        <View style={styles.historyIcon}>
                            <IconMC name="briefcase-outline" size={20} color="#10B981" />
                        </View>
                        <View style={styles.historyContent}>
                            <Text style={styles.historyTitle}>{job.company}</Text>
                            {job.position && <Text style={styles.historySubtitle}>{job.position}</Text>}
                            {job.current && (
                                <View style={styles.currentBadge}>
                                    <Text style={styles.currentBadgeText}>Current</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </InfoSection>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    bioSection: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    bioText: {
        fontSize: 14,
        color: '#4B5563',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    section: {
        marginTop: 20,
        marginHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 8,
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rowIcon: {
        marginRight: 12,
    },
    rowContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    circleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    circleInfo: {
        flex: 1,
    },
    circleName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    circleMeta: {
        fontSize: 13,
        color: '#6B7280',
    },
    viewButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#EFF6FF',
        borderRadius: 20,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    historyItem: {
        flexDirection: 'row',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyContent: {
        flex: 1,
        justifyContent: 'center',
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    historySubtitle: {
        fontSize: 13,
        color: '#4B5563',
    },
    historyMeta: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    currentBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
    },
    currentBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16A34A',
    },
});

export default ProfileInfoTab;

