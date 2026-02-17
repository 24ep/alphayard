import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Platform,
    ScrollView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FileItem } from '../../services/api/fileManagement';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilePreviewModalProps {
    visible: boolean;
    file: FileItem | null;
    onClose: () => void;
    onDownload?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    visible,
    file,
    onClose,
    onDownload,
    onShare,
    onDelete,
}) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    if (!file) return null;

    const isImage = file.fileType === 'image';
    const isVideo = file.fileType === 'video';
    const isPdf = file.mimeType?.includes('pdf');
    const isAudio = file.fileType === 'audio';

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderContent = () => {
        if (isImage) {
            return (
                <View style={styles.imageContainer}>
                    {imageLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#FFF" />
                        </View>
                    )}
                    {imageError ? (
                        <View style={styles.errorContainer}>
                            <MaterialCommunityIcons name="image-broken" size={64} color="#9CA3AF" />
                            <Text style={styles.errorText}>Failed to load image</Text>
                        </View>
                    ) : (
                        <Image
                            source={{ uri: file.url }}
                            style={styles.previewImage}
                            resizeMode="contain"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            onError={() => {
                                setImageLoading(false);
                                setImageError(true);
                            }}
                        />
                    )}
                </View>
            );
        }

        if (isVideo) {
            return (
                <View style={styles.videoContainer}>
                    <MaterialCommunityIcons name="video" size={80} color="#F59E0B" />
                    <Text style={styles.videoText}>{file.originalName}</Text>
                    <TouchableOpacity style={styles.playButton} onPress={onDownload}>
                        <MaterialCommunityIcons name="play-circle" size={64} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.videoHint}>Tap to download and play</Text>
                </View>
            );
        }

        if (isPdf) {
            return (
                <View style={styles.documentContainer}>
                    <MaterialCommunityIcons name="file-pdf-box" size={80} color="#EF4444" />
                    <Text style={styles.documentName}>{file.originalName}</Text>
                    <Text style={styles.documentSize}>{formatFileSize(file.size)}</Text>
                    <TouchableOpacity style={styles.openButton} onPress={onDownload}>
                        <MaterialCommunityIcons name="open-in-new" size={20} color="#FFF" />
                        <Text style={styles.openButtonText}>Download to View</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (isAudio) {
            return (
                <View style={styles.audioContainer}>
                    <MaterialCommunityIcons name="music-circle" size={100} color="#8B5CF6" />
                    <Text style={styles.audioName}>{file.originalName}</Text>
                    <Text style={styles.audioSize}>{formatFileSize(file.size)}</Text>
                    <TouchableOpacity style={styles.playAudioButton} onPress={onDownload}>
                        <MaterialCommunityIcons name="play" size={32} color="#FFF" />
                    </TouchableOpacity>
                </View>
            );
        }

        // Generic file preview
        return (
            <View style={styles.genericContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={80} color="#6B7280" />
                <Text style={styles.genericName}>{file.originalName}</Text>
                <Text style={styles.genericSize}>{formatFileSize(file.size)}</Text>
                <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
                    <MaterialCommunityIcons name="download" size={20} color="#FFF" />
                    <Text style={styles.downloadButtonText}>Download File</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {file.originalName}
                    </Text>
                    <View style={styles.headerActions}>
                        {onShare && (
                            <TouchableOpacity style={styles.headerButton} onPress={onShare}>
                                <MaterialCommunityIcons name="share-variant" size={22} color="#FFF" />
                            </TouchableOpacity>
                        )}
                        {onDownload && (
                            <TouchableOpacity style={styles.headerButton} onPress={onDownload}>
                                <MaterialCommunityIcons name="download" size={22} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {renderContent()}
                </View>

                {/* Footer with file info */}
                <View style={styles.footer}>
                    <View style={styles.footerInfo}>
                        <Text style={styles.footerLabel}>Size</Text>
                        <Text style={styles.footerValue}>{formatFileSize(file.size)}</Text>
                    </View>
                    <View style={styles.footerDivider} />
                    <View style={styles.footerInfo}>
                        <Text style={styles.footerLabel}>Modified</Text>
                        <Text style={styles.footerValue}>{formatDate(file.updatedAt)}</Text>
                    </View>
                    <View style={styles.footerDivider} />
                    <View style={styles.footerInfo}>
                        <Text style={styles.footerLabel}>Type</Text>
                        <Text style={styles.footerValue}>{file.fileType}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        marginHorizontal: 12,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.6,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        color: '#9CA3AF',
        marginTop: 12,
    },
    videoContainer: {
        alignItems: 'center',
        padding: 32,
    },
    videoText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    playButton: {
        marginTop: 24,
    },
    videoHint: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 12,
    },
    documentContainer: {
        alignItems: 'center',
        padding: 32,
    },
    documentName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    documentSize: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 8,
    },
    openButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },
    openButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    audioContainer: {
        alignItems: 'center',
        padding: 32,
    },
    audioName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    audioSize: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 8,
    },
    playAudioButton: {
        backgroundColor: '#8B5CF6',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    genericContainer: {
        alignItems: 'center',
        padding: 32,
    },
    genericName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    genericSize: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 8,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },
    downloadButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    footerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    footerValue: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '500',
    },
    footerDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});

export default FilePreviewModal;
