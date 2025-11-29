import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface CommentAttachment {
  id: string;
  name: string;
  type: string;
}

interface CommentDrawerProps {
  visible: boolean;
  onClose: () => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  commentAttachments: CommentAttachment[];
  onAddAttachment: () => void;
  onRemoveAttachment: (id: string) => void;
  onAddComment: () => void;
  onLinkPress: (url: string) => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  visible,
  onClose,
  newComment,
  setNewComment,
  commentAttachments,
  onAddAttachment,
  onRemoveAttachment,
  onAddComment,
  onLinkPress,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={homeStyles.commentDrawerOverlay}>
        <View style={homeStyles.commentDrawer}>
          {/* Comment Drawer Header */}
          <View style={homeStyles.commentDrawerHeader}>
            <Text style={homeStyles.commentDrawerTitle}>Comments</Text>
            <TouchableOpacity
              style={homeStyles.commentDrawerCloseButton}
              onPress={onClose}
            >
              <IconMC name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={homeStyles.commentList}>
            {/* Mock Comments with Links and Attachments */}
            <View style={homeStyles.commentItem}>
              <View style={homeStyles.commentAvatar}>
                <Text style={homeStyles.commentAvatarText}>J</Text>
              </View>
              <View style={homeStyles.commentContent}>
                <View style={homeStyles.commentHeader}>
                  <Text style={homeStyles.commentAuthorName}>John Doe</Text>
                  <Text style={homeStyles.commentTimestamp}>2 hours ago</Text>
                </View>
                <Text style={homeStyles.commentText}>Great post! Love the hourse dinner idea</Text>
              </View>
            </View>

            <View style={homeStyles.commentItem}>
              <View style={homeStyles.commentAvatar}>
                <Text style={homeStyles.commentAvatarText}>J</Text>
              </View>
              <View style={homeStyles.commentContent}>
                <View style={homeStyles.commentHeader}>
                  <Text style={homeStyles.commentAuthorName}>Jane Smith</Text>
                  <Text style={homeStyles.commentTimestamp}>1 hour ago</Text>
                </View>
                <Text style={homeStyles.commentText}>
                  Can you share the recipe? 😊 Check out this recipe:
                  <Text
                    style={homeStyles.commentInlineLink}
                    onPress={() => onLinkPress('https://example.com/recipe')}
                  >
                    https://example.com/recipe
                  </Text>
                </Text>
              </View>
            </View>

            <View style={homeStyles.commentItem}>
              <View style={homeStyles.commentAvatar}>
                <Text style={homeStyles.commentAvatarText}>M</Text>
              </View>
              <View style={homeStyles.commentContent}>
                <View style={homeStyles.commentHeader}>
                  <Text style={homeStyles.commentAuthorName}>Mike Johnson</Text>
                  <Text style={homeStyles.commentTimestamp}>30 min ago</Text>
                </View>
                <Text style={homeStyles.commentText}>hourse time is the best time! 👨‍👩‍👧‍👦</Text>

                {/* Image Preview */}
                <View style={homeStyles.commentImageContainer}>
                  <Image
                    source={{ uri: 'https://via.placeholder.com/200x150/FFB6C1/FFFFFF?text=hourse+Photo' }}
                    style={homeStyles.commentImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            <View style={homeStyles.commentItem}>
              <View style={homeStyles.commentAvatar}>
                <Text style={homeStyles.commentAvatarText}>S</Text>
              </View>
              <View style={homeStyles.commentContent}>
                <View style={homeStyles.commentHeader}>
                  <Text style={homeStyles.commentAuthorName}>Sarah Wilson</Text>
                  <Text style={homeStyles.commentTimestamp}>15 min ago</Text>
                </View>
                <Text style={homeStyles.commentText}>
                  Here's a helpful article about hourse bonding:
                  <Text
                    style={homeStyles.commentInlineLink}
                    onPress={() => onLinkPress('https://familytips.com/bonding')}
                  >
                    https://familytips.com/bonding
                  </Text>
                </Text>

                {/* Document Attachment */}
                <View style={homeStyles.commentAttachment}>
                  <View style={homeStyles.commentAttachmentPreview}>
                    <IconMC name="file-document" size={24} color="#9CA3AF" />
                    <View style={homeStyles.commentAttachmentInfo}>
                      <Text style={homeStyles.commentAttachmentText}>family_activities.pdf</Text>
                      <Text style={homeStyles.commentAttachmentSize}>2.3 MB</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={homeStyles.commentAttachmentButton}>
                    <IconMC name="download" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Add Comment Section */}
          <View style={homeStyles.addCommentSection}>
            {/* Attachment Preview */}
            {commentAttachments.length > 0 && (
              <View style={homeStyles.attachmentPreview}>
                {commentAttachments.map((attachment) => (
                  <View key={attachment.id} style={homeStyles.attachmentPreviewItem}>
                    {attachment.type === 'image' ? (
                      <Image
                        source={{ uri: 'https://via.placeholder.com/60x60/FFB6C1/FFFFFF?text=IMG' }}
                        style={homeStyles.attachmentPreviewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <IconMC
                        name="file-document"
                        size={20}
                        color="#9CA3AF"
                      />
                    )}
                    <Text style={homeStyles.attachmentPreviewText}>{attachment.name}</Text>
                    <TouchableOpacity
                      style={homeStyles.attachmentRemoveButton}
                      onPress={() => onRemoveAttachment(attachment.id)}
                    >
                      <IconMC name="close" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={homeStyles.addCommentInputContainer}>
              <TextInput
                style={homeStyles.addCommentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />

              {/* Attachment Button */}
              <TouchableOpacity
                style={homeStyles.attachmentButton}
                onPress={onAddAttachment}
              >
                <IconMC name="paperclip" size={20} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={homeStyles.addCommentButton}
                onPress={onAddComment}
              >
                <IconMC name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
