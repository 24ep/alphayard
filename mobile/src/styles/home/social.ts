import { StyleSheet } from 'react-native';

export const socialStyles = StyleSheet.create({
    // Social Posts Container
    socialPostsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    socialPostCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Generic Post Styles
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    postAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    postAuthorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    postAuthorInfo: {
        flex: 1,
    },
    postAuthorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postAuthorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    postTimestamp: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    postMoreButton: {
        padding: 4,
    },
    postContent: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 12,
    },
    postMedia: {
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    postVideo: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    postLocationText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    postTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    postTag: {
        fontSize: 12,
        color: '#4F46E5',
        marginRight: 8,
        marginBottom: 4,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    postAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    postActionText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 4,
    },

    // Legacy/Alternative Social Post Styles
    socialPost: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postAvatar: { // Overlap with postAuthorAvatar maybe?
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    postUserInfo: {
        flex: 1,
    },
    postUserName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    postTimeAgo: {
        fontSize: 12,
        color: '#6B7280',
    },
    postMenuButton: {
        padding: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    actionText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 4,
    },
    socialPostSeparator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },

    // Specific Social Post List Styles (Legacy/Specific)
    socialPostListItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    socialPostHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    socialPostAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    socialPostAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFB6C1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    socialPostAvatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    socialPostAuthorInfo: {
        flex: 1,
    },
    socialPostAuthorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    socialPostAuthorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    socialPostTimestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    socialPostMoreButton: {
        padding: 4,
    },
    socialPostContent: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 12,
    },
    socialPostMedia: {
        marginBottom: 12,
    },
    socialPostMediaPlaceholder: {
        height: 200,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    socialPostMediaText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    socialPostActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    socialPostAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    socialPostActionText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    socialPostDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginTop: 16,
    },

    // Comment Drawer Styles
    commentDrawerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    commentDrawer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        minHeight: '60%',
    },
    commentDrawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    commentDrawerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    commentDrawerCloseButton: {
        padding: 4,
    },
    commentList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    commentItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFB6C1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    commentAvatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentAuthorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginRight: 8,
    },
    commentTimestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    commentText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 18,
    },

    // Inline Links in Comments
    commentInlineLink: {
        color: '#3B82F6',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },

    // Comment Image Preview
    commentImageContainer: {
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    commentImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
    },

    // Comment Attachments
    commentAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    commentAttachmentPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    commentAttachmentInfo: {
        marginLeft: 8,
    },
    commentAttachmentText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    commentAttachmentSize: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    commentAttachmentButton: {
        padding: 4,
        marginLeft: 8,
    },

    addCommentSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 0,
        borderTopColor: 'transparent',
        backgroundColor: 'transparent',
    },
    addCommentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    addCommentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#374151',
        backgroundColor: '#FFFFFF',
        maxHeight: 100,
    },
    attachmentButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addCommentButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFB6C1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },

    // Attachment Preview Styles
    attachmentPreview: {
        marginBottom: 12,
    },
    attachmentPreviewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F0F9FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    attachmentPreviewImage: {
        width: 30,
        height: 30,
        borderRadius: 4,
    },
    attachmentPreviewText: {
        fontSize: 13,
        color: '#3B82F6',
        marginLeft: 8,
        flex: 1,
    },
    attachmentRemoveButton: {
        padding: 4,
        marginLeft: 8,
    },

    // Create Post Modal
    createPostModal: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: 24,
        margin: 24,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: 'rgba(255, 182, 193, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    postInput: {
        borderWidth: 1,
        borderColor: 'rgba(255, 182, 193, 0.2)',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#374151',
        textAlignVertical: 'top',
        minHeight: 100,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 182, 193, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },

    // Report Modal Styles
    reportOptionsContainer: {
        gap: 8,
    },
    reportOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    reportOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reportOptionContent: {
        flex: 1,
    },
    reportOptionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    reportOptionDescription: {
        fontSize: 14,
        color: '#6B7280',
    },

    // Floating Create Post Button
    floatingCreatePostButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
