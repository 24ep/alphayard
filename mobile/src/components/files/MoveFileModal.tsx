import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FileFolder, fileManagementApi } from '../../services/api/fileManagement';

interface MoveFileModalProps {
    visible: boolean;
    fileName: string;
    currentFolderId: string | null;
    onClose: () => void;
    onMove: (targetFolderId: string | null) => void;
}

export const MoveFileModal: React.FC<MoveFileModalProps> = ({
    visible,
    fileName,
    currentFolderId,
    onClose,
    onMove,
}) => {
    const [folders, setFolders] = useState<FileFolder[]>([]);
    const [folderPath, setFolderPath] = useState<FileFolder[]>([]);
    const [currentViewFolderId, setCurrentViewFolderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setCurrentViewFolderId(null);
            setSelectedFolderId(null);
            setFolderPath([]);
            loadFolders(null);
        }
    }, [visible]);

    const loadFolders = async (parentId: string | null) => {
        setLoading(true);
        try {
            const response = await fileManagementApi.getFolders(parentId || undefined);
            if (response.success) {
                setFolders(response.folders);
            }

            if (parentId) {
                const pathResponse = await fileManagementApi.getFolderPath(parentId);
                if (pathResponse.success) {
                    setFolderPath(pathResponse.path);
                }
            } else {
                setFolderPath([]);
            }
        } catch (error) {
            console.error('Error loading folders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFolderPress = (folder: FileFolder) => {
        setCurrentViewFolderId(folder.id);
        setSelectedFolderId(folder.id);
        loadFolders(folder.id);
    };

    const handleNavigateBack = () => {
        if (folderPath.length > 1) {
            const parentFolder = folderPath[folderPath.length - 2];
            setCurrentViewFolderId(parentFolder.id);
            loadFolders(parentFolder.id);
        } else {
            setCurrentViewFolderId(null);
            loadFolders(null);
        }
    };

    const handleNavigateToRoot = () => {
        setCurrentViewFolderId(null);
        setSelectedFolderId(null);
        loadFolders(null);
    };

    const handleNavigateToBreadcrumb = (folder: FileFolder) => {
        setCurrentViewFolderId(folder.id);
        setSelectedFolderId(folder.id);
        loadFolders(folder.id);
    };

    const handleMoveHere = () => {
        // Don't allow moving to the same folder
        if (selectedFolderId === currentFolderId) {
            onClose();
            return;
        }
        onMove(selectedFolderId);
    };

    const renderBreadcrumb = () => (
        <View style={styles.breadcrumb}>
            <TouchableOpacity style={styles.breadcrumbItem} onPress={handleNavigateToRoot}>
                <MaterialCommunityIcons name="home" size={18} color="#6B7280" />
            </TouchableOpacity>
            {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <MaterialCommunityIcons name="chevron-right" size={16} color="#D1D5DB" />
                    <TouchableOpacity
                        style={styles.breadcrumbItem}
                        onPress={() => handleNavigateToBreadcrumb(folder)}
                    >
                        <Text style={[
                            styles.breadcrumbText,
                            index === folderPath.length - 1 && styles.breadcrumbTextActive
                        ]}>
                            {folder.name}
                        </Text>
                    </TouchableOpacity>
                </React.Fragment>
            ))}
        </View>
    );

    const renderFolderItem = ({ item }: { item: FileFolder }) => {
        const isCurrentFolder = item.id === currentFolderId;
        const isSelected = item.id === selectedFolderId;

        return (
            <TouchableOpacity
                style={[
                    styles.folderItem,
                    isSelected && styles.folderItemSelected,
                    isCurrentFolder && styles.folderItemDisabled,
                ]}
                onPress={() => !isCurrentFolder && handleFolderPress(item)}
                disabled={isCurrentFolder}
            >
                <View style={[styles.folderIcon, { backgroundColor: item.color || '#FEF3C7' }]}>
                    <MaterialCommunityIcons 
                        name="folder" 
                        size={24} 
                        color={item.color ? '#FFF' : '#F59E0B'} 
                    />
                </View>
                <View style={styles.folderInfo}>
                    <Text style={[
                        styles.folderName,
                        isCurrentFolder && styles.folderNameDisabled
                    ]}>
                        {item.name}
                    </Text>
                    <Text style={styles.folderMeta}>{item.itemCount} items</Text>
                </View>
                {isCurrentFolder ? (
                    <Text style={styles.currentLabel}>Current</Text>
                ) : (
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                )}
            </TouchableOpacity>
        );
    };

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
                        <View style={styles.headerTitleRow}>
                            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Move to</Text>
                            <TouchableOpacity 
                                style={[
                                    styles.moveButton,
                                    selectedFolderId === currentFolderId && styles.moveButtonDisabled
                                ]}
                                onPress={handleMoveHere}
                                disabled={selectedFolderId === currentFolderId}
                            >
                                <Text style={[
                                    styles.moveButtonText,
                                    selectedFolderId === currentFolderId && styles.moveButtonTextDisabled
                                ]}>
                                    Move
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                    </View>

                    {/* Breadcrumb */}
                    {renderBreadcrumb()}

                    {/* Back Button (when inside a folder) */}
                    {currentViewFolderId && (
                        <TouchableOpacity style={styles.backButton} onPress={handleNavigateBack}>
                            <MaterialCommunityIcons name="arrow-left" size={20} color="#3B82F6" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}

                    {/* Root Folder Option */}
                    {currentViewFolderId === null && (
                        <TouchableOpacity
                            style={[
                                styles.rootOption,
                                selectedFolderId === null && currentFolderId !== null && styles.folderItemSelected
                            ]}
                            onPress={() => setSelectedFolderId(null)}
                            disabled={currentFolderId === null}
                        >
                            <View style={styles.rootIcon}>
                                <MaterialCommunityIcons name="folder-home" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.rootText}>My Files (Root)</Text>
                            {currentFolderId === null && (
                                <Text style={styles.currentLabel}>Current</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Folders List */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : folders.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="folder-open-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No folders here</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={folders}
                            keyExtractor={(item) => item.id}
                            renderItem={renderFolderItem}
                            contentContainerStyle={styles.foldersList}
                        />
                    )}

                    {/* Create Folder Button */}
                    <TouchableOpacity style={styles.createFolderButton}>
                        <MaterialCommunityIcons name="folder-plus-outline" size={20} color="#3B82F6" />
                        <Text style={styles.createFolderText}>Create New Folder</Text>
                    </TouchableOpacity>
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
        maxHeight: '85%',
        minHeight: '50%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cancelButton: {
        padding: 4,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#6B7280',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    moveButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    moveButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    moveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    moveButtonTextDisabled: {
        color: '#9CA3AF',
    },
    fileName: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
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
        fontWeight: '500',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButtonText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    rootOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rootIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rootText: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
        marginLeft: 12,
    },
    foldersList: {
        paddingVertical: 8,
    },
    folderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    folderItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    folderItemDisabled: {
        opacity: 0.5,
    },
    folderIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    folderInfo: {
        flex: 1,
        marginLeft: 12,
    },
    folderName: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    folderNameDisabled: {
        color: '#9CA3AF',
    },
    folderMeta: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    currentLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 12,
    },
    createFolderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 8,
    },
    createFolderText: {
        fontSize: 15,
        color: '#3B82F6',
        fontWeight: '500',
    },
});

export default MoveFileModal;
