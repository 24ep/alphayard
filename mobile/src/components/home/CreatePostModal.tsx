import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  newPostContent: string;
  setNewPostContent: (content: string) => void;
  onPost: () => void;
  media?: { type: 'image' | 'video'; uri: string } | null;
  onPickMedia?: (type: 'image' | 'video') => void;
  onClearMedia?: () => void;
  locationLabel?: string | null;
  onPickLocation?: () => void;
  onClearLocation?: () => void;
  loading?: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  newPostContent,
  setNewPostContent,
  onPost,
  media,
  onPickMedia,
  onClearMedia,
  locationLabel,
  onPickLocation,
  onClearLocation,
  loading,
}) => {
  const isPostDisabled = loading || (!newPostContent.trim() && !media);
  console.log('CreatePostModal state:', { loading, contentLength: newPostContent.length, isPostDisabled });


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={homeStyles.commentDrawerOverlay}
      >
        <View style={[homeStyles.commentDrawer, { padding: 25, paddingBottom: 45 }]}>
          <View style={homeStyles.commentDrawerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={onClose} style={{ marginRight: 15 }}>
                <CoolIcon name="close" size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Create Post</Text>
            </View>
            <TouchableOpacity
              style={[
                { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EF4444' },
                isPostDisabled && { backgroundColor: '#F3F4F6' }
              ]}
              onPress={onPost}
              disabled={isPostDisabled}
            >
              <Text style={{ color: isPostDisabled ? '#9CA3AF' : '#FFF', fontWeight: '600', fontSize: 14 }}>Post</Text>
            </TouchableOpacity>
          </View>

          {/* Use Info & Privacy */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 10 }} />
            <View>
              <Text style={{ fontWeight: '600', color: '#374151' }}>You</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <CoolIcon name="earth" size={12} color="#6B7280" />
                <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>Public</Text>
                <CoolIcon name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={{ fontSize: 16, color: '#374151', minHeight: 120, textAlignVertical: 'top' }}
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            editable={!loading}
          />

          {/* Media Preview */}
          {!!media && (
            <View style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
              {media.type === 'image' ? (
                <Image source={{ uri: media.uri }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
              ) : (
                <View style={{ width: '100%', height: 200, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                  <CoolIcon name="play-circle" size={48} color="#FFF" />
                </View>
              )}
              <TouchableOpacity
                style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}
                onPress={onClearMedia}
                disabled={loading}
              >
                <CoolIcon name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Location Preview */}
          {!!locationLabel && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 8, borderRadius: 8, marginTop: 12, alignSelf: 'flex-start' }}>
              <CoolIcon name="map-marker" size={16} color="#3B82F6" />
              <Text style={{ color: '#2563EB', fontSize: 13, marginLeft: 4, maxWidth: 200 }} numberOfLines={1}>{locationLabel}</Text>
              <TouchableOpacity onPress={onClearLocation} style={{ marginLeft: 8 }}>
                <CoolIcon name="close" size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Toolbar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Add to your post</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => onPickMedia && onPickMedia('image')} disabled={loading}>
                <CoolIcon name="image" size={24} color="#10B981" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPickMedia && onPickMedia('video')} disabled={loading}>
                <CoolIcon name="video" size={24} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onPickLocation} disabled={loading}>
                <CoolIcon name="map-marker" size={24} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity disabled={loading}>
                <CoolIcon name="account-tag" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
