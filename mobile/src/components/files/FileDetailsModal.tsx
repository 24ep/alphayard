import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FileItem, FileTag, FileShare, fileManagementApi } from '../../services/api/fileManagement';

interface FileDetailsModalProps {
    visible: boolean;
    file: FileItem | null;
    onClose: () => void;
    onUpdate?: () => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
    visible,
    file,
    onClose,
    onUpdate,
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'tags' | 'sharing'>('details');
    const [tags, setTags] = useState<FileTag[]>([]);
    const [shares, setShares] = useState<FileShare[]>([]);
    const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [showAddTag, setShowAddTag] = useState(false);

    useEffect(() => {
        if (visible && file) {
            loadData();
        }
    }, [visible, file]);

    const loadData = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const [tagsRes, sharesRes, availableTagsRes] = await Promise.all([
                Promise.resolve({ success: true, tags: file.tags || [] }),
                fileManagementApi.getFileShares(file.id),
                fileManagementApi.getTags(),
            ]);

            setTags(tagsRes.tags || []);
            if (sharesRes.success) setShares(sharesRes.shares);
            if (availableTagsRes.success) setAvailableTags(availableTagsRes.tags);
        } catch (error) {
            console.error('Error loading file details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = async (tagId: string) => {
        if (!file) return;
        try {
            await fileManagementApi.assignTag(file.id, tagId);
            loadData();
            onUpdate?.();
        } catch (error) {
            console.error('Error adding tag:', error);
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        if (!file) return;
        try {
            await fileManagementApi.removeTag(file.id, tagId);
            loadData();
            onUpdate?.();
        } catch (error) {
            console.error('Error removing tag:', error);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const result = await fileManagementApi.createTag(newTagName.trim(), randomColor);
            if (result.success) {
                setNewTagName('');
                setShowAddTag(false);
                loadData();
                // Auto-assign to current file
                await fileManagementApi.assignTag(file!.id, result.tag.id);
                loadData();
                onUpdate?.();
            }
        } catch (error) {
            console.error('Error creating tag:', error);
        }
    };

    const handleCreateShareLink = async () => {
        if (!file) return;
        try {
            const result = await fileManagementApi.createShareLink(file.id);
            if (result.success) {
                loadData();
                Alert.alert('Share Link Created', 'A share link has been created for this file.');
            }
        } catch (error) {
            console.error('Error creating share link:', error);
        }
    };

    const handleRemoveShare = async (shareId: string) => {
        try {
            await fileManagementApi.removeShare(shareId);
            loadData();
        } catch (error) {
            console.error('Error removing share:', error);
        }
    };

    if (!file) return null;

    const renderDetailsTab = () => (
        <ScrollView style={styles.tabContent}>
            {/* File Preview */}
            <View style={styles.previewSection}>
                {file.fileType === 'image' && file.url ? (
                    <Image source={{ uri: file.url }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                    <View style={styles.previewIcon}>
                        <MaterialCommunityIcons name="file-document-outline" size={48} color="#6B7280" />
                    </View>
                )}
            </View>

            {/* File Info */}
            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{file.originalName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Type</Text>
                    <Text style={styles.infoValue}>{file.mimeType || file.fileType}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Size</Text>
                    <Text style={styles.infoValue}>{formatFileSize(file.size)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Created</Text>
                    <Text style={styles.infoValue}>{formatDate(file.createdAt)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Modified</Text>
                    <Text style={styles.infoValue}>{formatDate(file.updatedAt)}</Text>
                </View>
                {file.uploaderName && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Uploaded by</Text>
                        <Text style={styles.infoValue}>{file.uploaderName}</Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Views</Text>
                    <Text style={styles.infoValue}>{file.viewCount || 0}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Downloads</Text>
                    <Text style={styles.infoValue}>{file.downloadCount || 0}</Text>
                </View>
            </View>

            {/* Description */}
            {file.description && (
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{file.description}</Text>
                </View>
            )}
        </ScrollView>
    );

    const renderTagsTab = () => (
        <ScrollView style={styles.tabContent}>
            {/* Current Tags */}
            <View style={styles.tagsSection}>
                <Text style={styles.sectionTitle}>Current Tags</Text>
                {tags.length === 0 ? (
                    <Text style={styles.emptyText}>No tags assigned</Text>
                ) : (
                    <View style={styles.tagsList}>
                        {tags.map(tag => (
                            <View key={tag.id} style={[styles.tag, { backgroundColor: `${tag.color}20` }]}>
                                <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                                <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
                                <TouchableOpacity onPress={() => handleRemoveTag(tag.id)}>
                                    <MaterialCommunityIcons name="close" size={16} color={tag.color} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Add Tags */}
            <View style={styles.addTagSection}>
                <Text style={styles.sectionTitle}>Add Tags</Text>
                
                {showAddTag ? (
                    <View style={styles.newTagRow}>
                        <TextInput
                            style={styles.newTagInput}
                            placeholder="Tag name..."
                            value={newTagName}
                            onChangeText={setNewTagName}
                            autoFocus
                        />
                        <TouchableOpacity style={styles.createTagButton} onPress={handleCreateTag}>
                            <Text style={styles.createTagButtonText}>Create</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowAddTag(false)}>
                            <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.addTagButton} onPress={() => setShowAddTag(true)}>
                        <MaterialCommunityIcons name="plus" size={20} color="#3B82F6" />
                        <Text style={styles.addTagButtonText}>Create New Tag</Text>
                    </TouchableOpacity>
                )}

                {/* Available Tags */}
                <View style={styles.availableTagsList}>
                    {availableTags
                        .filter(t => !tags.find(ct => ct.id === t.id))
                        .map(tag => (
                            <TouchableOpacity 
                                key={tag.id} 
                                style={[styles.availableTag, { borderColor: tag.color }]}
                                onPress={() => handleAddTag(tag.id)}
                            >
                                <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                                <Text style={styles.availableTagText}>{tag.name}</Text>
                                <MaterialCommunityIcons name="plus" size={16} color="#6B7280" />
                            </TouchableOpacity>
                        ))}
                </View>
            </View>
        </ScrollView>
    );

    const renderSharingTab = () => (
        <ScrollView style={styles.tabContent}>
            {/* Share Actions */}
            <View style={styles.shareActions}>
                <TouchableOpacity style={styles.shareActionButton} onPress={handleCreateShareLink}>
                    <MaterialCommunityIcons name="link-variant" size={24} color="#3B82F6" />
                    <Text style={styles.shareActionText}>Create Share Link</Text>
                </TouchableOpacity>
            </View>

            {/* Current Shares */}
            <View style={styles.sharesSection}>
                <Text style={styles.sectionTitle}>Shared With</Text>
                {shares.length === 0 ? (
                    <Text style={styles.emptyText}>Not shared with anyone</Text>
                ) : (
                    shares.map(share => (
                        <View key={share.id} style={styles.shareItem}>
                            <View style={styles.shareInfo}>
                                {share.shareLink ? (
                                    <>
                                        <MaterialCommunityIcons name="link-variant" size={20} color="#6B7280" />
                                        <View style={styles.shareDetails}>
                                            <Text style={styles.shareText}>Share Link</Text>
                                            <Text style={styles.shareMeta}>
                                                {share.permission} · {share.downloadCount} downloads
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="account" size={20} color="#6B7280" />
                                        <View style={styles.shareDetails}>
                                            <Text style={styles.shareText}>
                                                {share.sharedWithUserId || share.sharedWithCircleId}
                                            </Text>
                                            <Text style={styles.shareMeta}>{share.permission}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveShare(share.id)}>
                                <MaterialCommunityIcons name="close" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>File Details</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabs}>
                        {(['details', 'tags', 'sharing'] as const).map(tab => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.tabActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : (
                        <>
                            {activeTab === 'details' && renderDetailsTab()}
                            {activeTab === 'tags' && renderTagsTab()}
                            {activeTab === 'sharing' && renderSharingTab()}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#3B82F6',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    tabContent: {
        padding: 20,
        maxHeight: 500,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    previewSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    previewIcon: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoSection: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
        maxWidth: '60%',
        textAlign: 'right',
    },
    descriptionSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    tagsSection: {
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    tagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    tagDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '500',
    },
    addTagSection: {
        marginTop: 8,
    },
    addTagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    addTagButtonText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    newTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    newTagInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
    },
    createTagButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createTagButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    availableTagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    availableTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        gap: 6,
    },
    availableTagText: {
        fontSize: 13,
        color: '#6B7280',
    },
    shareActions: {
        marginBottom: 24,
    },
    shareActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 12,
    },
    shareActionText: {
        fontSize: 15,
        color: '#3B82F6',
        fontWeight: '500',
    },
    sharesSection: {
        marginTop: 8,
    },
    shareItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    shareInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    shareDetails: {
        gap: 2,
    },
    shareText: {
        fontSize: 14,
        color: '#1F2937',
    },
    shareMeta: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default FileDetailsModal;
