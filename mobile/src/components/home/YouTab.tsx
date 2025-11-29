import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CoolIcon from '../common/CoolIcon';
import IconIon from 'react-native-vector-icons/Ionicons';
import { homeStyles } from '../../styles/homeStyles';
import { ATTENTION_APPS } from '../../constants/home';
import { AttentionCard } from './AttentionCard';
import { BlogSlider, BlogItem } from './BlogSlider';
import { ShoppingList } from './ShoppingList';
import { AppointmentsList } from './AppointmentsList';
import { FamilyStatusCards } from './FamilyStatusCards';
import { FamilyLocationMap } from './FamilyLocationMap';
import { FamilyMemberDrawer } from './FamilyMemberDrawer';
import { CalendarDrawer } from './CalendarDrawer';
import { ShoppingDrawer } from './ShoppingDrawer';
import { familyApi } from '../../services/api';
import { newsService, NewsArticle } from '../../services/news/NewsService';
import EmotionHeatMap from '../EmotionHeatMap';
import { EmotionRecord } from '../../services/emotionService';
import { EmptyState } from '../common/EmptyState';

interface YouTabProps {
  showAttentionDrawer: boolean;
  setShowAttentionDrawer: (show: boolean) => void;
  familyStatusMembers: any[];
  familyLocations: any[];
  emotionData: EmotionRecord[];
  selectedFamily?: any;
}

