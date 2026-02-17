import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Animated, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { chatApi, circleApi } from '../../services/api';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WelcomeSection } from '../../components/home/WelcomeSection';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { homeStyles } from '../../styles/homeStyles';
import { ScreenBackground } from '../../components/ScreenBackground';

const CHAT_FOLDERS_KEY = '@chat_custom_folders';
const CHAT_FOLDER_ASSIGNMENTS_KEY = '@chat_folder_assignments';

export interface CustomFolder {
    id: string;
    label: string;
    icon: string;
}

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
    const [activeFolder, setActiveFolder] = useState('all');
    const [showNewChatDrawer, setShowNewChatDrawer] = useState(false);
    const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
    const [chatFolderAssignments, setChatFolderAssignments] = useState<Record<string, string>>({});
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [folderName, setFolderName] = useState('');
    const [folderIcon, setFolderIcon] = useState('folder-outline');
    const [showMoveToFolder, setShowMoveToFolder] = useState<Chat | null>(null);

    const folderTabs = useMemo(() => [
        { id: 'all', label: 'All', icon: 'message-text-outline', isDividerAfter: customFolders.length > 0 },
        ...customFolders.map(f => ({ id: f.id, label: f.label, icon: f.icon, isDividerAfter: false }))
    ], [customFolders]);

    const loadSavedFoldersAndAssignments = useCallback(async () => {
        try {
            const [foldersJson, assignmentsJson] = await Promise.all([
                AsyncStorage.getItem(CHAT_FOLDERS_KEY),
                AsyncStorage.getItem(CHAT_FOLDER_ASSIGNMENTS_KEY)
            ]);
            if (foldersJson) {
                const parsed = JSON.parse(foldersJson);
                setCustomFolders(Array.isArray(parsed) ? parsed : []);
            }
            if (assignmentsJson) {
                const parsed = JSON.parse(assignmentsJson);
                setChatFolderAssignments(typeof parsed === 'object' && parsed !== null ? parsed : {});
            }
        } catch (_) {}
    }, []);

    useEffect(() => {
        loadSavedFoldersAndAssignments();
    }, [loadSavedFoldersAndAssignments]);

    useEffect(() => {
        loadChats();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadChats();
            loadSavedFoldersAndAssignments();
            animateToHome();
        }, [loadSavedFoldersAndAssignments])
    );

    const loadChats = async () => {
        try {
            setLoading(true);

            const circleId = user?.circleIds?.[0];
            if (circleId) {
                try {
                    const chatsRes = await chatApi.getChats(circleId);
                    if (chatsRes && chatsRes.success && chatsRes.data && Array.isArray(chatsRes.data)) {
                        const formattedChats = chatsRes.data.map((chat: any) => ({
                            id: chat.id,
                            name: chat.name || 'Chat',
                            type: chat.type || 'circle',
                            avatar: chat.avatar,
                            lastMessage: {
                                text: chat.lastMessage?.content || 'No messages yet',
                                sender: chat.lastMessage?.sender?.firstName || 'System',
                                timestamp: chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt).getTime() : Date.now(),
                                type: chat.lastMessage?.type || 'text'
                            },
                            unreadCount: chat.unreadCount || 0,
                            isOnline: false,
                            members: chat.participants?.map((p: any) => p.user?.firstName) || [],
                            isPinned: chat.isPinned || false,
                            isMuted: chat.isMuted || false
                        }));
                        setChats(formattedChats);
                        return;
                    }
                } catch (apiError) {
                    console.error('[ChatListScreen] API error:', apiError);
                }
            }

            // Load example data if no API data available
            console.log('[ChatListScreen] Loading example data');
            const exampleChats: Chat[] = [
                {
                    id: '1',
                    name: 'Mom',
                    type: 'friend',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Yes! Can\'t wait to see you! ❤️',
                        sender: 'Mom',
                        timestamp: Date.now() - 1800000, // 30 min ago
                        type: 'text'
                    },
                    unreadCount: 3,
                    isOnline: true,
                    members: ['Mom'],
                    isPinned: true,
                    isMuted: false
                },
                {
                    id: '2',
                    name: 'Family Circle',
                    type: 'circle',
                    avatar: undefined,
                    lastMessage: {
                        text: '📷 Photo',
                        sender: 'Dad',
                        timestamp: Date.now() - 3600000, // 1 hour ago
                        type: 'image'
                    },
                    unreadCount: 5,
                    isOnline: true,
                    members: ['Mom', 'Dad', 'Sister', 'Brother'],
                    isPinned: true,
                    isMuted: false
                },
                {
                    id: '3',
                    name: 'Dad',
                    type: 'friend',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Call me when you get home',
                        sender: 'Dad',
                        timestamp: Date.now() - 7200000, // 2 hours ago
                        type: 'text'
                    },
                    unreadCount: 1,
                    isOnline: false,
                    members: ['Dad'],
                    isPinned: false,
                    isMuted: false
                },
                {
                    id: '4',
                    name: 'Sister',
                    type: 'friend',
                    avatar: undefined,
                    lastMessage: {
                        text: '🎤 Voice message',
                        sender: 'Sister',
                        timestamp: Date.now() - 10800000, // 3 hours ago
                        type: 'voice'
                    },
                    unreadCount: 2,
                    isOnline: true,
                    members: ['Sister'],
                    isPinned: false,
                    isMuted: false
                },
                {
                    id: '5',
                    name: 'Brother',
                    type: 'friend',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Did you watch the game?',
                        sender: 'Brother',
                        timestamp: Date.now() - 86400000, // 1 day ago
                        type: 'text'
                    },
                    unreadCount: 0,
                    isOnline: false,
                    members: ['Brother'],
                    isPinned: false,
                    isMuted: false
                },
                {
                    id: '6',
                    name: 'Work Team',
                    type: 'group',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Meeting postponed to 4 PM',
                        sender: 'John',
                        timestamp: Date.now() - 14400000, // 4 hours ago
                        type: 'text'
                    },
                    unreadCount: 0,
                    isOnline: false,
                    members: ['John', 'Sarah', 'Mike'],
                    isPinned: false,
                    isMuted: true
                },
                {
                    id: '7',
                    name: 'Grandma',
                    type: 'friend',
                    avatar: undefined,
                    lastMessage: {
                        text: '📍 Location',
                        sender: 'Grandma',
                        timestamp: Date.now() - 172800000, // 2 days ago
                        type: 'location'
                    },
                    unreadCount: 0,
                    isOnline: true,
                    members: ['Grandma'],
                    isPinned: false,
                    isMuted: false
                },
                {
                    id: '8',
                    name: 'Book Club',
                    type: 'group',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Next meeting: Friday',
                        sender: 'Emma',
                        timestamp: Date.now() - 172800000, // 2 days ago
                        type: 'text'
                    },
                    unreadCount: 0,
                    isOnline: false,
                    members: ['Emma', 'Lisa', 'Tom'],
                    isPinned: false,
                    isMuted: true
                },
                {
                    id: '5',
                    name: 'Weekend Hiking Group',
                    type: 'group',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Trail looks great for Saturday!',
                        sender: 'Mike',
                        timestamp: Date.now() - 1800000, // 30 minutes ago
                        type: 'text'
                    },
                    unreadCount: 3,
                    isOnline: false,
                    members: ['Mike', 'Alex', 'Jessica', 'David', 'Emma'],
                    isPinned: false,
                    isMuted: false
                },
                {
                    id: '6',
                    name: 'Gaming Squad',
                    type: 'group',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Anyone online for a quick match?',
                        sender: 'Tom',
                        timestamp: Date.now() - 5400000, // 1.5 hours ago
                        type: 'text'
                    },
                    unreadCount: 5,
                    isOnline: false,
                    members: ['Tom', 'Chris', 'Ryan', 'Sam'],
                    isPinned: true,
                    isMuted: false
                },
                {
                    id: '7',
                    name: 'Study Group',
                    type: 'group',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Review session tomorrow at 6 PM',
                        sender: 'Lisa',
                        timestamp: Date.now() - 10800000, // 3 hours ago
                        type: 'text'
                    },
                    unreadCount: 0,
                    isOnline: false,
                    members: ['Lisa', 'Anna', 'James', 'Sophie'],
                    isPinned: false,
                    isMuted: false
                },
                {
                    id: '8',
                    name: 'Neighborhood Watch',
                    type: 'group',
                    avatar: undefined,
                    lastMessage: {
                        text: 'Community meeting next week',
                        sender: 'Robert',
                        timestamp: Date.now() - 259200000, // 3 days ago
                        type: 'text'
                    },
                    unreadCount: 0,
                    isOnline: false,
                    members: ['Robert', 'Maria', 'Kevin', 'Linda', 'Paul', 'Susan'],
                    isPinned: false,
                    isMuted: true
                }
            ];
            setChats(exampleChats);
        } catch (error) {
            console.error('[ChatListScreen] Failed to load chats or types:', error);
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
            chatName: chat.name,
            memberAvatar: chat.avatar,
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

    const assignChatToFolder = useCallback(async (chatId: string, folderId: string | null) => {
        const next = folderId
            ? { ...chatFolderAssignments, [chatId]: folderId }
            : Object.fromEntries(Object.entries(chatFolderAssignments).filter(([id]) => id !== chatId));
        setChatFolderAssignments(next);
        await AsyncStorage.setItem(CHAT_FOLDER_ASSIGNMENTS_KEY, JSON.stringify(next));
        setShowMoveToFolder(null);
    }, [chatFolderAssignments]);

    const saveCustomFolders = useCallback(async (list: CustomFolder[]) => {
        setCustomFolders(list);
        await AsyncStorage.setItem(CHAT_FOLDERS_KEY, JSON.stringify(list));
    }, []);

    const addOrUpdateFolder = useCallback(() => {
        const name = folderName.trim();
        if (!name) {
            Alert.alert('Folder name required', 'Enter a name for the folder.');
            return;
        }
        if (editingFolderId) {
            const updated = customFolders.map(f => f.id === editingFolderId ? { ...f, label: name, icon: folderIcon } : f);
            saveCustomFolders(updated);
            setEditingFolderId(null);
        } else {
            const id = `folder_${Date.now()}`;
            saveCustomFolders([...customFolders, { id, label: name, icon: folderIcon }]);
        }
        setFolderName('');
        setFolderIcon('folder-outline');
        setShowFolderModal(false);
    }, [folderName, folderIcon, editingFolderId, customFolders, saveCustomFolders]);

    const deleteFolder = useCallback((id: string) => {
        Alert.alert('Delete folder', 'Remove this folder? Chats will be unassigned.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    const next = customFolders.filter(f => f.id !== id);
                    saveCustomFolders(next);
                    const nextAssignments = Object.fromEntries(
                        Object.entries(chatFolderAssignments).filter(([, fid]) => fid !== id)
                    );
                    setChatFolderAssignments(nextAssignments);
                    AsyncStorage.setItem(CHAT_FOLDER_ASSIGNMENTS_KEY, JSON.stringify(nextAssignments));
                    if (activeFolder === id) setActiveFolder('all');
                }
            }
        ]);
    }, [customFolders, chatFolderAssignments, activeFolder, saveCustomFolders]);

    // Filter chats logic: All, favorite, group, or custom folder
    const filteredChats = useMemo(() => {
        let filtered: Chat[] = chats;
        if (activeFolder === 'all') return filtered;
        if (activeFolder === 'favorite') {
            filtered = filtered.filter((c: Chat) => c.isPinned);
        } else if (activeFolder === 'group') {
            filtered = filtered.filter((c: Chat) => c.type === 'group');
        } else {
            filtered = filtered.filter((c: Chat) => chatFolderAssignments[c.id] === activeFolder);
        }
        return filtered;
    }, [chats, activeFolder, chatFolderAssignments]);

    // Group chats for 'All' view
    const allViewGroups = useMemo(() => {
        if (activeFolder !== 'all') return null;

        const friends = filteredChats.filter((c: Chat) => c.type === 'friend' || c.type === 'individual');
        const favorites = filteredChats.filter((c: Chat) => c.isPinned);
        const circles = filteredChats.filter((c: Chat) => c.type === 'Circle' || (c.type !== 'friend' && c.type !== 'individual' && c.type !== 'group' && c.type !== 'workplace'));
        const groups = filteredChats.filter((c: Chat) => c.type === 'group');

        return { friends, favorites, circles, groups };
    }, [filteredChats, activeFolder]);



    const formatTypeLabel = (type: string) => {
        if (!type) return 'Chat';
        const t = type.toLowerCase();
        if (t === 'circle') return 'Circle';
        if (t === 'friend' || t === 'individual') return 'Friend';
        if (t === 'group') return 'Group';
        if (t === 'team') return 'Team';
        if (t === 'club') return 'Club';
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const renderChat = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatPress(item)}
            onLongPress={() => setShowMoveToFolder(item)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarWithBadge}>
                <Image source={{ uri: item.avatar || 'https://placehold.co/150' }} style={styles.chatAvatar} />
                <View style={styles.typeBadgeOverAvatar}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText} numberOfLines={1}>{formatTypeLabel(item.type)}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
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
                <View style={{ paddingHorizontal: 20, marginBottom: 16, paddingTop: 24 }}>
                    <View style={styles.filterTabsContainer}>
                        <TouchableOpacity
                            style={[styles.filterTab, activeFolder === 'all' && styles.filterTabActive]}
                            onPress={() => setActiveFolder('all')}
                        >
                            <Text style={[styles.filterTabText, activeFolder === 'all' && styles.filterTabTextActive]}>All</Text>
                        </TouchableOpacity>
                        {folderTabs.filter(tab => tab.id !== 'all').map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.filterBadge, activeFolder === tab.id && styles.filterBadgeActive]}
                                onPress={() => setActiveFolder(tab.id)}
                            >
                                {tab.icon && (
                                    <IconMC name={tab.icon} size={16} color={activeFolder === tab.id ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 4 }} />
                                )}
                                <Text style={[styles.filterBadgeText, activeFolder === tab.id && styles.filterBadgeTextActive]}>{tab.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.addFolderButton}
                            onPress={() => {
                                setEditingFolderId(null);
                                setFolderName('');
                                setFolderIcon('folder-outline');
                                setShowFolderModal(true);
                            }}
                            activeOpacity={0.7}
                        >
                            <IconMC name="plus" size={18} color="#1F2937" style={{ marginRight: 4 }} />
                            <Text style={styles.addFolderButtonText}>Add folder</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chats List */}
                <View style={styles.chatsSection}>
                    {activeFolder === 'all' && allViewGroups ? (
                        <ScrollView showsVerticalScrollIndicator={false}>
                             {/* Favorites Row */}
                             {allViewGroups.favorites.length > 0 && (
                                <TouchableOpacity 
                                    style={styles.favoriteRow}
                                    onPress={() => setActiveFolder('favorite')}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.favoriteRowContent}>
                                        <IconMC name="star" size={20} color="#F59E0B" />
                                        <Text style={styles.favoriteRowLabel}>Favorite</Text>
                                        {/* Show latest 4 avatars */}
                                        <View style={styles.favoriteAvatarsContainer}>
                                            {allViewGroups.favorites.slice(0, 4).map((chat, index) => (
                                                <View 
                                                    key={chat.id}
                                                    style={[
                                                        styles.favoriteAvatar,
                                                        { marginLeft: index > 0 ? -8 : 0, zIndex: 4 - index }
                                                    ]}
                                                >
                                                    {chat.avatar ? (
                                                        <Image 
                                                            source={{ uri: chat.avatar }} 
                                                            style={styles.favoriteAvatarImage}
                                                        />
                                                    ) : (
                                                        <View style={[styles.favoriteAvatarImage, styles.favoriteAvatarPlaceholder]}>
                                                            <Text style={styles.favoriteAvatarText}>
                                                                {chat.name?.charAt(0) || '?'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                        <Text style={styles.favoriteRowCount}>{allViewGroups.favorites.length}</Text>
                                    </View>
                                    <IconMC name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                             )}

                             {/* Groups Row */}
                             {allViewGroups.groups.length > 0 && (
                                <TouchableOpacity 
                                    style={styles.favoriteRow}
                                    onPress={() => setActiveFolder('group')}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.favoriteRowContent}>
                                        <IconMC name="account-group" size={20} color="#3B82F6" />
                                        <Text style={styles.favoriteRowLabel}>Group</Text>
                                        <Text style={styles.favoriteRowCount}>{allViewGroups.groups.length}</Text>
                                    </View>
                                    <IconMC name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
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
                                    <View style={styles.sectionHeaderLeft}>
                                        {(activeFolder === 'favorite' || activeFolder === 'group') && (
                                            <TouchableOpacity 
                                                onPress={() => setActiveFolder('all')}
                                                style={{ marginRight: 12 }}
                                            >
                                                <IconMC name="arrow-left" size={22} color="#6B7280" />
                                            </TouchableOpacity>
                                        )}
                                        <Text style={styles.sectionTitle}>
                                            {activeFolder === 'favorite' ? 'Favorite' : (folderTabs.find(t => t.id === activeFolder)?.label || 'Chats')}
                                        </Text>
                                    </View>
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

            {/* Add/Edit folder modal */}
            <Modal visible={showFolderModal} transparent animationType="fade">
                <View style={[styles.drawerOverlay, { alignItems: 'center' }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowFolderModal(false)} />
                    <View style={[styles.drawerContainer, styles.folderModalContainer]}>
                        <View style={styles.drawerHandle} />
                        <Text style={styles.drawerTitle}>{editingFolderId ? 'Edit folder' : 'New folder'}</Text>
                        <TextInput
                            style={styles.folderNameInput}
                            placeholder="Folder name"
                            placeholderTextColor="#9CA3AF"
                            value={folderName}
                            onChangeText={setFolderName}
                            autoCapitalize="words"
                        />
                        <View style={styles.folderModalActions}>
                            <TouchableOpacity style={styles.drawerCancelButton} onPress={() => setShowFolderModal(false)}>
                                <Text style={styles.drawerCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.addFolderSubmitButton} onPress={addOrUpdateFolder}>
                                <Text style={styles.addFolderSubmitText}>{editingFolderId ? 'Save' : 'Add'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Move to folder (long-press on chat) */}
            <Modal visible={!!showMoveToFolder} transparent animationType="fade">
                <View style={[styles.drawerOverlay, { alignItems: 'center' }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowMoveToFolder(null)} />
                    <View style={[styles.drawerContainer, styles.folderModalContainer]}>
                        <View style={styles.drawerHandle} />
                        <Text style={styles.drawerTitle}>Move to folder</Text>
                        {showMoveToFolder && (
                            <Text style={styles.moveToFolderChatName} numberOfLines={1}>{showMoveToFolder.name}</Text>
                        )}
                        <ScrollView style={styles.moveToFolderList} keyboardShouldPersistTaps="handled">
                            <TouchableOpacity
                                style={styles.drawerOption}
                                onPress={() => showMoveToFolder && assignChatToFolder(showMoveToFolder.id, null)}
                            >
                                <IconMC name="folder-off-outline" size={24} color="#6B7280" />
                                <Text style={styles.drawerOptionTitle}>No folder</Text>
                            </TouchableOpacity>
                            {customFolders.map((f) => (
                                <TouchableOpacity
                                    key={f.id}
                                    style={styles.drawerOption}
                                    onPress={() => showMoveToFolder && assignChatToFolder(showMoveToFolder.id, f.id)}
                                >
                                    <IconMC name={f.icon as any} size={24} color="#6B7280" />
                                    <Text style={styles.drawerOptionTitle}>{f.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.drawerCancelButton} onPress={() => setShowMoveToFolder(null)}>
                            <Text style={styles.drawerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterTabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'flex-start',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterTabActive: {
        backgroundColor: '#1F2937',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    filterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterBadgeActive: {
        backgroundColor: '#1F2937',
        borderColor: '#1F2937',
    },
    filterBadgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    filterBadgeTextActive: {
        color: '#FFFFFF',
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
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    avatarWithBadge: {
        position: 'relative',
        width: 48,
        height: 48,
        marginRight: 12,
    },
    chatAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
    },
    typeBadgeOverAvatar: {
        position: 'absolute',
        bottom: -2,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeBadge: {
        backgroundColor: '#1F2937',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        maxWidth: 44,
    },
    typeBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#FFFFFF',
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
        flex: 1,
        marginRight: 8,
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
    favoriteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginTop: 8,
    },
    favoriteRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    favoriteRowLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    favoriteAvatarsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    favoriteAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
    },
    favoriteAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    favoriteAvatarPlaceholder: {
        backgroundColor: '#FFB6C1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteAvatarText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    favoriteRowCount: {
        fontSize: 13,
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
        marginHorizontal: 24,
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
    addFolderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        minWidth: 100,
    },
    addFolderButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },
    folderModalContainer: {
        maxHeight: 320,
        width: '90%',
        alignSelf: 'center',
    },
    folderNameInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: '#FFF',
    },
    folderModalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    addFolderSubmitButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#1F2937',
        borderRadius: 12,
    },
    addFolderSubmitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    moveToFolderChatName: {
        fontSize: 14,
        color: '#6B7280',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    moveToFolderList: {
        maxHeight: 220,
    },
});

export default ChatListScreen;
