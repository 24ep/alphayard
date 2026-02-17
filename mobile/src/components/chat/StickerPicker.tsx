import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../services/api/chat';

const SCREEN_WIDTH = Dimensions.get('window').width;
const STICKER_SIZE = (SCREEN_WIDTH - 48) / 4;

interface Sticker {
  id: string;
  packId: string;
  fileUrl: string;
  emoji?: string;
}

interface StickerPack {
  id: string;
  name: string;
  thumbnailUrl?: string;
  stickers?: Sticker[];
}

interface StickerPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: Sticker) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  visible,
  onClose,
  onSelectSticker,
}) => {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [recentStickers, setRecentStickers] = useState<Sticker[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    if (visible) {
      loadPacks();
      loadRecentStickers();
    }
  }, [visible]);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getUserStickerPacks();
      if (response.success) {
        const userPacks = response.packs?.map((p: any) => p.pack) || [];
        setPacks(userPacks);
        if (userPacks.length > 0) {
          setSelectedPackId(userPacks[0].id);
          loadPackStickers(userPacks[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading sticker packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentStickers = async () => {
    try {
      const response = await chatApi.getRecentStickers(20);
      if (response.success) {
        setRecentStickers(response.stickers || []);
      }
    } catch (error) {
      console.error('Error loading recent stickers:', error);
    }
  };

  const loadPackStickers = async (packId: string) => {
    try {
      const response = await chatApi.getStickerPack(packId);
      if (response.success && response.pack) {
        setStickers(response.pack.stickers || []);
      }
    } catch (error) {
      console.error('Error loading stickers:', error);
    }
  };

  const handleSelectPack = (packId: string) => {
    setSelectedPackId(packId);
    if (packId === 'recent') {
      setStickers(recentStickers);
    } else {
      loadPackStickers(packId);
    }
  };

  const handleSelectSticker = async (sticker: Sticker) => {
    try {
      await chatApi.trackStickerUsage(sticker.id);
    } catch (error) {
      console.error('Error tracking sticker usage:', error);
    }
    onSelectSticker(sticker);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Stickers</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Pack tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.packTabs}
            contentContainerStyle={styles.packTabsContent}
          >
            <TouchableOpacity
              style={[styles.packTab, selectedPackId === 'recent' && styles.packTabActive]}
              onPress={() => handleSelectPack('recent')}
            >
              <Ionicons 
                name="time" 
                size={24} 
                color={selectedPackId === 'recent' ? '#3B82F6' : '#9CA3AF'} 
              />
            </TouchableOpacity>
            
            {packs.map((pack) => (
              <TouchableOpacity
                key={pack.id}
                style={[styles.packTab, selectedPackId === pack.id && styles.packTabActive]}
                onPress={() => handleSelectPack(pack.id)}
              >
                {pack.thumbnailUrl ? (
                  <Image 
                    source={{ uri: pack.thumbnailUrl }} 
                    style={styles.packThumbnail} 
                  />
                ) : (
                  <View style={styles.packPlaceholder}>
                    <Text style={styles.packPlaceholderText}>
                      {pack.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.packTab} onPress={() => {}}>
              <Ionicons name="add" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </ScrollView>

          {/* Stickers grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <FlatList
              data={selectedPackId === 'recent' ? recentStickers : stickers}
              keyExtractor={(item) => item.id}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stickerItem}
                  onPress={() => handleSelectSticker(item)}
                >
                  <Image
                    source={{ uri: item.fileUrl }}
                    style={styles.stickerImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.stickersGrid}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No stickers</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// Sticker Store Modal
interface StickerStoreProps {
  visible: boolean;
  onClose: () => void;
  onPackAdded: () => void;
}

export const StickerStore: React.FC<StickerStoreProps> = ({
  visible,
  onClose,
  onPackAdded,
}) => {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPack, setAddingPack] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadStorePacks();
    }
  }, [visible]);

  const loadStorePacks = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getStickerStore();
      if (response.success) {
        setPacks(response.packs || []);
      }
    } catch (error) {
      console.error('Error loading sticker store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPack = async (packId: string) => {
    try {
      setAddingPack(packId);
      const response = await chatApi.addStickerPack(packId);
      if (response.success) {
        onPackAdded();
      }
    } catch (error) {
      console.error('Error adding pack:', error);
    } finally {
      setAddingPack(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.storeContainer}>
        {/* Header */}
        <View style={styles.storeHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.storeTitle}>Sticker Store</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={packs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.storePackItem}>
                <View style={styles.storePackInfo}>
                  {item.thumbnailUrl ? (
                    <Image
                      source={{ uri: item.thumbnailUrl }}
                      style={styles.storePackThumbnail}
                    />
                  ) : (
                    <View style={styles.storePackPlaceholder}>
                      <Text style={styles.storePackPlaceholderText}>
                        {item.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.storePackDetails}>
                    <Text style={styles.storePackName}>{item.name}</Text>
                    <Text style={styles.storePackCount}>
                      {item.stickers?.length || 0} stickers
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.addPackButton}
                  onPress={() => handleAddPack(item.id)}
                  disabled={addingPack === item.id}
                >
                  {addingPack === item.id ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Ionicons name="add" size={24} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.storeList}
          />
        )}
      </View>
    </Modal>
  );
};

// Sticker message bubble
interface StickerMessageProps {
  sticker: Sticker;
  isSentByMe: boolean;
}

export const StickerMessage: React.FC<StickerMessageProps> = ({
  sticker,
  isSentByMe,
}) => {
  return (
    <View style={[styles.stickerMessage, isSentByMe && styles.stickerMessageSent]}>
      <Image
        source={{ uri: sticker.fileUrl }}
        style={styles.stickerMessageImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  packTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  packTabsContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  packTab: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  packTabActive: {
    backgroundColor: '#EFF6FF',
  },
  packThumbnail: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  packPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickersGrid: {
    padding: 8,
  },
  stickerItem: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    padding: 8,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  // Store
  storeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  storeList: {
    padding: 16,
  },
  storePackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  storePackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storePackThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  storePackPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storePackPlaceholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
  },
  storePackDetails: {
    marginLeft: 12,
  },
  storePackName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  storePackCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addPackButton: {
    padding: 8,
  },
  // Sticker message
  stickerMessage: {
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  stickerMessageSent: {
    alignSelf: 'flex-end',
  },
  stickerMessageImage: {
    width: 150,
    height: 150,
  },
});

export default StickerPicker;
