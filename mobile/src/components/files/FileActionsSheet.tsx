import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    Platform,
    Pressable,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FileItem, FileFolder } from '../../services/api/fileManagement';

interface ActionItem {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
    destructive?: boolean;
}

interface FileActionsSheetProps {
    visible: boolean;
    item: FileItem | FileFolder | null;
    isFolder?: boolean;
    onClose: () => void;
    onPreview?: () => void;
    onRename?: () => void;
    onMove?: () => void;
    onCopy?: () => void;
    onShare?: () => void;
    onDownload?: () => void;
    onFavorite?: () => void;
    onInfo?: () => void;
    onDelete?: () => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string, fileType: string): string => {
    if (fileType === 'image' || mimeType?.startsWith('image/')) return 'file-image-outline';
    if (fileType === 'video' || mimeType?.startsWith('video/')) return 'file-video-outline';
    if (fileType === 'audio' || mimeType?.startsWith('audio/')) return 'file-music-outline';
    if (fileType === 'document' || mimeType?.includes('pdf')) return 'file-pdf-box';
    if (mimeType?.includes('word')) return 'file-word-outline';
    if (mimeType?.includes('excel')) return 'file-excel-outline';
    return 'file-outline';
};

export const FileActionsSheet: React.FC<FileActionsSheetProps> = ({
    visible,
    item,
    isFolder = false,
    onClose,
    onPreview,
    onRename,
    onMove,
    onCopy,
    onShare,
    onDownload,
    onFavorite,
    onInfo,
    onDelete,
}) => {
    if (!item) return null;

    const file = !isFolder ? (item as FileItem) : null;
    const folder = isFolder ? (item as FileFolder) : null;
    const isFavorite = isFolder ? folder?.isFavorite : file?.isFavorite;

    const actions: ActionItem[] = [];

    if (!isFolder && onPreview) {
        actions.push({
            icon: 'eye-outline',
            label: 'Preview',
            onPress: () => { onPreview(); onClose(); },
        });
    }

    if (onRename) {
        actions.push({
            icon: 'pencil-outline',
            label: 'Rename',
            onPress: () => { onRename(); onClose(); },
        });
    }

    if (onMove) {
        actions.push({
            icon: 'folder-move-outline',
            label: 'Move to...',
            onPress: () => { onMove(); onClose(); },
        });
    }

    if (!isFolder && onCopy) {
        actions.push({
            icon: 'content-copy',
            label: 'Make a copy',
            onPress: () => { onCopy(); onClose(); },
        });
    }

    if (onShare) {
        actions.push({
            icon: 'share-variant-outline',
            label: 'Share',
            onPress: () => { onShare(); onClose(); },
        });
    }

    if (!isFolder && onDownload) {
        actions.push({
            icon: 'download-outline',
            label: 'Download',
            onPress: () => { onDownload(); onClose(); },
        });
    }

    if (onFavorite) {
        actions.push({
            icon: isFavorite ? 'star' : 'star-outline',
            label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
            onPress: () => { onFavorite(); onClose(); },
            color: isFavorite ? '#F59E0B' : undefined,
        });
    }

    if (onInfo) {
        actions.push({
            icon: 'information-outline',
            label: 'Details',
            onPress: () => { onInfo(); onClose(); },
        });
    }

    if (onDelete) {
        actions.push({
            icon: 'trash-can-outline',
            label: 'Delete',
            onPress: () => { onDelete(); onClose(); },
            color: '#EF4444',
            destructive: true,
        });
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View />
            </Pressable>
            <View style={styles.sheetContainer}>
                <View style={styles.handle} />
                
                {/* Item Header */}
                <View style={styles.itemHeader}>
                    {isFolder ? (
                        <View style={[styles.folderIcon, { backgroundColor: folder?.color || '#FEF3C7' }]}>
                            <MaterialCommunityIcons name="folder" size={24} color={folder?.color ? '#FFF' : '#F59E0B'} />
                        </View>
                    ) : file?.fileType === 'image' && file.url ? (
                        <Image source={{ uri: file.url }} style={styles.thumbnail} />
                    ) : (
                        <View style={styles.fileIcon}>
                            <MaterialCommunityIcons 
                                name={getFileIcon(file?.mimeType || '', file?.fileType || '') as any} 
                                size={24} 
                                color="#6B7280" 
                            />
                        </View>
                    )}
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                            {isFolder ? folder?.name : file?.originalName}
                        </Text>
                        <Text style={styles.itemMeta}>
                            {isFolder 
                                ? `${folder?.itemCount} items`
                                : formatFileSize(file?.size || 0)
                            }
                        </Text>
                    </View>
                </View>

                {/* Actions List */}
                <View style={styles.actionsList}>
                    {actions.map((action, index) => (
                        <TouchableOpacity
                            key={action.label}
                            style={[
                                styles.actionItem,
                                action.destructive && styles.actionItemDestructive,
                            ]}
                            onPress={action.onPress}
                        >
                            <MaterialCommunityIcons
                                name={action.icon as any}
                                size={22}
                                color={action.color || '#374151'}
                            />
                            <Text style={[
                                styles.actionLabel,
                                action.color && { color: action.color },
                            ]}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    folderIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    itemMeta: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    actionsList: {
        paddingVertical: 8,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 16,
    },
    actionItemDestructive: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginTop: 8,
    },
    actionLabel: {
        fontSize: 16,
        color: '#374151',
    },
    cancelButton: {
        marginHorizontal: 20,
        marginTop: 8,
        paddingVertical: 14,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default FileActionsSheet;
