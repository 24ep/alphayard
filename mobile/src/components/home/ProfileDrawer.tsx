import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { Avatar } from 'native-base';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface ProfileDrawerProps {
    visible: boolean;
    onClose: () => void;
    onSharePress: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ visible, onClose, onSharePress }) => {
    const { user, logout } = useAuth();
    const navigation = useNavigation();

    // Avatar Logic
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest User';
    const userHandle = user ? `@${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}` : '@guest';
    // Use DiceBear API for avatar if user doesn't have one
    // const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.id || 'guest'}`;

    const menuItems = [
        {
            label: 'View Profile',
            icon: 'account-outline',
            onPress: () => {
                onClose();
                // @ts-ignore
                navigation.navigate('Profile');
            }
        },
        {
            label: 'Switch Profile',
            icon: 'account-switch-outline',
            onPress: () => {
                // Handle profile switch logic
                onClose();
                // Maybe open a switcher modal or navigate
            }
        },
        {
            label: 'Bookmarks',
            icon: 'bookmark-outline',
            onPress: () => {
                onClose();
                // Navigate or show bookmarks
            }
        },
        {
            label: 'Share Profile',
            icon: 'share-variant-outline',
            onPress: () => {
                onClose();
                onSharePress();
            }
        },
        {
            label: 'Settings',
            icon: 'cog-outline',
            onPress: () => {
                onClose();
                // @ts-ignore
                navigation.navigate('Settings');
            }
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.drawerContainer}>
                    {/* Header / Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Avatar
                                bg="purple.500"
                                size="md"
                                source={{
                                    uri: user?.avatar
                                }}
                                key={user?.avatar} // Force refresh if url changes
                                style={styles.avatar} // maintain layout size
                            >
                                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                            </Avatar>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{userName}</Text>
                            <Text style={styles.handle}>{userHandle}</Text>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.menuContainer}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                                <View style={styles.menuIconBox}>
                                    <IconMC name={item.icon} size={22} color="#4B5563" />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <IconMC name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => {
                            onClose();
                            logout();
                        }}
                    >
                        <IconMC name="logout" size={22} color="#EF4444" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', // Align to bottom
        alignItems: 'center',
    },
    drawerContainer: {
        width: '100%', // Full width for bottom drawer
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Bottom safe area
        paddingHorizontal: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginBottom: 8,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileInfo: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    handle: {
        fontSize: 14,
        color: '#6B7280',
    },
    menuContainer: {
        paddingHorizontal: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    menuIconBox: {
        width: 32,
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 4,
    },
    logoutText: {
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#EF4444',
    }
});
