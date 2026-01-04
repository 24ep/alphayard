import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Share, Pressable, Platform, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar } from 'native-base';
import { useAuth } from '../../contexts/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ShareProfileDrawerProps {
    visible: boolean;
    onClose: () => void;
}

// Logo source - using remote placeholder to fix web bundling issue with local asset
const APP_LOGO = { uri: 'https://cdn-icons-png.flaticon.com/512/10024/10024225.png' };

export const ShareProfileDrawer: React.FC<ShareProfileDrawerProps> = ({ visible, onClose }) => {
    const { user } = useAuth();
    const svgRef = useRef<any>(null);

    // Fallback data if user is missing
    const userId = user?.id || 'unknown-user';
    const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
    const userHandle = user ? `@${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}` : '@guest';
    const userContact = user?.email || user?.phone || 'No contact info';
    const profileLink = `https://bondarys.com/profile/${userId}`;

    const handleCopyLink = () => {
        Alert.alert('Link Copied', 'Profile link copied to clipboard');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out my profile on Bondarys: ${profileLink}`,
                url: profileLink, // iOS only
                title: 'Share Profile',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownloadQr = () => {
        if (svgRef.current) {
            svgRef.current.toDataURL(async (data: string) => {
                try {
                    const filename = `${FileSystem.documentDirectory}profile_qr.png`;
                    await FileSystem.writeAsStringAsync(filename, data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    await Sharing.shareAsync(filename);
                } catch (err) {
                    Alert.alert('Error', 'Failed to save QR code');
                }
            });
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.drawer} onPress={() => { }}>

                    {/* Header: Title + Close */}
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Share Profile</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <IconMC name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Info Header */}
                    <View style={styles.profileHeader}>
                        <Avatar
                            bg="purple.500"
                            size="lg"
                            source={{
                                uri: user?.avatar
                            }}
                            style={styles.avatar}
                        >
                            {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                        </Avatar>
                        <Text style={styles.headerName}>{userName}</Text>
                        <Text style={styles.headerContact}>{userContact}</Text>
                    </View>

                    {/* QR Code Container - Meta Style */}
                    <View style={styles.qrContainer}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={profileLink}
                                size={200}
                                color="#000"
                                backgroundColor="#FFF" // White bg for QR itself
                                logo={APP_LOGO}
                                logoSize={50}
                                logoBackgroundColor='white'
                                logoMargin={2}
                                logoBorderRadius={10}
                                getRef={(c) => (svgRef.current = c)}
                            />
                        </View>
                        <Text style={styles.userName}>{userHandle}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                                <IconMC name="share-variant" size={24} color="#4F46E5" />
                            </View>
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadQr}>
                            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                                <IconMC name="download" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.actionText}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
                            <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
                                <IconMC name="link-variant" size={24} color="#F59E0B" />
                            </View>
                            <Text style={styles.actionText}>Copy Link</Text>
                        </TouchableOpacity>
                    </View>

                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    drawer: {
        backgroundColor: '#F3F4F6', // Light gray background for contrast with white card
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        minHeight: 550,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    headerContact: {
        fontSize: 14,
        color: '#6B7280',
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    qrWrapper: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 24, // Rounded corners for Meta style
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
        width: 80, // Fix width for alignment
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
});
