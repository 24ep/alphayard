import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    TextInput,
    Alert,
    RefreshControl,
    Animated,
    Platform,
    Share,
    Modal,
    Pressable,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { fileManagementApi, FileItem, FileFolder, StorageQuota } from '../../services/api/fileManagement';
import { FilePreviewModal } from './FilePreviewModal';
import { FileActionsSheet } from './FileActionsSheet';
import { FileDetailsModal } from './FileDetailsModal';
import { MoveFileModal } from './MoveFileModal';
import { CreateFolderModal } from './CreateFolderModal';

// =====================================
// TYPES
// =====================================

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';

interface PersonalFilesTabProps {
    onFilePress?: (file: FileItem) => void;
}

// =====================================
// HELPER FUNCTIONS
// =====================================

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getFileIcon = (mimeType: string, fileType: string): string => {
    if (fileType === 'image' || mimeType?.startsWith('image/')) return 'file-image-outline';
    if (fileType === 'video' || mimeType?.startsWith('video/')) return 'file-video-outline';
    if (fileType === 'audio' || mimeType?.startsWith('audio/')) return 'file-music-outline';
    if (fileType === 'document' || mimeType?.includes('pdf')) return 'file-pdf-box';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return 'file-word-outline';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return 'file-excel-outline';
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return 'file-powerpoint-outline';
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('compressed')) return 'folder-zip-outline';
    return 'file-outline';
};

const getFileIconColor = (fileType: string): string => {
    switch (fileType) {
        case 'image': return '#10B981';
        case 'video': return '#F59E0B';
        case 'audio': return '#8B5CF6';
        case 'document': return '#EF4444';
        default: return '#6B7280';
    }
};

// =====================================
// SUB-COMPONENTS
// =====================================

