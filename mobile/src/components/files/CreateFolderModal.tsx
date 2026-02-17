import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Platform,
    ScrollView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface CreateFolderModalProps {
    visible: boolean;
    mode: 'create' | 'rename';
    initialName?: string;
    initialColor?: string;
    onClose: () => void;
    onSubmit: (name: string, color?: string, icon?: string) => void;
}

const FOLDER_COLORS = [
    { color: '#F59E0B', name: 'Yellow' },
    { color: '#EF4444', name: 'Red' },
    { color: '#10B981', name: 'Green' },
    { color: '#3B82F6', name: 'Blue' },
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#EC4899', name: 'Pink' },
    { color: '#6B7280', name: 'Gray' },
    { color: '#1F2937', name: 'Dark' },
];

const FOLDER_ICONS = [
    { icon: 'folder', name: 'Default' },
    { icon: 'folder-heart', name: 'Heart' },
    { icon: 'folder-star', name: 'Star' },
    { icon: 'folder-account', name: 'Personal' },
    { icon: 'folder-image', name: 'Images' },
    { icon: 'folder-music', name: 'Music' },
    { icon: 'folder-play', name: 'Videos' },
    { icon: 'folder-text', name: 'Documents' },
    { icon: 'folder-download', name: 'Downloads' },
    { icon: 'folder-cog', name: 'Settings' },
    { icon: 'folder-lock', name: 'Private' },
    { icon: 'briefcase', name: 'Work' },
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
    visible,
    mode,
    initialName = '',
    initialColor,
    onClose,
    onSubmit,
}) => {
    const [name, setName] = useState(initialName);
    const [selectedColor, setSelectedColor] = useState(initialColor || FOLDER_COLORS[0].color);
    const [selectedIcon, setSelectedIcon] = useState('folder');
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            setName(initialName);
            setSelectedColor(initialColor || FOLDER_COLORS[0].color);
            setError('');
        }
    }, [visible, initialName, initialColor]);

    const handleSubmit = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Folder name is required');
            return;
        }
        if (trimmedName.length > 100) {
            setError('Folder name is too long');
            return;
        }
        // Check for invalid characters
        if (/[<>:"/\\|?*]/.test(trimmedName)) {
            setError('Folder name contains invalid characters');
            return;
        }
        onSubmit(trimmedName, selectedColor, selectedIcon);
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
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {mode === 'create' ? 'New Folder' : 'Rename Folder'}
                        </Text>
                        <TouchableOpacity 
                            style={[styles.submitButton, !name.trim() && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={!name.trim()}
                        >
                            <Text style={[
                                styles.submitButtonText,
                                !name.trim() && styles.submitButtonTextDisabled
                            ]}>
                                {mode === 'create' ? 'Create' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Folder Preview */}
                        <View style={styles.previewSection}>
                            <View style={[styles.folderPreview, { backgroundColor: selectedColor }]}>
                                <MaterialCommunityIcons name={selectedIcon as any} size={48} color="#FFF" />
                            </View>
                            <Text style={styles.previewName}>{name || 'Folder Name'}</Text>
                        </View>

                        {/* Name Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={[styles.input, error && styles.inputError]}
                                placeholder="Enter folder name"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    setError('');
                                }}
                                autoFocus
                                maxLength={100}
                            />
                            {error && <Text style={styles.errorText}>{error}</Text>}
                        </View>

                        {/* Color Selection */}
                        <View style={styles.colorSection}>
                            <Text style={styles.label}>Color</Text>
                            <View style={styles.colorGrid}>
                                {FOLDER_COLORS.map((item) => (
                                    <TouchableOpacity
                                        key={item.color}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: item.color },
                                            selectedColor === item.color && styles.colorOptionSelected,
                                        ]}
                                        onPress={() => setSelectedColor(item.color)}
                                    >
                                        {selectedColor === item.color && (
                                            <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Icon Selection */}
                        <View style={styles.iconSection}>
                            <Text style={styles.label}>Icon</Text>
                            <View style={styles.iconGrid}>
                                {FOLDER_ICONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.icon}
                                        style={[
                                            styles.iconOption,
                                            selectedIcon === item.icon && styles.iconOptionSelected,
                                        ]}
                                        onPress={() => setSelectedIcon(item.icon)}
                                    >
                                        <MaterialCommunityIcons 
                                            name={item.icon as any} 
                                            size={24} 
                                            color={selectedIcon === item.icon ? selectedColor : '#6B7280'} 
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
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
        maxHeight: '80%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cancelButton: {
        padding: 4,
        minWidth: 60,
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
    submitButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    submitButtonTextDisabled: {
        color: '#9CA3AF',
    },
    content: {
        padding: 20,
    },
    previewSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    folderPreview: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    previewName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    inputSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    colorSection: {
        marginBottom: 24,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    iconSection: {
        marginBottom: 24,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconOptionSelected: {
        backgroundColor: '#EFF6FF',
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
});

export default CreateFolderModal;
