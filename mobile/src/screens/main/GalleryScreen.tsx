import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Modal, Dimensions, ScrollView, TextInput, Alert, Animated } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { useFocusEffect } from '@react-navigation/native';
import { FamilyDropdown } from '../../components/home/FamilyDropdown';
import MainScreenLayout from '../../components/layout/MainScreenLayout';
import { galleryService } from '../../services/gallery/GalleryService';

const { width } = Dimensions.get('window');
const GAP = 6;
const NUM_COLUMNS = 3;
const H_PADDING = 20;
const TILE_SIZE = Math.floor((width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS);

type MediaType = 'photo' | 'video';
type TabType = 'all' | 'people' | 'places' | 'collections';
type GroupByType = 'date' | 'month' | 'year' | 'location' | 'people';

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

interface Person {
  id: string;
  name: string;
  avatar: string;
  count: number;
}

interface Place {
  id: string;
  name: string;
  thumbnail: string;
  count: number;
}

interface Collection {
  id: string;
  name: string;
  thumbnail?: string;
  count: number;
  createdAt: string;
}


const TABS: Array<{ id: TabType; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'people', label: 'People', icon: 'account-group' },
  { id: 'places', label: 'Places', icon: 'map-marker' },
  { id: 'collections', label: 'Collections', icon: 'folder' },
];

const GROUP_BY_OPTIONS: Array<{ id: GroupByType; label: string; icon: string }> = [
  { id: 'date', label: 'Date', icon: 'calendar' },
  { id: 'month', label: 'Month', icon: 'calendar-month' },
  { id: 'year', label: 'Year', icon: 'calendar-year' },
  { id: 'location', label: 'Location', icon: 'map-marker' },
  { id: 'people', label: 'People', icon: 'account-group' },
];

const formatDateHeader = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatMonthHeader = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
};

const formatYearHeader = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric' });
};

