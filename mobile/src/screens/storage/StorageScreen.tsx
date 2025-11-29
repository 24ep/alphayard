import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Icon,
  Pressable,
  useColorModeValue,
  Avatar,
  Badge,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Progress,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  modifiedDate: string;
  icon: string;
  color: string;
  isShared: boolean;
  isStarred: boolean;
  path: string;
}

interface StorageStats {
  used: number;
  total: number;
  percentage: number;
}

const StorageScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'files' | 'shared' | 'starred' | 'recent'>('files');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    used: 15.2,
    total: 100,
    percentage: 15.2,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[900]);
  const cardBgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  // Helper functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file: any): string => {
    if (file.mime_type === 'folder') {
      return 'folder';
    }
    
    const mimeType = file.mime_type || '';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'music';
    if (mimeType.includes('pdf')) return 'file-pdf-box';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word-box';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel-box';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint-box';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'zip-box';
    
    return 'file';
  };

  const getFileColor = (file: any): string => {
    if (file.mime_type === 'folder') {
      return colors.yellow[500];
    }
    
    const mimeType = file.mime_type || '';
    
    if (mimeType.startsWith('image/')) return colors.green[500];
    if (mimeType.startsWith('video/')) return colors.red[500];
    if (mimeType.startsWith('audio/')) return colors.purple[500];
    if (mimeType.includes('pdf')) return colors.red[600];
    if (mimeType.includes('word') || mimeType.includes('document')) return colors.blue[600];
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return colors.green[600];
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return colors.orange[600];
    if (mimeType.includes('zip') || mimeType.includes('rar')) return colors.purple[600];
    
    return colors.gray[500];
  };

  useEffect(() => {
    loadFiles();
    loadStorageStats();
  }, [currentPath]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/storage/files`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      
      if (data.success) {
        const formattedFiles: FileItem[] = data.files.map((file: any) => ({
          id: file.id,
          name: file.original_name,
          type: file.mime_type === 'folder' ? 'folder' : 'file',
          size: file.mime_type === 'folder' ? '--' : formatFileSize(file.size),
          modifiedDate: new Date(file.created_at).toLocaleDateString(),
          icon: getFileIcon(file),
          color: getFileColor(file),
          isShared: file.is_shared,
          isStarred: file.is_favorite,
          path: file.path || `/${file.original_name}`,
        }));
        
        setFiles(formattedFiles);
        
        // Update storage stats if available
        if (data.storageUsage) {
          setStorageStats({
            used: data.storageUsage.totalSize / (1024 * 1024 * 1024), // Convert to GB
            total: data.storageUsage.limit / (1024 * 1024 * 1024), // Convert to GB
            percentage: (data.storageUsage.totalSize / data.storageUsage.limit) * 100,
          });
        }
      }
    } catch (error) {
      console.error('Error loading files:', error);
      // Fallback to mock data for development
      const mockFiles: FileItem[] = [
        {
          id: '1',
          name: 'Documents',
          type: 'folder',
          size: '--',
          modifiedDate: '2024-01-15',
          icon: 'folder',
          color: colors.primary[500],
          isShared: false,
          isStarred: true,
          path: '/Documents',
        },
        {
          id: '2',
          name: 'Photos',
          type: 'folder',
          size: '--',
          modifiedDate: '2024-01-14',
          icon: 'folder-image',
          color: colors.success[500],
          isShared: true,
          isStarred: false,
          path: '/Photos',
        },
      ];
      setFiles(mockFiles);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageStats = async () => {
    // Mock storage stats
    setStorageStats({
      used: 15.2,
      total: 100,
      percentage: 15.2,
    });
  };

  const handleFilePress = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
    } else {
      // Open file preview
      navigation.navigate('FilePreview' as never, { file } as never);
    }
  };

  const handleFileLongPress = (file: FileItem) => {
    // Show file options menu
    onOpen();
  };

  const handleUploadFile = async (file: any) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      if (data.success) {
        // Reload files after successful upload
        loadFiles();
        onClose();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/storage/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const data = await response.json();
      if (data.success) {
        // Reload files after successful folder creation
        loadFiles();
        onClose();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleToggleFavorite = async (fileId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/storage/files/${fileId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      const data = await response.json();
      if (data.success) {
        // Reload files to reflect changes
        loadFiles();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleShared = async (fileId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/storage/files/${fileId}/shared`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update shared status');
      }

      const data = await response.json();
      if (data.success) {
        // Reload files to reflect changes
        loadFiles();
      }
    } catch (error) {
      console.error('Error toggling shared:', error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/storage/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      const data = await response.json();
      if (data.success) {
        // Reload files after successful deletion
        loadFiles();
        onClose();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleBackPress = () => {
    if (currentPath !== '/') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      setCurrentPath(parentPath);
    } else {
      navigation.goBack();
    }
  };

  const getFilteredFiles = () => {
    let filtered = files;
    
    if (activeTab === 'shared') {
      filtered = filtered.filter(file => file.isShared);
    } else if (activeTab === 'starred') {
      filtered = filtered.filter(file => file.isStarred);
    } else if (activeTab === 'recent') {
      // Sort by modified date for recent
      filtered = [...filtered].sort((a, b) => 
        new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const renderFile = ({ item }: { item: FileItem }) => (
    <TouchableOpacity
      onPress={() => handleFilePress(item)}
      onLongPress={() => handleFileLongPress(item)}
    >
      <Box bg={cardBgColor} borderRadius={12} p={3} mb={2}>
        <HStack space={3} alignItems="center">
          <Box
            w={12}
            h={12}
            bg={item.color}
            borderRadius={8}
            justifyContent="center"
            alignItems="center"
          >
            <Icon as={IconMC} name={item.icon} size={6} color={colors.white[500]} />
          </Box>
          
          <VStack flex={1}>
            <HStack space={2} alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="500" flex={1}>
                {item.name}
              </Text>
              {item.isStarred && (
                <Icon as={IconMC} name="star" size={4} color={colors.warning[500]} />
              )}
              {item.isShared && (
                <Icon as={IconMC} name="share-variant" size={4} color={colors.primary[500]} />
              )}
            </HStack>
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {item.size !== '--' ? item.size : ''} • {item.modifiedDate}
            </Text>
          </VStack>
          
          <IconButton
            icon={<Icon as={IconMC} name="dots-vertical" size={5} />}
            variant="ghost"
            size="sm"
            onPress={() => {
              setSelectedFile(item);
              onOpen();
            }}
          />
        </HStack>
      </Box>
    </TouchableOpacity>
  );

  const getCurrentFolderName = () => {
    if (currentPath === '/') return 'My Drive';
    return currentPath.split('/').pop() || 'My Drive';
  };

  return (
    <Box flex={1} bg={bgColor} safeArea>
      {/* Header */}
      <HStack
        bg={cardBgColor}
        px={4}
        py={3}
        alignItems="center"
        space={3}
        shadow={2}
      >
        <IconButton
          icon={<Icon as={IconMC} name="arrow-left" size={6} />}
          onPress={handleBackPress}
          variant="ghost"
        />
        
        <VStack flex={1}>
          <Text style={textStyles.h3} color={textColor} fontWeight="600">
            Storage
          </Text>
          <Text style={textStyles.caption} color={colors.gray[600]}>
            {getCurrentFolderName()}
          </Text>
        </VStack>
        
        <IconButton
          icon={<Icon as={IconMC} name="plus" size={6} />}
          onPress={onOpen}
          variant="ghost"
        />
        
        <IconButton
          icon={<Icon as={IconMC} name="dots-vertical" size={6} />}
          onPress={() => {/* TODO: Open storage options */}}
          variant="ghost"
        />
      </HStack>

      {/* Storage Usage */}
      <Box px={4} py={3} bg={colors.gray[50]}>
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text style={textStyles.body} color={textColor} fontWeight="500">
              Storage Usage
            </Text>
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {storageStats.used} GB of {storageStats.total} GB
            </Text>
          </HStack>
          <Progress
            value={storageStats.percentage}
            bg={colors.gray[200]}
            _filledTrack={{ bg: colors.primary[500] }}
            h={2}
            borderRadius="full"
          />
        </VStack>
      </Box>

      {/* Search Bar */}
      <Box px={4} py={3}>
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          borderRadius={20}
          bg={colors.gray[100]}
          borderWidth={0}
          InputLeftElement={
            <Icon as={IconMC} name="magnify" size={5} color={colors.gray[600]} ml={3} />
          }
        />
      </Box>

      {/* Tabs */}
      <HStack px={4} space={2} mb={3}>
        <Pressable
          flex={1}
          bg={activeTab === 'files' ? colors.primary[500] : colors.gray[200]}
          py={2}
          borderRadius={20}
          onPress={() => setActiveTab('files')}
        >
          <Text
            style={textStyles.body}
            color={activeTab === 'files' ? colors.white[500] : colors.gray[600]}
            textAlign="center"
            fontWeight="500"
          >
            Files
          </Text>
        </Pressable>
        
        <Pressable
          flex={1}
          bg={activeTab === 'shared' ? colors.primary[500] : colors.gray[200]}
          py={2}
          borderRadius={20}
          onPress={() => setActiveTab('shared')}
        >
          <Text
            style={textStyles.body}
            color={activeTab === 'shared' ? colors.white[500] : colors.gray[600]}
            textAlign="center"
            fontWeight="500"
          >
            Shared
          </Text>
        </Pressable>
        
        <Pressable
          flex={1}
          bg={activeTab === 'starred' ? colors.primary[500] : colors.gray[200]}
          py={2}
          borderRadius={20}
          onPress={() => setActiveTab('starred')}
        >
          <Text
            style={textStyles.body}
            color={activeTab === 'starred' ? colors.white[500] : colors.gray[600]}
            textAlign="center"
            fontWeight="500"
          >
            Starred
          </Text>
        </Pressable>
        
        <Pressable
          flex={1}
          bg={activeTab === 'recent' ? colors.primary[500] : colors.gray[200]}
          py={2}
          borderRadius={20}
          onPress={() => setActiveTab('recent')}
        >
          <Text
            style={textStyles.body}
            color={activeTab === 'recent' ? colors.white[500] : colors.gray[600]}
            textAlign="center"
            fontWeight="500"
          >
            Recent
          </Text>
        </Pressable>
      </HStack>

      {/* Content */}
      <Box flex={1} px={4}>
        {isLoading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Spinner size="lg" color={colors.primary[500]} />
            <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
              Loading files...
            </Text>
          </Box>
        ) : (
          <FlatList
            data={getFilteredFiles()}
            renderItem={renderFile}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Box>

      {/* File Actions Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              {selectedFile ? `${selectedFile.name} Actions` : 'Add Files'}
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              {selectedFile ? (
                // File actions
                <>
                  <TouchableOpacity onPress={() => handleToggleFavorite(selectedFile.id)}>
                    <HStack space={3} alignItems="center">
                      <Box
                        w={12}
                        h={12}
                        bg={colors.yellow[100]}
                        borderRadius="full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Icon as={IconMC} name={selectedFile.isStarred ? "star" : "star-outline"} size={6} color={colors.yellow[500]} />
                      </Box>
                      <VStack flex={1}>
                        <Text style={textStyles.h4} color={textColor} fontWeight="500">
                          {selectedFile.isStarred ? 'Remove from Favorites' : 'Add to Favorites'}
                        </Text>
                        <Text style={textStyles.caption} color={colors.gray[600]}>
                          {selectedFile.isStarred ? 'Remove from your favorites' : 'Add to your favorites'}
                        </Text>
                      </VStack>
                    </HStack>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleToggleShared(selectedFile.id)}>
                    <HStack space={3} alignItems="center">
                      <Box
                        w={12}
                        h={12}
                        bg={colors.blue[100]}
                        borderRadius="full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Icon as={IconMC} name={selectedFile.isShared ? "share-variant" : "share-outline"} size={6} color={colors.blue[500]} />
                      </Box>
                      <VStack flex={1}>
                        <Text style={textStyles.h4} color={textColor} fontWeight="500">
                          {selectedFile.isShared ? 'Unshare' : 'Share'}
                        </Text>
                        <Text style={textStyles.caption} color={colors.gray[600]}>
                          {selectedFile.isShared ? 'Make private to family' : 'Share with family members'}
                        </Text>
                      </VStack>
                    </HStack>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDeleteFile(selectedFile.id)}>
                    <HStack space={3} alignItems="center">
                      <Box
                        w={12}
                        h={12}
                        bg={colors.red[100]}
                        borderRadius="full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Icon as={IconMC} name="delete" size={6} color={colors.red[500]} />
                      </Box>
                      <VStack flex={1}>
                        <Text style={textStyles.h4} color={textColor} fontWeight="500">
                          Delete
                        </Text>
                        <Text style={textStyles.caption} color={colors.gray[600]}>
                          Permanently delete this file
                        </Text>
                      </VStack>
                    </HStack>
                  </TouchableOpacity>
                </>
              ) : (
                // Add files options
                <>
                  <TouchableOpacity>
                    <HStack space={3} alignItems="center">
                      <Box
                        w={12}
                        h={12}
                        bg={colors.primary[100]}
                        borderRadius="full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Icon as={IconMC} name="upload" size={6} color={colors.primary[500]} />
                      </Box>
                      <VStack flex={1}>
                        <Text style={textStyles.h4} color={textColor} fontWeight="500">
                          Upload Files
                        </Text>
                        <Text style={textStyles.caption} color={colors.gray[600]}>
                          Upload files from your device
                        </Text>
                      </VStack>
                    </HStack>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => {
                    const folderName = prompt('Enter folder name:');
                    if (folderName) {
                      handleCreateFolder(folderName);
                    }
                  }}>
                    <HStack space={3} alignItems="center">
                      <Box
                        w={12}
                        h={12}
                        bg={colors.primary[100]}
                        borderRadius="full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Icon as={IconMC} name="folder-plus" size={6} color={colors.primary[500]} />
                      </Box>
                      <VStack flex={1}>
                        <Text style={textStyles.h4} color={textColor} fontWeight="500">
                          Create Folder
                        </Text>
                        <Text style={textStyles.caption} color={colors.gray[600]}>
                          Create a new folder
                        </Text>
                      </VStack>
                    </HStack>
                  </TouchableOpacity>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StorageScreen; 