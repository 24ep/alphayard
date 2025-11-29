import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
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
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={homeStyles.commentDrawerOverlay}>
        <View style={homeStyles.commentDrawer}>
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
          />
          {/* Attachments Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <TouchableOpacity
              style={homeStyles.attachmentButton}
              onPress={onPickImage}
              disabled={!onPickImage}
            >
              <CoolIcon name="image-plus" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.attachmentButton}
              onPress={onPickLocation}
              disabled={!onPickLocation}
            >
              <CoolIcon name="map-marker" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {/* Image Preview */}
          {!!imageUri && (
            <View style={homeStyles.commentImageContainer}>
              <Image source={{ uri: imageUri }} style={homeStyles.commentImage} />
              <View style={{ position: 'absolute', top: 8, right: 8 }}>
                <TouchableOpacity style={homeStyles.commentAttachmentButton} onPress={onClearImage}>
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
              <TouchableOpacity style={homeStyles.commentAttachmentButton} onPress={onClearLocation}>
                <CoolIcon name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          <View style={homeStyles.modalActions}>
            <TouchableOpacity
              style={[homeStyles.modalCancelButton, { flex: 0 }]}
              onPress={onClose}
            >
              <Text style={homeStyles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[homeStyles.modalPostButton, { flex: 0 }]}
              onPress={onPost}
            >
              <Text style={homeStyles.modalSaveText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
