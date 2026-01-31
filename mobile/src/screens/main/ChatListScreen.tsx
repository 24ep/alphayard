import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, TextInput, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
    Search, 
    XCircle, 
    Users, 
    MessageSquareText, 
    Home, 
    Briefcase,
    Cake,
    Star,
    Megaphone,
    ChevronRight,
    ArrowLeft,
    Filter,
    MessageSquare,
    Plus,
    User
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const LucideIcon = ({ icon: Icon, ...props }: any) => {
    return <Icon {...props} />;
};

const CHATS = [
    { id: '1', name: 'Rafael Mante', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=11', unread: 0, folder: 'circle' },
    { id: '2', name: 'Katherine Bernhard', message: '✔ Figma', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=12', unread: 0, folder: 'work' },
    { id: '3', name: 'Terrence Lemke', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=13', unread: 2, folder: 'circle' },
    { id: '4', name: 'Alyssa Wisozk-Kihn', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=14', unread: 0, folder: 'friends' },
    { id: '5', name: 'Andrew Legros', message: '✔ Figma', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=15', unread: 0, folder: 'work' },
    { id: '6', name: 'Dixie Haag', message: 'Figma ipsum component variant main', time: '19:45', avatar: 'https://i.pravatar.cc/100?img=16', unread: 1, folder: 'friends' },
];

const FOLDER_TABS = [
    { id: 'friends', label: 'Friends', icon: Users, isDividerAfter: true },
    { id: 'all', label: 'All', icon: MessageSquareText, isDividerAfter: false },
    { id: 'circle', label: 'Circle', icon: Home, isDividerAfter: false },
    { id: 'work', label: 'Work', icon: Briefcase, isDividerAfter: false },
];

import { WelcomeSection } from '../../components/home/WelcomeSection';
import { useHomeBackground } from '../../hooks/useAppConfig';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';

const ChatListScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFolder, setActiveFolder] = useState('friends');
    const [activeCollection, setActiveCollection] = useState<string | null>(null);
    const [showNewChatDrawer, setShowNewChatDrawer] = useState(false);

    const { background: homeBg } = useHomeBackground();

    const filteredChats = CHATS.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = activeFolder === 'all' || chat.folder === activeFolder;
        return matchesSearch && matchesFolder;
    });

    const renderChat = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatRoom', { memberName: item.name, memberId: item.id })}
        >
            <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatFooter}>
                    <Text style={[styles.chatMessage, item.unread > 0 && styles.chatMessageUnread]} numberOfLines={1}>
                        {item.message}
                    </Text>
                    {item.unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const backgroundColors = homeBg.type === 'gradient' && homeBg.gradient 
        ? homeBg.gradient 
        : ['#FFFFFF', '#F5F5F5'];

    return (
        <LinearGradient colors={backgroundColors} style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <WelcomeSection mode="chat" />
            </SafeAreaView>

            <View style={styles.contentContainer}>
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <LucideIcon icon={Search} size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search chats..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <View style={styles.chatsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Circle Chats</Text>
                    </View>
                    <FlatList
                        data={filteredChats}
                        renderItem={renderChat}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.chatsList}
                    />
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerSafeArea: { paddingBottom: 10 },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FCFCFC',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 16,
    },
    searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#1F2937' },
    chatsSection: { flex: 1 },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    chatsList: { paddingBottom: 100 },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    chatAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
    chatContent: { flex: 1, gap: 4 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    chatName: { fontSize: 15, fontWeight: '600' },
    chatTime: { fontSize: 12, color: '#9CA3AF' },
    chatFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    chatMessage: { fontSize: 13, color: '#6B7280', flex: 1 },
    chatMessageUnread: { color: '#1F2937', fontWeight: '500' },
    unreadBadge: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});

export default ChatListScreen;

