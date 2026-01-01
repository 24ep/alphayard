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
  imageUri?: string | null;
  onPickImage?: () => void;
  onClearImage?: () => void;
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
  imageUri,
  onPickImage,
  onClearImage,
  locationLabel,
  onPickLocation,
  onClearLocation,
  loading,
}) => {
  const isPostDisabled = loading || !newPostContent.trim();
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
            <Text style={homeStyles.commentDrawerTitle}>Create New Post</Text>
            <TouchableOpacity style={homeStyles.commentDrawerCloseButton} onPress={onClose}>
              <CoolIcon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={homeStyles.postInput}
            placeholder="What's happening with your hourse?"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
          {/* Attachments Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <TouchableOpacity
              style={homeStyles.attachmentButton}
              onPress={onPickImage}
              disabled={!onPickImage || loading}
            >
              <CoolIcon name="image-plus" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.attachmentButton}
              onPress={onPickLocation}
              disabled={!onPickLocation || loading}
            >
              <CoolIcon name="map-marker" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          {/* Image Preview */}
          {!!imageUri && (
            <View style={homeStyles.commentImageContainer}>
              <Image source={{ uri: imageUri }} style={homeStyles.commentImage} />
              <View style={{ position: 'absolute', top: 8, right: 8 }}>
                <TouchableOpacity style={homeStyles.commentAttachmentButton} onPress={onClearImage} disabled={loading}>
                  <CoolIcon name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Location Preview */}
          {!!locationLabel && (
            <View style={homeStyles.commentAttachment}>
              <View style={homeStyles.commentAttachmentPreview}>
                <CoolIcon name="map-marker" size={20} color="#3B82F6" />
                <View style={homeStyles.commentAttachmentInfo}>
                  <Text style={homeStyles.commentAttachmentText} numberOfLines={1}>{locationLabel}</Text>
                </View>
              </View>
              <TouchableOpacity style={homeStyles.commentAttachmentButton} onPress={onClearLocation} disabled={loading}>
                <CoolIcon name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          <View style={[homeStyles.modalActions, { gap: 20, marginTop: 10 }]}>
            <TouchableOpacity
              style={[homeStyles.modalCancelButton, { flex: 1, paddingVertical: 14, borderRadius: 25 }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={homeStyles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                homeStyles.modalPostButton,
                { flex: 1, paddingVertical: 14, borderRadius: 25, opacity: isPostDisabled ? 0.6 : 1 }
              ]}
              onPress={onPost}
              disabled={isPostDisabled}
            >
              <Text style={homeStyles.modalSaveText}>{loading ? 'Posting...' : 'Post'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

    </Modal>
  );
};