export const YouTab: React.FC<YouTabProps> = ({
  showAttentionDrawer,
  setShowAttentionDrawer,
  familyStatusMembers,
  familyLocations,
  emotionData,
  selectedFamily,
}) => {
  const navigation = useNavigation<any>();
  const [showCalendarDrawer, setShowCalendarDrawer] = useState(false);
  const [showShoppingDrawer, setShowShoppingDrawer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [shoppingItems, setShoppingItems] = useState<any[]>([]);
  const [familyReadItems, setFamilyReadItems] = useState<BlogItem[]>([]);
  const [suggestedItems, setSuggestedItems] = useState<BlogItem[]>([]);
  const [combinedBlogItems, setCombinedBlogItems] = useState<BlogItem[]>([]);
  const [familySectionCount, setFamilySectionCount] = useState<number>(0);
  const [sectionTitle, setSectionTitle] = useState<string>('your house read it !');

  useEffect(() => {
    loadData();
  }, [selectedFamily]);

  const loadData = async () => {
    try {
      // Check if we have a selected hourse
      if (!selectedFamily?.id) {
        setAppointments([]);
        setShoppingItems([]);
        setFamilyReadItems([]);
        setSuggestedItems([]);
        setCombinedBlogItems([]);
        setFamilySectionCount(0);
        return;
      }

      // Load appointments (using events as appointments)
      const eventsResponse = await familyApi.getEvents(selectedFamily.id);
      if (eventsResponse.success) {
        const todayEvents = eventsResponse.events.filter(event => {
          const eventDate = new Date(event.startTime);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString();
        });
        setAppointments(todayEvents);
      } else {
        setAppointments([]);
      }

      // For now, set empty shopping items since getTasks doesn't exist in the API
      setShoppingItems([]);

      // Load news content: hourse-read first, then suggestions
      try {
        const membersResp = await familyApi.getFamilyMembers(selectedFamily.id);
        const memberUserIds = (membersResp?.members || membersResp?.data?.members || [])
          .map((m: any) => m.userId)
          .filter(Boolean);

        // Fetch read articles for each member (best-effort)
        const readResults = await Promise.allSettled(
          memberUserIds.map((uid: string) => newsService.getReadArticles(uid))
        );

        const familyReadArticles: NewsArticle[] = readResults
          .filter(r => r.status === 'fulfilled')
          .flatMap((r: any) => r.value as NewsArticle[]);

        // Dedupe by article id and take top 10
        const seen = new Set<string>();
        const uniqueFamilyRead = familyReadArticles.filter(a => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        }).slice(0, 10);

        const familyBlogItems: BlogItem[] = uniqueFamilyRead.map(a => ({
          id: a.id,
          title: a.title,
          subtitle: a.source?.name || a.category,
          imageUri: a.imageUrl,
        }));

        // Suggested from app (top stories)
        const suggested = await newsService.getTopStories();
        const suggestedBlogItems: BlogItem[] = (suggested || []).map(a => ({
          id: a.id,
          title: a.title,
          subtitle: a.source?.name || a.category,
          imageUri: a.imageUrl,
        })).slice(0, 10);

        setFamilyReadItems(familyBlogItems);
        setSuggestedItems(suggestedBlogItems);
        setCombinedBlogItems([...familyBlogItems, ...suggestedBlogItems]);
        setFamilySectionCount(familyBlogItems.length);
        setSectionTitle(familyBlogItems.length > 0 ? 'your house read it !' : 'Suggested for you');
      } catch (e) {
        console.warn('Failed to load prioritized news items', e);
        // Fallback: simple suggestions only
        const suggested = await newsService.getTopStories();
        const suggestedBlogItems: BlogItem[] = (suggested || []).map(a => ({
          id: a.id,
          title: a.title,
          subtitle: a.source?.name || a.category,
          imageUri: a.imageUrl,
        })).slice(0, 10);
        setFamilyReadItems([]);
        setSuggestedItems(suggestedBlogItems);
        setCombinedBlogItems(suggestedBlogItems);
        setFamilySectionCount(0);
        setSectionTitle('Suggested for you');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays on error to show empty states
      setAppointments([]);
      setShoppingItems([]);
      setFamilyReadItems([]);
      setSuggestedItems([]);
      setCombinedBlogItems([]);
      setFamilySectionCount(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };



  return (
    <ScrollView 
      style={homeStyles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Inspiration/Marketing Blog Slider */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>{sectionTitle}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('News')}> 
            <Text style={{ color: '#4A90E2', fontWeight: '600' }}>See more</Text>
          </TouchableOpacity>
        </View>
        <BlogSlider 
          items={combinedBlogItems && combinedBlogItems.length > 0 ? combinedBlogItems : ([
            { id: 'm1', title: 'Build rituals that stick', subtitle: 'Tiny habits for families' },
            { id: 'm2', title: 'Celebrate micro-wins', subtitle: 'Motivation that lasts' },
            { id: 'm3', title: 'Design your perfect week', subtitle: 'Templates inside' },
          ] as BlogItem[])}
          onPressItem={(item) => {
            navigation.navigate('Marketing');
          }}
          onIndexChange={(index) => {
            if (combinedBlogItems && combinedBlogItems.length > 0) {
              if (familySectionCount > 0) {
                if (index >= familySectionCount && sectionTitle !== 'Suggested for you') {
                  setSectionTitle('Suggested for you');
                } else if (index < familySectionCount && sectionTitle !== 'your house read it !') {
                  setSectionTitle('your house read it !');
                }
              } else if (sectionTitle !== 'Suggested for you') {
                setSectionTitle('Suggested for you');
              }
            } else if (sectionTitle !== 'Inspiration') {
              setSectionTitle('Inspiration');
            }
          }}
        />
      </View>

      {/* Today's Appointments */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Today's Appointments</Text>
          <TouchableOpacity 
            style={homeStyles.addAppointmentButton}
            onPress={() => setShowCalendarDrawer(true)}
          >
            <CoolIcon name="plus" size={20} color="#FFB6C1" />
          </TouchableOpacity>
        </View>
        {appointments && appointments.length > 0 ? (
          <AppointmentsList appointments={appointments} />
        ) : (
          <EmptyState
            title="No Appointments Today"
            subtitle="You have a free day! Tap the + button to add an appointment."
          />
        )}
      </View>

      {/* Shopping List */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Shopping List</Text>
          <TouchableOpacity 
            style={homeStyles.addAppointmentButton}
            onPress={() => setShowShoppingDrawer(true)}
          >
            <CoolIcon name="plus" size={20} color="#FFB6C1" />
          </TouchableOpacity>
        </View>
        {shoppingItems && shoppingItems.length > 0 ? (
          <ShoppingList items={shoppingItems} />
        ) : (
          <EmptyState
            title="No Shopping Items"
            subtitle="Your shopping list is empty. Tap the + button to add items!"
          />
        )}
      </View>

      {/* hourse Status */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Live Status</Text>
          <TouchableOpacity style={homeStyles.refreshButton}>
            <IconIon name="refresh" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {familyStatusMembers && familyStatusMembers.length > 0 ? (
          <FamilyStatusCards 
            members={familyStatusMembers}
            onMemberPress={(m) => { setSelectedMember(m); setDrawerVisible(true); }}
          />
        ) : (
          <EmptyState
            title="No hourse Members"
            subtitle="Add hourse members to see their live status and health data."
          />
        )}
      </View>

      {/* hourse Location */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>hourse Locations</Text>
          <TouchableOpacity style={homeStyles.mapToggleButton}>
            <CoolIcon name="map" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {familyLocations && familyLocations.length > 0 ? (
          <FamilyLocationMap locations={familyLocations} />
        ) : (
          <EmptyState
            title="No Location Data"
            subtitle="hourse member locations will appear here when available."
          />
        )}
      </View>

      {/* hourse Insights */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>hourse Insights</Text>
          <TouchableOpacity style={homeStyles.insightsButton}>
            <IconIon name="analytics" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={homeStyles.insightsGrid}>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <CoolIcon name="heart" size={20} color="#EF4444" />
            </View>
            <Text style={homeStyles.insightValue}>-</Text>
            <Text style={homeStyles.insightLabel}>Health Score</Text>
          </View>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <CoolIcon name="walk" size={20} color="#10B981" />
            </View>
            <Text style={homeStyles.insightValue}>-</Text>
            <Text style={homeStyles.insightLabel}>Avg Steps</Text>
          </View>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <CoolIcon name="sleep" size={20} color="#3B82F6" />
            </View>
            <Text style={homeStyles.insightValue}>-</Text>
            <Text style={homeStyles.insightLabel}>Avg Sleep</Text>
          </View>
          <View style={homeStyles.insightCard}>
            <View style={homeStyles.insightIcon}>
              <CoolIcon name="emoticon-happy" size={20} color="#F59E0B" />
            </View>
            <Text style={homeStyles.insightValue}>-</Text>
            <Text style={homeStyles.insightLabel}>Mood</Text>
          </View>
        </View>
      </View>

      {/* Emotion Heat Map */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <View style={homeStyles.sectionTitleContainer}>
            <Text style={homeStyles.sectionTitle}>Emotion Tracking</Text>
          </View>
        </View>
        
        {emotionData && emotionData.length > 0 ? (
          <EmotionHeatMap
            type="personal"
            data={emotionData}
            onDayPress={(date, emotion) => {
              // Handle day press if needed
            }}
          />
        ) : (
          <EmptyState
            title="No Emotion Data"
            subtitle="Start tracking your emotions to see your wellbeing chart here."
          />
        )}
      </View>

      {/* hourse Member Drawer */}
      <FamilyMemberDrawer 
        visible={drawerVisible}
        member={selectedMember}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Calendar Drawer */}
      <CalendarDrawer
        visible={showCalendarDrawer}
        onClose={() => setShowCalendarDrawer(false)}
      />

      {/* Shopping Drawer */}
      <ShoppingDrawer
        visible={showShoppingDrawer}
        onClose={() => setShowShoppingDrawer(false)}
        onAddItem={(item) => {
          // Add the new item to the shopping list
          setShoppingItems(prev => [...prev, item]);
          setShowShoppingDrawer(false);
        }}
      />
    </ScrollView>
  );
};
