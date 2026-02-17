import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Modal, Dimensions, ScrollView, TextInput, Alert, Animated } from 'react-native';
import { 
  Check as LucideCheck, 
  Play as LucidePlay, 
  Search as LucideSearch, 
  Plus as LucidePlus, 
  SortAsc as LucideSortAsc, 
  BookPlus as LucideBookPlus, 
  Video as LucideVideo, 
  ImagePlus as LucideImagePlus, 
  FolderPlus as LucideFolderPlus, 
  Camera as LucideCamera, 
  ArrowLeft as LucideArrowLeft, 
  MoreVertical as LucideMoreVertical,
  Pencil as LucidePencil,
  Share2 as LucideShare2,
  Download as LucideDownload,
  Trash2 as LucideTrash2
} from 'lucide-react-native';

const Check = LucideCheck as any;
const Play = LucidePlay as any;
const Search = LucideSearch as any;
const Plus = LucidePlus as any;
const SortAsc = LucideSortAsc as any;
const BookPlus = LucideBookPlus as any;
const Video = LucideVideo as any;
const ImagePlus = LucideImagePlus as any;
const FolderPlus = LucideFolderPlus as any;
const Camera = LucideCamera as any;
const ArrowLeft = LucideArrowLeft as any;
const MoreVertical = LucideMoreVertical as any;
const Pencil = LucidePencil as any;
const Share2 = LucideShare2 as any;
const Download = LucideDownload as any;
const Trash2 = LucideTrash2 as any;

import { homeStyles } from '../../styles/homeStyles';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { useFocusEffect } from '@react-navigation/native';
import { CircleDropdown } from '../../components/home/CircleDropdown';
import MainScreenLayout from '../../components/layout/MainScreenLayout';
import { galleryApi } from '../../services/api';
import { useUserData } from '../../contexts/UserDataContext';
import { GalleryGridSkeleton } from '../../components/common/SkeletonLoader';
// import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const GAP = 6;
const NUM_COLUMNS = 3;
const H_PADDING = 20;
const TILE_SIZE = Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS);

type MediaType = 'photo' | 'video';
type CategoryType = 'all' | 'nature' | 'architecture' | 'travel' | 'portraits' | 'streets' | 'circle';

interface MediaItem {
  id: string;
  type: MediaType;
  uri: string;
  title?: string;
  date: string;
  location?: string;
  people?: string[];
  collectionIds?: string[];
}