interface GalleryScreenProps { embedded?: boolean }
const GalleryScreen: React.FC<GalleryScreenProps> = ({ embedded }) => {
  console.log('[UI] GalleryScreen (main) using MainScreenLayout');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [groupBy, setGroupBy] = useState<GroupByType>('date');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectMode, setSelectMode] = useState(false);
  const [lightbox, setLightbox] = useState<{ visible: boolean; index: number; list: MediaItem[] }>({ visible: false, index: 0, list: [] });
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [currentImage, setCurrentImage] = useState<MediaItem | null>(null);
  const [showGroupByOptions, setShowGroupByOptions] = useState(false);
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('Smith hourse');
  
  // Data state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Use shared animation values
  const { 
    cardScaleAnim, 
    cardMarginTopAnim, 
    familyNameScaleAnim, 
    welcomeOpacityAnim, 
    chatOpacityAnim,
    animateToGallery 
  } = useNavigationAnimation();

  // Animation values for initial entrance
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

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
          const familyId = 'hourse-1'; // This should come from context
          const [photos, albums] = await Promise.all([
            galleryService.getPhotos(familyId),
            galleryService.getAlbums(familyId)
          ]);
          
          // Transform photos to MediaItem format
          const transformedMedia: MediaItem[] = photos.map(photo => ({
            id: photo.id,
            type: 'photo' as MediaType,
            uri: photo.uri,
            date: photo.createdAt.toISOString().split('T')[0],
            location: photo.location?.address || '',
            people: [], // Would need to extract from metadata
            collectionIds: photo.albumId ? [photo.albumId] : [],
          }));
          
          setMediaItems(transformedMedia);
          setCollections(albums.map(album => ({
            id: album.id,
            name: album.name,
            thumbnail: album.coverPhoto,
            count: album.photoCount,
            createdAt: album.createdAt.toISOString().split('T')[0],
          })));
        } catch (apiError) {
          console.warn('API not available for gallery:', apiError);
          setMediaItems([]);
          setCollections([]);
        }
        
        setPeople([]);
        setPlaces([]);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setMediaItems([]);
        setCollections([]);
        setPeople([]);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Animate to gallery when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      animateToGallery();
    }, [animateToGallery])
  );

  const getMediaForTab = () => {
    // All tabs now show gallery content with different filters
    return mediaItems;
  };

  const sections = useMemo(() => {
    const media = getMediaForTab();
    const map: Record<string, MediaItem[]> = {};
    
    media.forEach(item => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'date':
          groupKey = item.date;
          break;
        case 'month':
          groupKey = item.date.substring(0, 7); // YYYY-MM
          break;
        case 'year':
          groupKey = item.date.substring(0, 4); // YYYY
          break;
        case 'location':
          groupKey = item.location || 'Unknown Location';
          break;
        case 'people':
          groupKey = item.people && item.people.length > 0 ? item.people.join(', ') : 'No People';
          break;
        default:
          groupKey = item.date;
      }
      
      if (!map[groupKey]) map[groupKey] = [];
      map[groupKey].push(item);
    });
    
    const entries = Object.entries(map).sort((a, b) => {
      if (groupBy === 'date' || groupBy === 'month' || groupBy === 'year') {
        return a[0] < b[0] ? 1 : -1; // Sort dates descending
      }
      return a[0].localeCompare(b[0]); // Sort alphabetically for other types
    });
    
    return entries.map(([key, items]) => ({ key, items }));
  }, [activeTab, groupBy]);

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

  const navigateToFamilyWithFilter = (filterType: 'person' | 'location' | 'collection', filterValue: string) => {
    // Switch to appropriate tab and show filtered content
    switch (filterType) {
      case 'person':
        setActiveTab('people');
        break;
      case 'location':
        setActiveTab('places');
        break;
      case 'collection':
        setActiveTab('collections');
        break;
    }
    // In real implementation, you would also set filter state here
    Alert.alert('Filter Applied', `Showing ${filterType}: ${filterValue}`);
  };

  const handleFamilySelect = (familyName: string) => {
    setSelectedFamily(familyName);
    setShowFamilyDropdown(false);
  };

  // Mock hourse data
  const availableFamilies = [
    { id: '1', name: 'Smith hourse', members: 4 },
    { id: '2', name: 'Johnson hourse', members: 3 },
    { id: '3', name: 'Williams hourse', members: 5 },
    { id: '4', name: 'Brown hourse', members: 2 },
  ];

  const getGroupHeader = (key: string) => {
    switch (groupBy) {
      case 'date':
        return formatDateHeader(key);
      case 'month':
        return formatMonthHeader(key + '-01');
      case 'year':
        return formatYearHeader(key + '-01-01');
      case 'location':
        return `📍 ${key}`;
      case 'people':
        return `👥 ${key}`;
      default:
        return key;
    }
  };

  const renderTile = (items: MediaItem[]) => ({ item, index }: { item: MediaItem; index: number }) => (
    <TouchableOpacity
      style={{ width: TILE_SIZE, height: TILE_SIZE, borderRadius: 12, overflow: 'hidden', marginBottom: GAP }}
      activeOpacity={0.9}
      onPress={() => (selectMode ? toggleSelect(item) : openLightbox(items, index))}
      onLongPress={() => toggleSelect(item)}
    >
      <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      {item.type === 'video' && (
        <View style={{ position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconMC name="play" size={12} color="#FFFFFF" />
        </View>
      )}
      {selected[item.id] && (
        <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,182,193,0.9)', borderRadius: 9999, padding: 4 }}>
          <IconMC name="check" size={14} color="#1F2937" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilteredGallery = () => {
    // Filter media based on active tab
    let filteredMedia = mediaItems;
    
    switch (activeTab) {
      case 'people':
        // Show media filtered by people (for demo, show all)
        break;
      case 'places':
        // Show media filtered by places (for demo, show all)
        break;
      case 'collections':
        // Show media filtered by collections (for demo, show all)
        break;
      default:
        // Show all media
        break;
    }
    
    // Group filtered media by date
    const map: Record<string, MediaItem[]> = {};
    filteredMedia.forEach(item => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    const entries = Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    const sections = entries.map(([date, items]) => ({ key: date, items }));
    
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Action buttons - only show in All tab */}
        {activeTab === 'all' && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: H_PADDING, marginBottom: 16, gap: 8 }}>
            {selectMode ? (
              <>
                <TouchableOpacity style={{ padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' }} onPress={() => { setSelected({}); setSelectMode(false); }}>
                  <IconMC name="close" size={18} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' }}>
                  <IconMC name="trash-can" size={18} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' }}>
                  <IconMC name="share-variant" size={18} color="#6B7280" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={{ padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' }}
                  onPress={() => setShowGroupByOptions(true)}
                >
                  <IconMC name="sort" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' }}>
                  <IconMC name="dots-vertical" size={20} color="#6B7280" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        
        {sections.map(section => (
          <View key={section.key} style={{ marginBottom: 12 }}>
            <Text style={{ paddingHorizontal: H_PADDING, paddingVertical: 6, fontWeight: '700', color: '#374151' }}>{getGroupHeader(section.key)}</Text>
            <View style={{ paddingHorizontal: H_PADDING }}>
              <FlatList
                data={section.items}
                keyExtractor={(it) => it.id}
                renderItem={renderTile(section.items)}
                numColumns={NUM_COLUMNS}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: GAP }}
                scrollEnabled={false}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderAllGallery = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      {sections.map(section => (
        <View key={section.key} style={{ marginBottom: 12 }}>
          <Text style={{ paddingHorizontal: H_PADDING, paddingVertical: 6, fontWeight: '700', color: '#374151' }}>{getGroupHeader(section.key)}</Text>
          <View style={{ paddingHorizontal: H_PADDING }}>
            <FlatList
              data={section.items}
              keyExtractor={(it) => it.id}
              renderItem={renderTile(section.items)}
              numColumns={NUM_COLUMNS}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: GAP }}
              scrollEnabled={false}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const inner = (
    <>
      <SegmentedTabs
        tabs={TABS}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TabType)}
      />
      {renderFilteredGallery()}
      {!selectMode && (
        <View style={{ position: 'absolute', right: 20, bottom: 24, alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={0.9} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <IconMC name="camera" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={{ height: 8 }} />
          <TouchableOpacity activeOpacity={0.9} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <IconMC name="upload" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}
        {/* Create Collection Modal */}
        <Modal visible={showCreateCollection} transparent animationType="slide" onRequestClose={() => setShowCreateCollection(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: width - 40 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Create New Collection</Text>
              <TextInput
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                placeholder="Collection name"
                style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16 }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity onPress={() => setShowCreateCollection(false)} style={{ padding: 12 }}>
                  <Text style={{ color: '#6B7280' }}>Cancel</Text>
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
              <IconMC name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 40, right: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 9999, zIndex: 2 }} 
              onPress={() => showImageMenu(lightbox.list[lightbox.index])}
            >
              <IconMC name="dots-vertical" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <FlatList
              data={lightbox.list}
              keyExtractor={(it) => it.id}
              horizontal
              pagingEnabled
              initialScrollIndex={lightbox.index}
              getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
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

        {/* Group By Options Modal */}
        <Modal visible={showGroupByOptions} transparent animationType="slide" onRequestClose={() => setShowGroupByOptions(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Group By</Text>
              {GROUP_BY_OPTIONS.map(option => (
                <TouchableOpacity 
                  key={option.id}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 12,
                    backgroundColor: groupBy === option.id ? 'rgba(255,182,193,0.1)' : 'transparent',
                    borderRadius: 8,
                    marginBottom: 4
                  }}
                  onPress={() => {
                    setGroupBy(option.id);
                    setShowGroupByOptions(false);
                  }}
                >
                  <IconMC name={option.icon} size={20} color={groupBy === option.id ? '#FFB6C1' : '#6B7280'} />
                  <Text style={{ marginLeft: 12, color: groupBy === option.id ? '#FFB6C1' : '#1F2937', fontWeight: groupBy === option.id ? '600' : '400' }}>
                    {option.label}
                  </Text>
                  {groupBy === option.id && (
                    <IconMC name="check" size={20} color="#FFB6C1" style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowGroupByOptions(false)} style={{ marginTop: 16, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* hourse Selection Dropdown Modal - same as HomeScreen */}
        <FamilyDropdown
          visible={showFamilyDropdown}
          onClose={() => setShowFamilyDropdown(false)}
          selectedFamily={selectedFamily}
          onFamilySelect={handleFamilySelect}
          availableFamilies={availableFamilies}
        />

        {/* Image Options Modal */}
        <Modal visible={showImageOptions} transparent animationType="slide" onRequestClose={() => setShowImageOptions(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Options</Text>
              {currentImage && (
                <>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                    <IconMC name="pencil" size={20} color="#6B7280" />
                    <Text style={{ marginLeft: 12, color: '#1F2937' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                    <IconMC name="share-variant" size={20} color="#6B7280" />
                    <Text style={{ marginLeft: 12, color: '#1F2937' }}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                    <IconMC name="download" size={20} color="#6B7280" />
                    <Text style={{ marginLeft: 12, color: '#1F2937' }}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                    <IconMC name="trash-can" size={20} color="#EF4444" />
                    <Text style={{ marginLeft: 12, color: '#EF4444' }}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={() => setShowImageOptions(false)} style={{ marginTop: 16, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
    </View>
        </Modal>
    </>
  );

  if (embedded) return inner;

  return (
    <MainScreenLayout
      selectedFamily={selectedFamily}
      onToggleFamilyDropdown={() => setShowFamilyDropdown(!showFamilyDropdown)}
      showFamilyDropdown={showFamilyDropdown}
      cardMarginTopAnim={cardMarginTopAnim}
      cardOpacityAnim={cardOpacityAnim}
    >
      {inner}
    </MainScreenLayout>
  );
};

export default GalleryScreen;
