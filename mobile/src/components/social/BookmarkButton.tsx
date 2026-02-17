import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialApi } from '../../services/api/social';

interface BookmarkButtonProps {
  postId: string;
  isBookmarked?: boolean;
  size?: 'small' | 'medium' | 'large';
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  postId,
  isBookmarked: initialBookmarked = false,
  size = 'medium',
  onBookmarkChange,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);

  const handleToggleBookmark = async () => {
    try {
      setLoading(true);
      
      if (isBookmarked) {
        const response = await socialApi.removeBookmark(postId);
        if (response.success) {
          setIsBookmarked(false);
          onBookmarkChange?.(false);
        }
      } else {
        const response = await socialApi.bookmarkPost(postId);
        if (response.success) {
          setIsBookmarked(true);
          onBookmarkChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = () => {
    setShowCollectionPicker(true);
  };

  const iconSize = size === 'small' ? 18 : size === 'large' ? 28 : 22;

  return (
    <>
      <TouchableOpacity
        onPress={handleToggleBookmark}
        onLongPress={handleLongPress}
        disabled={loading}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={iconSize}
            color={isBookmarked ? '#3B82F6' : '#6B7280'}
          />
        )}
      </TouchableOpacity>

      <CollectionPickerModal
        visible={showCollectionPicker}
        postId={postId}
        onClose={() => setShowCollectionPicker(false)}
        onSave={(collectionName) => {
          setIsBookmarked(true);
          onBookmarkChange?.(true);
          setShowCollectionPicker(false);
        }}
      />
    </>
  );
};

// Collection Picker Modal
interface CollectionPickerModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
  onSave: (collectionName: string) => void;
}

const CollectionPickerModal: React.FC<CollectionPickerModalProps> = ({
  visible,
  postId,
  onClose,
  onSave,
}) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await socialApi.getBookmarkCollections();
      if (response.success) {
        setCollections(response.collections || []);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCollection = async (collectionName: string) => {
    try {
      setSaving(true);
      const response = await socialApi.bookmarkPost(postId, { collectionName });
      if (response.success) {
        onSave(collectionName);
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      setSaving(true);
      const createResponse = await socialApi.createBookmarkCollection({
        name: newCollectionName.trim(),
      });
      
      if (createResponse.success) {
        await handleSelectCollection(newCollectionName.trim());
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setSaving(false);
      setNewCollectionName('');
      setShowCreateNew(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save to Collection</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <>
              {/* Collections List */}
              <FlatList
                data={[{ id: 'saved', name: 'Saved', isDefault: true }, ...collections]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.collectionItem}
                    onPress={() => handleSelectCollection(item.name)}
                    disabled={saving}
                  >
                    <View style={styles.collectionIcon}>
                      <Ionicons
                        name={item.isDefault ? 'bookmark' : 'folder'}
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                    <View style={styles.collectionInfo}>
                      <Text style={styles.collectionName}>{item.name}</Text>
                      {item.itemsCount !== undefined && (
                        <Text style={styles.collectionCount}>
                          {item.itemsCount} items
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
                style={styles.collectionsList}
              />

              {/* Create New Collection */}
              {showCreateNew ? (
                <View style={styles.createNewContainer}>
                  <TextInput
                    style={styles.newCollectionInput}
                    placeholder="Collection name"
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                    autoFocus
                  />
                  <View style={styles.createNewActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowCreateNew(false);
                        setNewCollectionName('');
                      }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={handleCreateCollection}
                      disabled={saving || !newCollectionName.trim()}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.createText}>Create</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={() => setShowCreateNew(true)}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
                  <Text style={styles.addNewText}>Create New Collection</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Bookmarks List Screen Component
interface BookmarksListProps {
  collectionName?: string;
  onPostPress?: (postId: string) => void;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({
  collectionName,
  onPostPress,
}) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, [collectionName]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await socialApi.getBookmarks({ collectionName });
      if (response.success) {
        setBookmarks(response.bookmarks || []);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const handleRemoveBookmark = async (postId: string) => {
    try {
      const response = await socialApi.removeBookmark(postId);
      if (response.success) {
        setBookmarks(bookmarks.filter(b => b.postId !== postId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No saved posts</Text>
        <Text style={styles.emptyText}>
          Save posts to view them later
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.bookmarkItem}
          onPress={() => onPostPress?.(item.postId)}
        >
          <View style={styles.bookmarkContent}>
            <Text style={styles.bookmarkText} numberOfLines={2}>
              {item.post?.content || 'Post content'}
            </Text>
            <Text style={styles.bookmarkDate}>
              Saved {formatDate(item.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveBookmark(item.postId)}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.listContent}
    />
  );
};

// Helper function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString();
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  collectionsList: {
    maxHeight: 300,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  collectionCount: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addNewText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  createNewContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  newCollectionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  createNewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  createText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Bookmarks List styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  bookmarkItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookmarkContent: {
    flex: 1,
  },
  bookmarkText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  removeButton: {
    padding: 4,
  },
});

export default BookmarkButton;
