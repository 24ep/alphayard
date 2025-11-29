import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface AddPostModalProps {
  visible: boolean;
  onClose: () => void;
  content: string;
  location: string;
  tags: string[];
  tagInput: string;
  onContentChange: (text: string) => void;
  onLocationChange: (text: string) => void;
  onTagInputChange: (text: string) => void;
  onAddTag: () => void;
  onRemoveTag: (index: number) => void;
  onPost: () => void;
}

const AddPostModal: React.FC<AddPostModalProps> = ({
  visible,
  onClose,
  content,
  location,
  tags,
  tagInput,
  onContentChange,
  onLocationChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onPost,
}) => {
  if (!visible) return null;

  return (
    <View style={homeStyles.modalOverlay}>
      <View style={homeStyles.modalContainer}>
        <View style={homeStyles.modalHeader}>
          <Text style={homeStyles.modalTitle}>Create Post</Text>
          <TouchableOpacity onPress={onClose} style={homeStyles.modalCloseButton}>
            <IconMC name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={homeStyles.modalContent}>
          {/* Post Content */}
          <View style={homeStyles.modalSection}>
            <Text style={homeStyles.modalLabel}>What's on your mind?</Text>
            <TextInput
              style={homeStyles.modalTextInput}
              placeholder="Share your thoughts..."
              value={content}
              onChangeText={onContentChange}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Location */}
          <View style={homeStyles.modalSection}>
            <Text style={homeStyles.modalLabel}>Location (optional)</Text>
            <TextInput
              style={homeStyles.modalTextInput}
              placeholder="Where are you?"
              value={location}
              onChangeText={onLocationChange}
            />
          </View>

          {/* Tags */}
          <View style={homeStyles.modalSection}>
            <Text style={homeStyles.modalLabel}>Tags</Text>
            <View style={homeStyles.tagInputContainer}>
              <TextInput
                style={homeStyles.tagInput}
                placeholder="Add a tag..."
                value={tagInput}
                onChangeText={onTagInputChange}
                onSubmitEditing={onAddTag}
              />
              <TouchableOpacity onPress={onAddTag} style={homeStyles.addTagButton}>
                <IconMC name="plus" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View style={homeStyles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={homeStyles.tagChip}>
                    <Text style={homeStyles.tagChipText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => onRemoveTag(index)}>
                      <IconMC name="close" size={16} color="#666666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={homeStyles.modalFooter}>
          <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
            <Text style={homeStyles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPost} style={homeStyles.modalPostButton}>
            <Text style={homeStyles.modalPostText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddPostModal;