const FolderItem: React.FC<{
    folder: FileFolder;
    viewMode: ViewMode;
    onPress: () => void;
    onLongPress?: () => void;
}> = ({ folder, viewMode, onPress, onLongPress }) => {
    if (viewMode === 'grid') {
        return (
            <TouchableOpacity 
                style={styles.gridFolderItem} 
                onPress={onPress}
                onLongPress={onLongPress}
            >
                <View style={[styles.folderIconContainer, { backgroundColor: folder.color || '#FEF3C7' }]}>
                    <MaterialCommunityIcons name="folder" size={32} color={folder.color ? '#FFF' : '#F59E0B'} />
                </View>
                <Text style={styles.gridItemName} numberOfLines={1}>{folder.name}</Text>
                <Text style={styles.gridItemMeta}>{folder.itemCount} items</Text>
                {folder.isFavorite && (
                    <MaterialCommunityIcons name="star" size={14} color="#F59E0B" style={styles.favoriteIcon} />
                )}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            style={styles.listFolderItem} 
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <View style={[styles.listFolderIcon, { backgroundColor: folder.color || '#FEF3C7' }]}>
                <MaterialCommunityIcons name="folder" size={24} color={folder.color ? '#FFF' : '#F59E0B'} />
            </View>
            <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{folder.name}</Text>
                <Text style={styles.listItemMeta}>{folder.itemCount} items</Text>
            </View>
            {folder.isFavorite && (
                <MaterialCommunityIcons name="star" size={18} color="#F59E0B" />
            )}
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );
};

const FileItemComponent: React.FC<{
    file: FileItem;
    viewMode: ViewMode;
    onPress: () => void;
    onLongPress?: () => void;
}> = ({ file, viewMode, onPress, onLongPress }) => {
    const iconName = getFileIcon(file.mimeType, file.fileType);
    const iconColor = getFileIconColor(file.fileType);
    const isImage = file.fileType === 'image';

    if (viewMode === 'grid') {
        return (
            <TouchableOpacity 
                style={styles.gridFileItem} 
                onPress={onPress}
                onLongPress={onLongPress}
            >
                {isImage && file.url ? (
                    <Image source={{ uri: file.url }} style={styles.gridImagePreview} resizeMode="cover" />
                ) : (
                    <View style={[styles.gridFileIcon, { backgroundColor: `${iconColor}15` }]}>
                        <MaterialCommunityIcons name={iconName as any} size={32} color={iconColor} />
                    </View>
                )}
                <Text style={styles.gridItemName} numberOfLines={1}>{file.originalName}</Text>
                <Text style={styles.gridItemMeta}>{formatFileSize(file.size)}</Text>
                {file.isFavorite && (
                    <MaterialCommunityIcons name="star" size={14} color="#F59E0B" style={styles.favoriteIcon} />
                )}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            style={styles.listFileItem} 
            onPress={onPress}
            onLongPress={onLongPress}
        >
            {isImage && file.url ? (
                <Image source={{ uri: file.url }} style={styles.listImagePreview} resizeMode="cover" />
            ) : (
                <View style={[styles.listFileIcon, { backgroundColor: `${iconColor}15` }]}>
                    <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
                </View>
            )}
            <View style={styles.listItemInfo}>
                <Text style={styles.listItemName} numberOfLines={1}>{file.originalName}</Text>
                <Text style={styles.listItemMeta}>
                    {formatFileSize(file.size)} · {formatDate(file.createdAt)}
                </Text>
            </View>
            {file.isFavorite && (
                <MaterialCommunityIcons name="star" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
            )}
            <TouchableOpacity style={styles.moreButton}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const QuotaBar: React.FC<{ quota: StorageQuota }> = ({ quota }) => {
    const percentage = quota.percentUsed;
    const barColor = percentage > 90 ? '#EF4444' : percentage > 70 ? '#F59E0B' : '#10B981';

    return (
        <View style={styles.quotaContainer}>
            <View style={styles.quotaHeader}>
                <Text style={styles.quotaLabel}>Storage Used</Text>
                <Text style={styles.quotaText}>
                    {formatFileSize(quota.usedBytes)} / {formatFileSize(quota.quotaBytes)}
                </Text>
            </View>
            <View style={styles.quotaBarBackground}>
                <View style={[styles.quotaBarFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }]} />
            </View>
        </View>
    );
};

const BreadcrumbNav: React.FC<{
    path: FileFolder[];
    onNavigate: (folderId: string | null) => void;
}> = ({ path, onNavigate }) => {
    return (
        <View style={styles.breadcrumbContainer}>
            <TouchableOpacity onPress={() => onNavigate(null)} style={styles.breadcrumbItem}>
                <MaterialCommunityIcons name="home" size={18} color="#6B7280" />
            </TouchableOpacity>
            {path.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <MaterialCommunityIcons name="chevron-right" size={16} color="#D1D5DB" />
                    <TouchableOpacity 
                        onPress={() => onNavigate(folder.id)} 
                        style={styles.breadcrumbItem}
                    >
                        <Text style={[
                            styles.breadcrumbText,
                            index === path.length - 1 && styles.breadcrumbTextActive
                        ]}>
                            {folder.name}
                        </Text>
                    </TouchableOpacity>
                </React.Fragment>
            ))}
        </View>
    );
};

// =====================================
// MAIN COMPONENT
// =====================================

type FilterMode = 'all' | 'recent' | 'favorites' | 'images' | 'videos' | 'documents' | 'audio';

export const PersonalFilesTab: React.FC<PersonalFilesTabProps> = ({ onFilePress }) => {
    // Basic state
    const [folders, setFolders] = useState<FileFolder[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
    const [favoriteFiles, setFavoriteFiles] = useState<FileItem[]>([]);
    const [quota, setQuota] = useState<StorageQuota | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [folderPath, setFolderPath] = useState<FileFolder[]>([]);
    const [filterMode, setFilterMode] = useState<FilterMode>('all');

    // Modal/Sheet state
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showActionsSheet, setShowActionsSheet] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);

    // Selected item state
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<FileFolder | null>(null);
    
    // Multi-select state
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const loadData = useCallback(async () => {
        try {
            // Build file type filter
            let fileType: string | undefined;
            if (filterMode === 'images') fileType = 'image';
            else if (filterMode === 'videos') fileType = 'video';
            else if (filterMode === 'documents') fileType = 'document';
            else if (filterMode === 'audio') fileType = 'audio';

            // Only load folders/files for normal view
            if (filterMode === 'all' || ['images', 'videos', 'documents', 'audio'].includes(filterMode)) {
                const [foldersRes, filesRes, quotaRes] = await Promise.all([
                    filterMode === 'all' ? fileManagementApi.getFolders(currentFolderId || undefined) : Promise.resolve({ success: true, folders: [] }),
                    fileManagementApi.getFiles({
                        folderId: filterMode === 'all' ? (currentFolderId || undefined) : undefined,
                        search: searchQuery || undefined,
                        sortBy: sortBy === 'name' ? 'original_name' : sortBy === 'date' ? 'created_at' : sortBy === 'type' ? 'file_type' : 'size',
                        sortOrder: sortBy === 'name' ? 'asc' : 'desc',
                        fileType,
                    }),
                    fileManagementApi.getStorageQuota(),
                ]);

                if (foldersRes.success) setFolders(foldersRes.folders);
                if (filesRes.success) setFiles(filesRes.files);
                if (quotaRes.success) setQuota(quotaRes.quota);
            }

            // Load recent files
            if (filterMode === 'recent') {
                const recentRes = await fileManagementApi.getRecentFiles(20);
                if (recentRes.success) setRecentFiles(recentRes.files);
                setFolders([]);
                setFiles([]);
            }

            // Load favorites
            if (filterMode === 'favorites') {
                const favRes = await fileManagementApi.getFavoriteFiles();
                if (favRes.success) setFavoriteFiles(favRes.files);
                setFolders([]);
                setFiles([]);
            }

            // Load folder path for breadcrumb
            if (currentFolderId && filterMode === 'all') {
                const pathRes = await fileManagementApi.getFolderPath(currentFolderId);
                if (pathRes.success) setFolderPath(pathRes.path);
            } else {
                setFolderPath([]);
            }
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentFolderId, searchQuery, sortBy, filterMode]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleFolderPress = (folder: FileFolder) => {
        if (multiSelectMode) {
            toggleItemSelection(`folder-${folder.id}`);
            return;
        }
        setCurrentFolderId(folder.id);
    };

    const handleFolderLongPress = (folder: FileFolder) => {
        setSelectedFolder(folder);
        setSelectedFile(null);
        setShowActionsSheet(true);
    };

    const handleFilePress = (file: FileItem) => {
        if (multiSelectMode) {
            toggleItemSelection(`file-${file.id}`);
            return;
        }
        setSelectedFile(file);
        setShowPreviewModal(true);
        onFilePress?.(file);
    };

    const handleFileLongPress = (file: FileItem) => {
        setSelectedFile(file);
        setSelectedFolder(null);
        setShowActionsSheet(true);
    };

    const handleNavigateBreadcrumb = (folderId: string | null) => {
        setCurrentFolderId(folderId);
    };

    // Multi-select handlers
    const toggleItemSelection = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
        
        // Exit multi-select mode if no items selected
        if (newSelected.size === 0) {
            setMultiSelectMode(false);
        }
    };

    const handleSelectAll = () => {
        const allIds = new Set<string>();
        folders.forEach(f => allIds.add(`folder-${f.id}`));
        files.forEach(f => allIds.add(`file-${f.id}`));
        setSelectedItems(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedItems(new Set());
        setMultiSelectMode(false);
    };

    const handleBatchDelete = () => {
        Alert.alert(
            'Delete Selected',
            `Are you sure you want to delete ${selectedItems.size} items?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const deletePromises: Promise<any>[] = [];
                            selectedItems.forEach(itemId => {
                                if (itemId.startsWith('file-')) {
                                    deletePromises.push(fileManagementApi.deleteFile(itemId.replace('file-', '')));
                                } else if (itemId.startsWith('folder-')) {
                                    deletePromises.push(fileManagementApi.deleteFolder(itemId.replace('folder-', '')));
                                }
                            });
                            await Promise.all(deletePromises);
                            setSelectedItems(new Set());
                            setMultiSelectMode(false);
                            loadData();
                        } catch (error) {
                            console.error('Error deleting items:', error);
                            Alert.alert('Error', 'Failed to delete some items');
                        }
                    },
                },
            ]
        );
    };

    // File operations
    const handleToggleFavorite = async (file: FileItem) => {
        try {
            await fileManagementApi.toggleFileFavorite(file.id, !file.isFavorite);
            loadData();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleToggleFolderFavorite = async (folder: FileFolder) => {
        try {
            await fileManagementApi.toggleFolderFavorite(folder.id, !folder.isFavorite);
            loadData();
        } catch (error) {
            console.error('Error toggling folder favorite:', error);
        }
    };

    const handleDeleteFile = (file: FileItem) => {
        Alert.alert(
            'Delete File',
            `Are you sure you want to delete "${file.originalName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await fileManagementApi.deleteFile(file.id);
                            setShowActionsSheet(false);
                            loadData();
                        } catch (error) {
                            console.error('Error deleting file:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteFolder = (folder: FileFolder) => {
        Alert.alert(
            'Delete Folder',
            `Are you sure you want to delete "${folder.name}" and all its contents?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await fileManagementApi.deleteFolder(folder.id);
                            setShowActionsSheet(false);
                            loadData();
                        } catch (error) {
                            console.error('Error deleting folder:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleRenameFile = (file: FileItem) => {
        Alert.prompt(
            'Rename File',
            'Enter new file name:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Rename',
                    onPress: async (newName) => {
                        if (newName && newName.trim()) {
                            try {
                                await fileManagementApi.updateFile(file.id, { originalName: newName.trim() });
                                setShowActionsSheet(false);
                                loadData();
                            } catch (error) {
                                console.error('Error renaming file:', error);
                            }
                        }
                    },
                },
            ],
            'plain-text',
            file.originalName
        );
    };

    const handleRenameFolder = (folder: FileFolder) => {
        setSelectedFolder(folder);
        setShowActionsSheet(false);
        setShowRenameFolderModal(true);
    };

    const handleMoveFile = (file: FileItem) => {
        setSelectedFile(file);
        setShowActionsSheet(false);
        setShowMoveModal(true);
    };

    const handleMoveFolder = (folder: FileFolder) => {
        setSelectedFolder(folder);
        setSelectedFile(null);
        setShowActionsSheet(false);
        setShowMoveModal(true);
    };

    const handleCopyFile = async (file: FileItem) => {
        try {
            await fileManagementApi.copyFile(file.id, currentFolderId || undefined);
            setShowActionsSheet(false);
            loadData();
            Alert.alert('Success', 'File copied successfully');
        } catch (error) {
            console.error('Error copying file:', error);
            Alert.alert('Error', 'Failed to copy file');
        }
    };

    const handleShareFile = async (file: FileItem) => {
        try {
            // Create share link
            const response = await fileManagementApi.createShareLink(file.id, { 
                permission: 'view' 
            });
            
            if (response.success && response.share) {
                const shareUrl = response.share.url || response.share.shareLink || file.url;
                await Share.share({
                    message: `Check out this file: ${file.originalName}\n${shareUrl}`,
                    url: shareUrl,
                    title: file.originalName,
                });
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            Alert.alert('Error', 'Failed to share file');
        }
        setShowActionsSheet(false);
    };

    const handleDownloadFile = async (file: FileItem) => {
        try {
            // For web, open in new tab; for native, trigger download
            if (Platform.OS === 'web') {
                window.open(file.url, '_blank');
            } else {
                // Native download logic would go here
                Alert.alert('Download', 'Download started');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
        setShowActionsSheet(false);
    };

    const handleShowDetails = (file: FileItem) => {
        setSelectedFile(file);
        setShowActionsSheet(false);
        setShowDetailsModal(true);
    };

    const handleMoveConfirm = async (targetFolderId: string | null) => {
        try {
            if (selectedFile) {
                await fileManagementApi.moveFile(selectedFile.id, targetFolderId || undefined);
            } else if (selectedFolder) {
                await fileManagementApi.moveFolder(selectedFolder.id, targetFolderId || undefined);
            }
            setShowMoveModal(false);
            loadData();
        } catch (error) {
            console.error('Error moving item:', error);
            Alert.alert('Error', 'Failed to move item');
        }
    };

    // Upload handlers
    const handleUploadDocument = async () => {
        try {
            setShowUploadOptions(false);
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
            });

            if (!result.canceled && result.assets) {
                setUploading(true);
                for (const asset of result.assets) {
                    await fileManagementApi.uploadFile({
                        uri: asset.uri,
                        name: asset.name,
                        type: asset.mimeType || 'application/octet-stream',
                    }, currentFolderId || undefined);
                }
                loadData();
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            Alert.alert('Error', 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadImage = async () => {
        try {
            setShowUploadOptions(false);
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant access to your photo library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                setUploading(true);
                for (const asset of result.assets) {
                    const filename = asset.fileName || `image_${Date.now()}.${asset.uri.split('.').pop()}`;
                    await fileManagementApi.uploadFile({
                        uri: asset.uri,
                        name: filename,
                        type: asset.mimeType || 'image/jpeg',
                    }, currentFolderId || undefined);
                }
                loadData();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleTakePhoto = async () => {
        try {
            setShowUploadOptions(false);
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant access to your camera');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setUploading(true);
                const asset = result.assets[0];
                const filename = `photo_${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`;
                await fileManagementApi.uploadFile({
                    uri: asset.uri,
                    name: filename,
                    type: asset.mimeType || 'image/jpeg',
                }, currentFolderId || undefined);
                loadData();
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to capture photo');
        } finally {
            setUploading(false);
        }
    };

    // Folder operations
    const handleCreateFolder = async (name: string, color?: string, icon?: string) => {
        try {
            await fileManagementApi.createFolder({
                name,
                parentId: currentFolderId || undefined,
                color,
                icon,
            });
            setShowCreateFolderModal(false);
            loadData();
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleUpdateFolder = async (name: string, color?: string, icon?: string) => {
        if (!selectedFolder) return;
        try {
            await fileManagementApi.updateFolder(selectedFolder.id, { name, color, icon });
            setShowRenameFolderModal(false);
            setSelectedFolder(null);
            loadData();
        } catch (error) {
            console.error('Error updating folder:', error);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Multi-select header */}
            {multiSelectMode ? (
                <View style={styles.multiSelectHeader}>
                    <TouchableOpacity onPress={handleDeselectAll}>
                        <Text style={styles.multiSelectCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.multiSelectCount}>{selectedItems.size} selected</Text>
                    <View style={styles.multiSelectActions}>
                        <TouchableOpacity onPress={handleSelectAll} style={styles.multiSelectButton}>
                            <MaterialCommunityIcons name="select-all" size={22} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleBatchDelete} style={styles.multiSelectButton}>
                            <MaterialCommunityIcons name="delete-outline" size={22} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search files..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Tabs */}
                    <View style={styles.filterTabs}>
                        {[
                            { mode: 'all' as FilterMode, label: 'All', icon: 'folder-outline' },
                            { mode: 'recent' as FilterMode, label: 'Recent', icon: 'clock-outline' },
                            { mode: 'favorites' as FilterMode, label: 'Favorites', icon: 'star-outline' },
                        ].map(({ mode, label, icon }) => (
                            <TouchableOpacity
                                key={mode}
                                style={[styles.filterTab, filterMode === mode && styles.filterTabActive]}
                                onPress={() => setFilterMode(mode)}
                            >
                                <MaterialCommunityIcons 
                                    name={icon as any} 
                                    size={16} 
                                    color={filterMode === mode ? '#3B82F6' : '#6B7280'} 
                                />
                                <Text style={[styles.filterTabText, filterMode === mode && styles.filterTabTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Actions Row */}
                    <View style={styles.actionsRow}>
                        {/* View Mode Toggle */}
                        <View style={styles.viewModeToggle}>
                            <TouchableOpacity
                                style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
                                onPress={() => setViewMode('grid')}
                            >
                                <MaterialCommunityIcons 
                                    name="view-grid-outline" 
                                    size={18} 
                                    color={viewMode === 'grid' ? '#3B82F6' : '#9CA3AF'} 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
                                onPress={() => setViewMode('list')}
                            >
                                <MaterialCommunityIcons 
                                    name="view-list-outline" 
                                    size={18} 
                                    color={viewMode === 'list' ? '#3B82F6' : '#9CA3AF'} 
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Sort Dropdown */}
                        <TouchableOpacity 
                            style={styles.sortButton}
                            onPress={() => setShowSortDropdown(true)}
                        >
                            <MaterialCommunityIcons name="sort" size={18} color="#6B7280" />
                            <Text style={styles.sortButtonText}>
                                {sortBy === 'name' ? 'Name' : sortBy === 'date' ? 'Date' : sortBy === 'size' ? 'Size' : 'Type'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={16} color="#6B7280" />
                        </TouchableOpacity>

                        {/* Filter by Type */}
                        <TouchableOpacity 
                            style={styles.filterButton}
                            onPress={() => setShowFilterDropdown(true)}
                        >
                            <MaterialCommunityIcons name="filter-variant" size={18} color="#6B7280" />
                        </TouchableOpacity>

                        {/* Multi-select Toggle */}
                        <TouchableOpacity 
                            style={styles.selectButton}
                            onPress={() => setMultiSelectMode(!multiSelectMode)}
                        >
                            <MaterialCommunityIcons name="checkbox-multiple-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>

                        {/* Add Button */}
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => setShowUploadOptions(true)}
                        >
                            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Breadcrumb Navigation */}
            {!multiSelectMode && filterMode === 'all' && (currentFolderId || folderPath.length > 0) && (
                <BreadcrumbNav path={folderPath} onNavigate={handleNavigateBreadcrumb} />
            )}

            {/* Storage Quota */}
            {!multiSelectMode && quota && <QuotaBar quota={quota} />}

            {/* Upload progress indicator */}
            {uploading && (
                <View style={styles.uploadingIndicator}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
            )}
        </View>
    );

    const renderSortDropdown = () => (
        <Modal visible={showSortDropdown} transparent animationType="fade" onRequestClose={() => setShowSortDropdown(false)}>
            <Pressable style={styles.dropdownOverlay} onPress={() => setShowSortDropdown(false)}>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownTitle}>Sort by</Text>
                    {[
                        { value: 'date' as SortBy, label: 'Date Modified', icon: 'clock-outline' },
                        { value: 'name' as SortBy, label: 'Name', icon: 'sort-alphabetical-ascending' },
                        { value: 'size' as SortBy, label: 'Size', icon: 'file-outline' },
                        { value: 'type' as SortBy, label: 'Type', icon: 'file-document-outline' },
                    ].map(({ value, label, icon }) => (
                        <TouchableOpacity
                            key={value}
                            style={[styles.dropdownItem, sortBy === value && styles.dropdownItemActive]}
                            onPress={() => { setSortBy(value); setShowSortDropdown(false); }}
                        >
                            <MaterialCommunityIcons name={icon as any} size={20} color={sortBy === value ? '#3B82F6' : '#6B7280'} />
                            <Text style={[styles.dropdownItemText, sortBy === value && styles.dropdownItemTextActive]}>{label}</Text>
                            {sortBy === value && <MaterialCommunityIcons name="check" size={20} color="#3B82F6" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );

    const renderFilterDropdown = () => (
        <Modal visible={showFilterDropdown} transparent animationType="fade" onRequestClose={() => setShowFilterDropdown(false)}>
            <Pressable style={styles.dropdownOverlay} onPress={() => setShowFilterDropdown(false)}>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownTitle}>Filter by Type</Text>
                    {[
                        { value: 'all' as FilterMode, label: 'All Files', icon: 'file-multiple-outline' },
                        { value: 'images' as FilterMode, label: 'Images', icon: 'image-outline' },
                        { value: 'videos' as FilterMode, label: 'Videos', icon: 'video-outline' },
                        { value: 'documents' as FilterMode, label: 'Documents', icon: 'file-document-outline' },
                        { value: 'audio' as FilterMode, label: 'Audio', icon: 'music-note-outline' },
                    ].map(({ value, label, icon }) => (
                        <TouchableOpacity
                            key={value}
                            style={[styles.dropdownItem, filterMode === value && styles.dropdownItemActive]}
                            onPress={() => { setFilterMode(value); setShowFilterDropdown(false); }}
                        >
                            <MaterialCommunityIcons name={icon as any} size={20} color={filterMode === value ? '#3B82F6' : '#6B7280'} />
                            <Text style={[styles.dropdownItemText, filterMode === value && styles.dropdownItemTextActive]}>{label}</Text>
                            {filterMode === value && <MaterialCommunityIcons name="check" size={20} color="#3B82F6" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );

    const renderUploadOptions = () => (
        <Modal visible={showUploadOptions} transparent animationType="slide" onRequestClose={() => setShowUploadOptions(false)}>
            <Pressable style={styles.dropdownOverlay} onPress={() => setShowUploadOptions(false)}>
                <View style={styles.uploadOptionsContainer}>
                    <View style={styles.uploadOptionsHandle} />
                    <Text style={styles.uploadOptionsTitle}>Add to Files</Text>
                    <View style={styles.uploadOptionsGrid}>
                        <TouchableOpacity style={styles.uploadOption} onPress={handleUploadDocument}>
                            <View style={[styles.uploadOptionIcon, { backgroundColor: '#EFF6FF' }]}>
                                <MaterialCommunityIcons name="file-upload-outline" size={28} color="#3B82F6" />
                            </View>
                            <Text style={styles.uploadOptionText}>Upload File</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadOption} onPress={handleUploadImage}>
                            <View style={[styles.uploadOptionIcon, { backgroundColor: '#F0FDF4' }]}>
                                <MaterialCommunityIcons name="image-outline" size={28} color="#10B981" />
                            </View>
                            <Text style={styles.uploadOptionText}>Photo Library</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadOption} onPress={handleTakePhoto}>
                            <View style={[styles.uploadOptionIcon, { backgroundColor: '#FEF3C7' }]}>
                                <MaterialCommunityIcons name="camera-outline" size={28} color="#F59E0B" />
                            </View>
                            <Text style={styles.uploadOptionText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadOption} onPress={() => { setShowUploadOptions(false); setShowCreateFolderModal(true); }}>
                            <View style={[styles.uploadOptionIcon, { backgroundColor: '#FDF2F8' }]}>
                                <MaterialCommunityIcons name="folder-plus-outline" size={28} color="#EC4899" />
                            </View>
                            <Text style={styles.uploadOptionText}>New Folder</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No files yet</Text>
            <Text style={styles.emptyStateText}>
                Upload files or create folders to get started
            </Text>
            <TouchableOpacity style={styles.emptyStateButton}>
                <MaterialCommunityIcons name="upload" size={20} color="#FFF" />
                <Text style={styles.emptyStateButtonText}>Upload File</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading files...</Text>
            </View>
        );
    }

    // Get the appropriate data based on filter mode
    const getDisplayData = () => {
        if (filterMode === 'recent') {
            return recentFiles.map(f => ({ type: 'file' as const, data: f }));
        }
        if (filterMode === 'favorites') {
            return favoriteFiles.map(f => ({ type: 'file' as const, data: f }));
        }
        return [
            ...folders.map(f => ({ type: 'folder' as const, data: f })),
            ...files.map(f => ({ type: 'file' as const, data: f })),
        ];
    };

    const combinedData = getDisplayData();

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderSortDropdown()}
            {renderFilterDropdown()}
            {renderUploadOptions()}
            
            {combinedData.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={combinedData}
                    keyExtractor={(item) => `${item.type}-${item.data.id}`}
                    numColumns={viewMode === 'grid' ? 3 : 1}
                    key={viewMode} // Force re-render when view mode changes
                    contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} />
                    }
                    renderItem={({ item }) => {
                        const isSelected = selectedItems.has(`${item.type}-${item.data.id}`);
                        if (item.type === 'folder') {
                            return (
                                <View style={[multiSelectMode && isSelected && styles.itemSelected]}>
                                    {multiSelectMode && (
                                        <View style={styles.checkboxOverlay}>
                                            <MaterialCommunityIcons 
                                                name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} 
                                                size={24} 
                                                color={isSelected ? '#3B82F6' : '#9CA3AF'} 
                                            />
                                        </View>
                                    )}
                                    <FolderItem
                                        folder={item.data as FileFolder}
                                        viewMode={viewMode}
                                        onPress={() => handleFolderPress(item.data as FileFolder)}
                                        onLongPress={() => handleFolderLongPress(item.data as FileFolder)}
                                    />
                                </View>
                            );
                        }
                        return (
                            <View style={[multiSelectMode && isSelected && styles.itemSelected]}>
                                {multiSelectMode && (
                                    <View style={styles.checkboxOverlay}>
                                        <MaterialCommunityIcons 
                                            name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} 
                                            size={24} 
                                            color={isSelected ? '#3B82F6' : '#9CA3AF'} 
                                        />
                                    </View>
                                )}
                                <FileItemComponent
                                    file={item.data as FileItem}
                                    viewMode={viewMode}
                                    onPress={() => handleFilePress(item.data as FileItem)}
                                    onLongPress={() => handleFileLongPress(item.data as FileItem)}
                                />
                            </View>
                        );
                    }}
                />
            )}

            {/* File Preview Modal */}
            <FilePreviewModal
                visible={showPreviewModal}
                file={selectedFile}
                onClose={() => setShowPreviewModal(false)}
                onDownload={selectedFile ? () => handleDownloadFile(selectedFile) : undefined}
                onShare={selectedFile ? () => handleShareFile(selectedFile) : undefined}
            />

            {/* File Actions Sheet */}
            <FileActionsSheet
                visible={showActionsSheet}
                item={selectedFile || selectedFolder}
                isFolder={!!selectedFolder}
                onClose={() => { setShowActionsSheet(false); setSelectedFile(null); setSelectedFolder(null); }}
                onPreview={selectedFile ? () => { setShowActionsSheet(false); setShowPreviewModal(true); } : undefined}
                onRename={selectedFile ? () => handleRenameFile(selectedFile) : selectedFolder ? () => handleRenameFolder(selectedFolder) : undefined}
                onMove={selectedFile ? () => handleMoveFile(selectedFile) : selectedFolder ? () => handleMoveFolder(selectedFolder) : undefined}
                onCopy={selectedFile ? () => handleCopyFile(selectedFile) : undefined}
                onShare={selectedFile ? () => handleShareFile(selectedFile) : undefined}
                onDownload={selectedFile ? () => handleDownloadFile(selectedFile) : undefined}
                onFavorite={selectedFile ? () => handleToggleFavorite(selectedFile) : selectedFolder ? () => handleToggleFolderFavorite(selectedFolder) : undefined}
                onInfo={selectedFile ? () => handleShowDetails(selectedFile) : undefined}
                onDelete={selectedFile ? () => handleDeleteFile(selectedFile) : selectedFolder ? () => handleDeleteFolder(selectedFolder) : undefined}
            />

            {/* File Details Modal */}
            <FileDetailsModal
                visible={showDetailsModal}
                file={selectedFile}
                onClose={() => { setShowDetailsModal(false); setSelectedFile(null); }}
                onUpdate={loadData}
            />

            {/* Move File Modal */}
            <MoveFileModal
                visible={showMoveModal}
                fileName={selectedFile?.originalName || selectedFolder?.name || ''}
                currentFolderId={selectedFile?.folderId || selectedFolder?.parentId || null}
                onClose={() => { setShowMoveModal(false); setSelectedFile(null); setSelectedFolder(null); }}
                onMove={handleMoveConfirm}
            />

            {/* Create Folder Modal */}
            <CreateFolderModal
                visible={showCreateFolderModal}
                mode="create"
                onClose={() => setShowCreateFolderModal(false)}
                onSubmit={handleCreateFolder}
            />

            {/* Rename Folder Modal */}
            <CreateFolderModal
                visible={showRenameFolderModal}
                mode="rename"
                initialName={selectedFolder?.name}
                initialColor={selectedFolder?.color}
                onClose={() => { setShowRenameFolderModal(false); setSelectedFolder(null); }}
                onSubmit={handleUpdateFolder}
            />
        </View>
    );
};

// =====================================
// STYLES
// =====================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    multiSelectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    multiSelectCancel: {
        fontSize: 16,
        color: '#3B82F6',
    },
    multiSelectCount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    multiSelectActions: {
        flexDirection: 'row',
        gap: 12,
    },
    multiSelectButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1F2937',
    },
    filterTabs: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    filterTabActive: {
        backgroundColor: '#EFF6FF',
    },
    filterTabText: {
        fontSize: 13,
        color: '#6B7280',
    },
    filterTabTextActive: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewModeToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    viewModeButton: {
        padding: 6,
        borderRadius: 6,
    },
    viewModeButtonActive: {
        backgroundColor: '#FFFFFF',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        gap: 4,
    },
    sortButtonText: {
        fontSize: 13,
        color: '#6B7280',
    },
    filterButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    selectButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    addButton: {
        marginLeft: 'auto',
        padding: 10,
        backgroundColor: '#3B82F6',
        borderRadius: 10,
    },
    uploadingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    uploadingText: {
        fontSize: 13,
        color: '#3B82F6',
    },
    // Dropdown styles
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        width: '80%',
        maxWidth: 320,
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 12,
    },
    dropdownItemActive: {
        backgroundColor: '#EFF6FF',
    },
    dropdownItemText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
    },
    dropdownItemTextActive: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    // Upload options styles
    uploadOptionsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    uploadOptionsHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    uploadOptionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    uploadOptionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    uploadOption: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 16,
    },
    uploadOptionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    uploadOptionText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    // Multi-select styles
    itemSelected: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
    },
    checkboxOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
    },
    breadcrumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    breadcrumbItem: {
        padding: 4,
    },
    breadcrumbText: {
        fontSize: 13,
        color: '#6B7280',
    },
    breadcrumbTextActive: {
        color: '#1F2937',
        fontWeight: '600',
    },
    quotaContainer: {
        marginTop: 12,
    },
    quotaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    quotaLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    quotaText: {
        fontSize: 12,
        color: '#1F2937',
        fontWeight: '500',
    },
    quotaBarBackground: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    quotaBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    gridContent: {
        padding: 12,
    },
    listContent: {
        padding: 12,
    },
    gridFolderItem: {
        flex: 1,
        maxWidth: '33.33%',
        padding: 8,
        alignItems: 'center',
    },
    gridFileItem: {
        flex: 1,
        maxWidth: '33.33%',
        padding: 8,
        alignItems: 'center',
    },
    folderIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridFileIcon: {
        width: 64,
        height: 64,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridImagePreview: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginBottom: 8,
    },
    gridItemName: {
        fontSize: 12,
        color: '#1F2937',
        textAlign: 'center',
        fontWeight: '500',
    },
    gridItemMeta: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
    },
    favoriteIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    listFolderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    listFileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    listFolderIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listFileIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listImagePreview: {
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    listItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    listItemName: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    listItemMeta: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    moreButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    emptyStateButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PersonalFilesTab;