const CATEGORIES: Array<{ id: CategoryType; label: string; image: string }> = [
  { id: 'all', label: 'All', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop' },
  { id: 'nature', label: 'Nature', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop' },
  { id: 'architecture', label: 'Architecture', image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop' },
  { id: 'travel', label: 'Travel', image: 'https://images.unsplash.com/photo-1504609773096-104ffcd0a784?q=80&w=2070&auto=format&fit=crop' },
  { id: 'portraits', label: 'Portraits', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop' },
  { id: 'streets', label: 'Streets', image: 'https://images.unsplash.com/photo-1574706987693-02f89f7f4615?q=80&w=2070&auto=format&fit=crop' },
];

const ALBUMS = [
  { id: '1', title: 'Summer Vacay', count: 124, cover: 'https://images.unsplash.com/photo-1519046904884-53103b34b271?q=80&w=2070&auto=format&fit=crop' },
  { id: '2', title: 'Circle Reunion', count: 85, cover: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop' },
  { id: '3', title: 'Weekend Trip', count: 42, cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop' },
];

const formatDateHeader = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

interface GalleryScreenProps { embedded?: boolean; darkMode?: boolean; }
const GalleryScreen: React.FC<GalleryScreenProps> = ({ embedded, darkMode = false }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectMode, setSelectMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false); // New state for FAB menu
  const [lightbox, setLightbox] = useState<{ visible: boolean; index: number; list: MediaItem[] }>({ visible: false, index: 0, list: [] });
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [currentImage, setCurrentImage] = useState<MediaItem | null>(null);
  const [showCircleDropdown, setShowCircleDropdown] = useState(false);
  const { families, selectedCircle, setSelectedCircle } = useUserData();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [showSortModal, setShowSortModal] = useState(false);

  // Data state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Use shared animation values
  const {
    cardMarginTopAnim,
    animateToHome
  } = useNavigationAnimation();

  // Animation values for initial entrance
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Text color based on darkMode
  const textColor = darkMode ? '#FFFFFF' : '#1F2937';
  const subTextColor = darkMode ? '#9CA3AF' : '#6B7280';
  const bgColor = darkMode ? '#000000' : '#FFFFFF';
  const cardBg = darkMode ? '#1F2937' : '#FFFFFF';
  const inputBg = darkMode ? '#1F2937' : '#F3F4F6';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  useEffect(() => {
    // Animate card entrance
    Animated.timing(cardOpacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load data from service
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Try to load from API first, fallback to mock data
        try {
          // Use a real circle ID found in the database
          const circleId = families.find(f => f.name === selectedCircle)?.id; 

          if (circleId) {
             const [photos] = await Promise.all([
                galleryApi.getPhotos(circleId),
                galleryApi.getAlbums(circleId)
             ]);

              // Transform photos to MediaItem format
              const transformedMedia: MediaItem[] = photos.map((photo: any) => ({
                id: photo.id,
                type: 'photo' as MediaType,
                uri: photo.uri,
                title: photo.title,
                date: photo.createdAt, 
                location: photo.location?.address || '',
                people: [],
                collectionIds: photo.albumId ? [photo.albumId] : [],
              }));
              
              setMediaItems(transformedMedia);
          } else {
             setMediaItems([]);
          }

        } catch (apiError) {
          console.warn('API not available for gallery:', apiError);
          setMediaItems([]);
        }
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setMediaItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCircle, families]);

  // Animate to gallery when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      animateToHome();
    }, [animateToHome])
  );

  const toggleSelect = (item: MediaItem) => {
    setSelected(prev => {
      const next = { ...prev, [item.id]: !prev[item.id] };
      const any = Object.values(next).some(Boolean);
      setSelectMode(any);
      return next;
    });
  };

  const openLightbox = (list: MediaItem[], index: number) => {
    setLightbox({ visible: true, index, list });
    setSelectMode(false);
    setSelected({});
  };

  const closeLightbox = () => setLightbox({ visible: false, index: 0, list: [] });

  const showImageMenu = (item: MediaItem) => {
    setCurrentImage(item);
    setShowImageOptions(true);
  };

  const createCollection = () => {
    if (newCollectionName.trim()) {
      Alert.alert('Success', `Collection "${newCollectionName}" created!`);
      setNewCollectionName('');
      setShowCreateCollection(false);
    }
  };

  const handleCircleSelect = (circleName: string) => {
    setSelectedCircle(circleName);
    setShowCircleDropdown(false);
  };

  // Mock Circle data
  const availableFamilies = [
    { id: '1', name: 'Smith Circle', members: 4 },
    { id: '2', name: 'Johnson Circle', members: 3 },
    { id: '3', name: 'Williams Circle', members: 5 },
    { id: '4', name: 'Brown Circle', members: 2 },
  ];


  const renderCategories = () => (
    <View style={homeStyles.categorySection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeStyles.categoryScrollContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={homeStyles.categoryItem}
            onPress={() => setActiveCategory(cat.id)}
            activeOpacity={0.8}
          >
            <View style={[homeStyles.categoryAvatarContainer, activeCategory === cat.id && homeStyles.categoryAvatarContainerSelected] as any}>
              <Image source={{ uri: cat.image }} style={homeStyles.categoryAvatar as any} />
              {activeCategory === cat.id && (
                <View style={{ position: 'absolute', bottom: -2, backgroundColor: '#FFB6C1', paddingHorizontal: 6, borderRadius: 10 }}>
                  <Check size={10} color="white" />
                </View>
              )}
            </View>
            <Text style={[
              homeStyles.categoryLabel,
              activeCategory === cat.id && homeStyles.categoryLabelSelected,
              { color: darkMode && activeCategory !== cat.id ? '#D1D5DB' : undefined }
            ]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Section Tabs
  type SectionTabType = 'Albums' | 'Story' | 'Diary' | 'Shared';
  const [activeSectionTab, setActiveSectionTab] = useState<SectionTabType>('Albums');
  const SECTION_TABS: SectionTabType[] = ['Albums', 'Story', 'Diary', 'Shared'];

  // MOCK DATA FOR OTHER TABS
  const STORIES = [
    { id: 's1', title: 'Road Trip', items: 15, cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop' },
    { id: 's2', title: 'B-Day Bash', items: 24, cover: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=2000&auto=format&fit=crop' },
    { id: 's3', title: 'Cooking', items: 8, cover: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2000&auto=format&fit=crop' },
  ];

  const DIARY_HIGHLIGHTS = [
    { id: 'd1', title: 'Morning Walk', items: 5, cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop' },
    { id: 'd2', title: 'Lunch', items: 2, cover: 'https://images.unsplash.com/photo-1504609773096-104ffcd0a784?q=80&w=2070&auto=format&fit=crop' },
  ];

  const renderContentSection = () => {
    // Determine content based on active tab
    // For now, we mock different lists, or reuse album style for all but with different data
    let data = ALBUMS;
    if (activeSectionTab === 'Story') data = STORIES.map(s => ({ ...s, count: s.items }));
    if (activeSectionTab === 'Diary') data = DIARY_HIGHLIGHTS.map(s => ({ ...s, count: s.items }));
    if (activeSectionTab === 'Shared') data = []; // Empty state example

    return (
      <View style={homeStyles.albumSection}>
        {/* Left Aligned Tabs Header */}
        <View style={homeStyles.sectionHeader}>
          {SECTION_TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveSectionTab(tab)} activeOpacity={0.7} style={{ alignItems: 'center' }}>
              <Text style={[
                homeStyles.sectionTab,
                activeSectionTab === tab && homeStyles.sectionTabActive,
                { color: activeSectionTab === tab ? '#EF4444' : subTextColor }
              ]}>{tab}</Text>
              {activeSectionTab === tab && <View style={homeStyles.sectionTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Horizontal Content List */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeStyles.albumScrollContent}>
          {data.map((item) => (
            <TouchableOpacity key={item.id} style={homeStyles.albumCard as any} activeOpacity={0.9}>
              <Image source={{ uri: item.cover }} style={homeStyles.albumCover as any} />
              <Text style={[homeStyles.albumTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
              <Text style={homeStyles.albumCount}>{item.count} items</Text>
            </TouchableOpacity>
          ))}

          {/* New Create Button - Only for Albums usually, but keeping generalized */}
          <TouchableOpacity style={[homeStyles.albumCard, { justifyContent: 'center', alignItems: 'center' }]} activeOpacity={0.9} onPress={() => setShowCreateCollection(true)}>
            <View style={[homeStyles.albumCover, { backgroundColor: inputBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: borderColor, borderStyle: 'dashed' }]}>
              <Plus size={32} color={subTextColor} />
            </View>
            <Text style={[homeStyles.albumTitle, { color: textColor }]}>New {activeSectionTab.slice(0, -1)}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderDiscoveryGrid = () => {
    return (
      <View style={homeStyles.discoverySection}>
        <View style={[homeStyles.discoveryHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text style={[homeStyles.sectionTitle, { color: textColor }]}>Discovery</Text>
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 }}
          >
            <Text style={{ fontSize: 13, color: subTextColor, fontWeight: '500' }}>Sort by: <Text style={{ color: textColor }}>{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</Text></Text>
            <SortAsc size={20} color={subTextColor} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={mediaItems}
          keyExtractor={(it) => it.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={{ width: TILE_SIZE, height: TILE_SIZE, borderRadius: 6, overflow: 'hidden', marginBottom: GAP, marginRight: (index + 1) % NUM_COLUMNS === 0 ? 0 : GAP }}
              activeOpacity={0.9}
              onPress={() => (selectMode ? toggleSelect(item) : openLightbox(mediaItems, index))}
              onLongPress={() => toggleSelect(item)}
            >
              <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              {item.type === 'video' && (
                <View style={{ position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Play size={12} color="#FFFFFF" />
                </View>
              )}
              {selected[item.id] && (
                <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,182,193,0.9)', borderRadius: 9999, padding: 4 }}>
                  <Check size={14} color="#1F2937" />
                </View>
              )}
            </TouchableOpacity>
          )}
          numColumns={NUM_COLUMNS}
          scrollEnabled={false} // Parent ScrollView handles scrolling
        />
      </View>
    )
  }

  const inner = (
    <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ backgroundColor: embedded ? 'transparent' : bgColor }}
    >
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, height: 48 }}>
          <Search size={24} color="#9CA3AF" />
          <TextInput
            placeholder="Search photos, albums, or stories..."
            placeholderTextColor="#9CA3AF"
            style={{ flex: 1, marginLeft: 12, fontSize: 16, color: textColor, height: '100%' }}
          />
        </View>
      </View>

      {renderCategories()}
      {renderContentSection()}

      {loading ? (
        <View style={{ paddingHorizontal: H_PADDING }}>
          <GalleryGridSkeleton />
        </View>
      ) : (
        renderDiscoveryGrid()
      )}

      {/* Action Floating Buttons */}
      {!selectMode && !loading && (
        <View style={{ position: 'absolute', right: 20, bottom: 24, alignItems: 'flex-end', gap: 12 }}>

          {/* Menu Items */}
          {showAddMenu && (
            <View style={{ gap: 12, alignItems: 'flex-end', marginBottom: 4 }}>
              {/* Add Diary */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#000000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Add Diary</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}
                >
                  <BookPlus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Add Story */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#000000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Add Story</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}
                >
                  <Video size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Add Image */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#000000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Add Image</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}
                >
                  <ImagePlus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Create Album */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#000000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Create Album</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => { setShowAddMenu(false); setShowCreateCollection(true); }}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}
                >
                  <FolderPlus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Camera */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: '#000000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Camera</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}
                >
                  <Camera size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Main Toggle Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowAddMenu(!showAddMenu)}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6, transform: [{ rotate: showAddMenu ? '45deg' : '0deg' }] }}
          >
            <Plus size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>
      )}

      {/* Create Collection Modal */}
      <Modal visible={showCreateCollection} transparent animationType="slide" onRequestClose={() => setShowCreateCollection(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, width: width - 40 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, color: textColor }}>Create New Collection</Text>
            <TextInput
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Collection name"
              placeholderTextColor={subTextColor}
              style={{ borderWidth: 1, borderColor: borderColor, borderRadius: 8, padding: 12, marginBottom: 16, color: textColor, backgroundColor: inputBg }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setShowCreateCollection(false)} style={{ padding: 12 }}>
                <Text style={{ color: subTextColor }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createCollection} style={{ padding: 12 }}>
                <Text style={{ color: '#FFB6C1', fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lightbox with metadata and options */}
      <Modal visible={lightbox.visible} transparent animationType="fade" onRequestClose={closeLightbox}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}
          onPress={closeLightbox}
          activeOpacity={1}
        >
          {/* Header buttons */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, left: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 9999, zIndex: 2 }}
            onPress={closeLightbox}
          >
             <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 9999, zIndex: 2 }}
            onPress={() => showImageMenu(lightbox.list[lightbox.index])}
          >
             <MoreVertical size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <FlatList
            data={lightbox.list}
            keyExtractor={(it) => it.id}
            horizontal
            pagingEnabled
            initialScrollIndex={lightbox.index}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ width, flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}
                onPress={closeLightbox}
                activeOpacity={1}
              >
                {/* Image centered */}
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: Math.min(width - 40, width * 0.9),
                    height: Math.min(width - 40, width * 0.9),
                    borderRadius: 16
                  }}
                  resizeMode="contain"
                />

                {/* Metadata below image */}
                <View style={{ marginTop: 20, paddingHorizontal: 20, alignItems: 'center', maxWidth: width - 40 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                    {item.title || 'Media'}
                  </Text>
                  <Text style={{ color: '#D1D5DB', marginTop: 8, fontSize: 14, textAlign: 'center' }}>
                    {formatDateHeader(item.date)}
                  </Text>
                  {item.location && (
                    <Text style={{ color: '#D1D5DB', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                      📍 {item.location}
                    </Text>
                  )}
                  {item.people && item.people.length > 0 && (
                    <Text style={{ color: '#D1D5DB', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                      👥 {item.people.join(', ')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </TouchableOpacity>
      </Modal>

      {/* Circle Selection Dropdown Modal - same as HomeScreen */}
      <CircleDropdown
        visible={showCircleDropdown}
        onClose={() => setShowCircleDropdown(false)}
        selectedCircle={selectedCircle || ''}
        onCircleSelect={handleCircleSelect}
        availableFamilies={availableFamilies}
      />

      {/* Image Options Modal */}
      <Modal visible={showImageOptions} transparent animationType="slide" onRequestClose={() => setShowImageOptions(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, color: textColor }}>Options</Text>
            {currentImage && (
              <>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                   <Pencil size={20} color={subTextColor} />
                  <Text style={{ marginLeft: 12, color: textColor }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                   <Share2 size={20} color={subTextColor} />
                  <Text style={{ marginLeft: 12, color: textColor }}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                   <Download size={20} color={subTextColor} />
                  <Text style={{ marginLeft: 12, color: textColor }}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                   <Trash2 size={20} color="#EF4444" />
                  <Text style={{ marginLeft: 12, color: '#EF4444' }}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={() => setShowImageOptions(false)} style={{ marginTop: 16, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: subTextColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Options Modal */}
      <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, paddingTop: 16, width: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 }}>
            <View style={{ width: 40, height: 4, backgroundColor: borderColor, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 16, color: textColor }}>Sort By</Text>
            {['date', 'name', 'size'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => { setSortBy(option as any); setShowSortModal(false); }}
                style={{ paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: sortBy === option ? (darkMode ? '#374151' : '#FEF2F2') : 'transparent' }}
              >
                <Text style={{ fontSize: 16, color: sortBy === option ? '#BE123C' : subTextColor, fontWeight: sortBy === option ? '600' : '400', textTransform: 'capitalize' }}>
                  {option}
                </Text>
                 {sortBy === option && <Check size={20} color="#BE123C" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );

  if (embedded) return inner;

  return (
    <MainScreenLayout
      cardMarginTopAnim={cardMarginTopAnim}
      cardOpacityAnim={cardOpacityAnim}
    >
      {inner}
    </MainScreenLayout>
  );
};

export default GalleryScreen;

