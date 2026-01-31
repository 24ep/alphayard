import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Animated, TextInput, Modal, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
// Removed LinearGradient import as it was unused
import { chatApi, circleApi } from '../../services/api'; // Updated import
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WelcomeSection } from '../../components/home/WelcomeSection';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { homeStyles } from '../../styles/homeStyles';
import { ScreenBackground } from '../../components/ScreenBackground';
import SegmentedTabs from '../../components/common/SegmentedTabs';

interface Chat {
    id: string;
    name: string;
    type: string; // Changed from sensitive list to string to support dynamic types
    avatar?: string;
    lastMessage: {
        text: string;
        sender: string;
        timestamp: number;
        type: 'text' | 'image' | 'file' | 'location' | 'voice';
    };
    unreadCount: number;
    isOnline: boolean;
    members: string[];
    isPinned: boolean;
    isMuted: boolean;
    folder?: string; // Mapped for UI compatibility
}

const ChatListScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { animateToHome, cardMarginTopAnim } = useNavigationAnimation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFolder, setActiveFolder] = useState('all');
    const [showNewChatDrawer, setShowNewChatDrawer] = useState(false);
    const [folderTabs, setFolderTabs] = useState<any[]>([
        { id: 'all', label: 'All', icon: 'message-text-outline', isDividerAfter: true }
    ]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChats();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadChats();
            animateToHome();
        }, [])
    );

    const loadChats = async () => {
        try {
            // setLoading(true); // Maybe don't show full spinner on refocus
            const circleId = user?.circleIds?.[0];
            if (!circleId) {
                setLoading(false);
                return;
            }

            // Fetch Circle Types and Chats in parallel
            const [typesRes, chatsRes] = await Promise.all([
                circleApi.getCircleTypes(),
                chatApi.getChats(circleId)
            ]);

            // Process Circle Types for Tabs
            if (typesRes.success && typesRes.data) {
                const dynamicTabs = typesRes.data.map((type: any) => ({
                    id: type.code,
                    label: type.name,
                    icon: type.icon || 'home-outline',
                    isDividerAfter: false,
                    // If we want specific dividers or order, we can add logic here
                }));
                
                // Construct tabs: All | Dynamic Types
                const tabs = [
                    { id: 'all', label: 'All', icon: 'message-text-outline', isDividerAfter: true },
                    ...dynamicTabs
                ];
                console.log('Setting folder tabs:', tabs);
                setFolderTabs(tabs);
            }

            if (chatsRes.success && chatsRes.data) {
                const formattedChats = chatsRes.data.map((chat: any) => ({
                    id: chat.id,
                    name: chat.name || 'Chat',
                    type: chat.type, // Make sure backend returns the code matching house_types codes
                    avatar: undefined, // Add logic if needed
                    lastMessage: {
                        text: chat.lastMessage?.content || 'No messages yet',
                        sender: chat.lastMessage?.sender?.firstName || 'System',
                        timestamp: chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt).getTime() : Date.now(),
                        type: chat.lastMessage?.type || 'text'
                    },
                    unreadCount: 0,
                    isOnline: false,
                    members: chat.participants?.map((p: any) => p.user?.firstName) || [],
                    isPinned: false,
                    isMuted: false
                }));
                setChats(formattedChats);
            }
        } catch (error) {
            console.error('Failed to load chats or types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = (type: 'individual' | 'group') => {
        setShowNewChatDrawer(false);
        navigation.navigate('NewChat', { type });
    };

    const handleChatPress = (chat: Chat) => {
        analyticsService.trackEvent('chat_opened', {
            chatId: chat.id,
            chatType: chat.type,
        });

        navigation.navigate('ChatRoom', {
            chatId: chat.id,
            name: chat.name,
            avatar: chat.avatar,
            type: chat.type
        });
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return date.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter chats logic
    const filteredChats = useMemo(() => {
        let filtered: Chat[] = chats;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (c: Chat) => c.name.toLowerCase().includes(q) || c.lastMessage.text.toLowerCase().includes(q)
            );
        }

        if (activeFolder !== 'all') {
             if (activeFolder === 'friend') {
                 filtered = filtered.filter((c: Chat) => c.type === 'friend' || c.type === 'individual');
             } else {
                 filtered = filtered.filter((c: Chat) => c.type === activeFolder || c.type === 'group');
             }
        }
        return filtered;
    }, [chats, searchQuery, activeFolder]);

    // Group chats for 'All' view
    const allViewGroups = useMemo(() => {
        if (activeFolder !== 'all') return null;

        const friends = filteredChats.filter((c: Chat) => c.type === 'friend' || c.type === 'individual');
        const favorites = filteredChats.filter((c: Chat) => c.isPinned);
        const circles = filteredChats.filter((c: Chat) => c.type === 'Circle' || (c.type !== 'friend' && c.type !== 'individual' && c.type !== 'group' && c.type !== 'workplace'));
        const groups = filteredChats.filter((c: Chat) => c.type === 'group');

        return { friends, favorites, circles, groups };
    }, [filteredChats, activeFolder]);



    const renderChat = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatPress(item)}
        >
            <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} style={styles.chatAvatar} />
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{formatTime(item.lastMessage.timestamp)}</Text>
                </View>
                <View style={styles.chatFooter}>
                    <Text style={[styles.chatMessage, item.unreadCount > 0 && styles.chatMessageUnread]} numberOfLines={1}>
                        {item.lastMessage.sender !== 'System' && item.lastMessage.sender !== 'You' ? `${item.lastMessage.sender}: ` : ''}
                        {item.lastMessage.text}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenBackground screenId="chat">
            <WelcomeSection
                mode="chat"
                title="Chats"
            />

            <Animated.View style={[
                homeStyles.mainContentCard,
                {
                    transform: [{ translateY: cardMarginTopAnim }],
                    marginTop: 0,
                    backgroundColor: '#FFFFFF',
                    flex: 1,
                }
            ]}>
                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <IconMC name="magnify" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search chats..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <IconMC name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                    <SegmentedTabs
                        activeId={activeFolder}
                        onChange={setActiveFolder}
                        tabs={folderTabs}
                    />
                </View>

                {/* Chats List */}
                <View style={styles.chatsSection}>
                    {activeFolder === 'all' && allViewGroups ? (
                        <ScrollView showsVerticalScrollIndicator={false}>
                             {/* Favorites */}
                             {allViewGroups.favorites.length > 0 && (
                                <View style={styles.groupSection}>
                                    <Text style={styles.groupTitle}>Favorites</Text>
                                    {allViewGroups.favorites.map(chat => (
                                        <React.Fragment key={`fav-${chat.id}`}>
                                            {renderChat({ item: chat })}
                                        </React.Fragment>
                                    ))}
                                </View>
                             )}

                             {/* Friends */}
                             {allViewGroups.friends.length > 0 && (
                                <View style={styles.groupSection}>
                                    <Text style={styles.groupTitle}>Friends</Text>
                                    {allViewGroups.friends.map(chat => (
                                        <React.Fragment key={`friend-${chat.id}`}>
                                            {renderChat({ item: chat })}
                                        </React.Fragment>
                                    ))}
                                </View>
                             )}

                             {/* Circles */}
                             {allViewGroups.circles.length > 0 && (
                                <View style={styles.groupSection}>
                                    <Text style={styles.groupTitle}>Circle Chats</Text>
                                    {allViewGroups.circles.map(chat => (
                                        <React.Fragment key={`circle-${chat.id}`}>
                                            {renderChat({ item: chat })}
                                        </React.Fragment>
                                    ))}
                                </View>
                             )}

                             {/* Groups */}
                             {allViewGroups.groups.length > 0 && (
                                <View style={styles.groupSection}>
                                    <Text style={styles.groupTitle}>Groups</Text>
                                    {allViewGroups.groups.map(chat => (
                                        <React.Fragment key={`group-${chat.id}`}>
                                            {renderChat({ item: chat })}
                                        </React.Fragment>
                                    ))}
                                </View>
                             )}
                             
                             {/* Empty State for All */}
                             {allViewGroups.favorites.length === 0 && 
                              allViewGroups.friends.length === 0 && 
                              allViewGroups.circles.length === 0 && 
                              allViewGroups.groups.length === 0 && (
                                 <View style={styles.emptyStateContainer}>
                                     <Text style={styles.emptyStateText}>No chats found</Text>
                                 </View>
                             )}
                             
                             {/* Bottom Padding */}
                             <View style={{ height: 80 }} />
                        </ScrollView>
                    ) : (
                        /* Flat List for Specific Tabs */
                        <FlatList
                            data={filteredChats}
                            renderItem={renderChat}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.chatsList}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={() => (
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>
                                        {folderTabs.find(t => t.id === activeFolder)?.label || 'Chats'}
                                    </Text>
                                     <TouchableOpacity>
                                            <IconMC name="filter-variant" size={22} color="#6B7280" />
                                     </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyStateContainer}>
                                    <IconMC name="message-text-outline" size={48} color={theme.colors.textSecondary} />
                                    <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>No chats yet</Text>
                                    <TouchableOpacity style={styles.startChatButton} onPress={() => setShowNewChatDrawer(true)}>
                                        <Text style={styles.startChatButtonText}>Start a conversation</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                </View>
            </Animated.View>

            {loading && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }]}>
                    <LoadingSpinner />
                </View>
            )}

            {/* Floating 'New' Button */}
            <View style={styles.floatingButtonContainer}>
                <TouchableOpacity
                    style={styles.newChatButton}
                    onPress={() => setShowNewChatDrawer(true)}
                >
                    <IconMC name="plus" size={20} color="white" />
                    <Text style={styles.newChatText}>New</Text>
                </TouchableOpacity>
            </View>

            {/* New Chat Drawer Modal */}
            <Modal
                visible={showNewChatDrawer}
                transparent
                animationType="slide"
                onRequestClose={() => setShowNewChatDrawer(false)}
            >
                <TouchableOpacity
                    style={styles.drawerOverlay}
                    activeOpacity={1}
                    onPress={() => setShowNewChatDrawer(false)}
                >
                    <View style={styles.drawerContainer}>
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.drawerHandle} />
                            <Text style={styles.drawerTitle}>Create New Chat</Text>

                            <TouchableOpacity
                                style={styles.drawerOption}
                                onPress={() => handleNewChat('individual')}
                            >
                                <View style={[styles.drawerOptionIcon, { backgroundColor: '#DBEAFE' }]}>
                                    <IconMC name="account-outline" size={24} color="#3B82F6" />
                                </View>
                                <View style={styles.drawerOptionContent}>
                                    <Text style={styles.drawerOptionTitle}>New Chat</Text>
                                    <Text style={styles.drawerOptionSubtitle}>Start a conversation with someone</Text>
                                </View>
                                <IconMC name="chevron-right" size={24} color="#9CA3AF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.drawerOption}
                                onPress={() => handleNewChat('group')}
                            >
                                <View style={[styles.drawerOptionIcon, { backgroundColor: '#FEE2E2' }]}>
                                    <IconMC name="account-group-outline" size={24} color="#EF4444" />
                                </View>
                                <View style={styles.drawerOptionContent}>
                                    <Text style={styles.drawerOptionTitle}>New Group</Text>
                                    <Text style={styles.drawerOptionSubtitle}>Create a group chat with multiple people</Text>
                                </View>
                                <IconMC name="chevron-right" size={24} color="#9CA3AF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.drawerCancelButton}
                                onPress={() => setShowNewChatDrawer(false)}
                            >
                                <Text style={styles.drawerCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
        marginTop: 24,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        padding: 0,
    },
    filterTabsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    folderTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    folderTabActive: {
        backgroundColor: '#1F2937',
    },
    folderTabText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    folderTabTextActive: {
        color: '#FFFFFF',
    },
    chatsSection: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    chatsList: {
        paddingBottom: 100,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    chatAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    chatContent: {
        flex: 1,
        gap: 4,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    chatTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    chatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatMessage: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
        marginRight: 8,
    },
    chatMessageUnread: {
        color: '#1F2937',
        fontWeight: '500',
    },
    unreadBadge: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 15,
        color: '#9CA3AF',
        marginTop: 12,
    },
    groupSection: {
        marginBottom: 20,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginHorizontal: 24,
        marginBottom: 8,
        marginTop: 8,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    startChatButton: {
        marginTop: 16,
        backgroundColor: '#1F2937',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    startChatButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    floatingButtonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    newChatButton: {
        backgroundColor: '#1F2937',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    newChatText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    drawerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    drawerContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    drawerHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    drawerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    drawerOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    drawerOptionContent: {
        flex: 1,
    },
    drawerOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    drawerOptionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    drawerCancelButton: {
        marginTop: 20,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    drawerCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default ChatListScreen;
