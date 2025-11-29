import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  IconButton,
  Badge,
  Pressable,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormControlLabel,
  Select,
  CheckIcon,
  Divider,
  Spinner,
  FlatList,
  Progress,
  Fab,
  FabIcon,
  FabLabel,
} from 'native-base';
import { useDisclosure } from '../../hooks/useDisclosure';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  familyId: string;
  isShared: boolean;
  isFavorite: boolean;
  parentId?: string;
  children?: FileItem[];
  metadata?: {
    description?: string;
    tags?: string[];
    thumbnail?: string;
  };
}

interface StorageStats {
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
  fileCount: number;
  folderCount: number;
}

interface StorageAppProps {
  familyId: string;
  onFilePress?: (file: FileItem) => void;
  onFolderPress?: (folder: FileItem) => void;
}

const StorageApp: React.FC<StorageAppProps> = ({
  familyId,
  onFilePress,
  onFolderPress,
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders' | 'shared'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isCreateFolderOpen, onOpen: onCreateFolderOpen, onClose: onCreateFolderClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const cardBgColor = useColorModeValue(colors.gray[50], colors.gray[700]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  // Form state
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
  });

  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalSpace: 10737418240, // 10GB
    usedSpace: 2147483648, // 2GB
    availableSpace: 8589934592, // 8GB
    fileCount: 0,
    folderCount: 0,
  });

  useEffect(() => {
    loadFiles();
    loadStorageStats();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockFiles: FileItem[] = [
        {
          id: '1',
          name: 'hourse Documents',
          type: 'folder',
          size: 0,
          path: '/hourse Documents',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          createdBy: user?.id || '',
          familyId,
          isShared: true,
          isFavorite: false,
          children: [],
        },
        {
          id: '2',
          name: 'Vacation Photos',
          type: 'folder',
          size: 0,
          path: '/Vacation Photos',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          createdBy: user?.id || '',
          familyId,
          isShared: true,
          isFavorite: true,
          children: [],
        },
        {
          id: '3',
          name: 'hourse Budget.xlsx',
          type: 'file',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 524288, // 512KB
          path: '/hourse Budget.xlsx',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-19'),
          createdBy: user?.id || '',
          familyId,
          isShared: true,
          isFavorite: false,
        },
        {
          id: '4',
          name: 'School Report.pdf',
          type: 'file',
          mimeType: 'application/pdf',
          size: 1048576, // 1MB
          path: '/School Report.pdf',
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-15'),
          createdBy: user?.id || '',
          familyId,
          isShared: false,
          isFavorite: false,
        },
        {
          id: '5',
          name: 'Birthday Video.mp4',
          type: 'file',
          mimeType: 'video/mp4',
          size: 52428800, // 50MB
          path: '/Birthday Video.mp4',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-10'),
          createdBy: user?.id || '',
          familyId,
          isShared: true,
          isFavorite: true,
        },
      ];
      setFiles(mockFiles);
    } catch (error) {
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      // Mock data - replace with actual API call
      const stats: StorageStats = {
        totalSpace: 10737418240, // 10GB
        usedSpace: 2147483648, // 2GB
        availableSpace: 8589934592, // 8GB
        fileCount: 15,
        folderCount: 8,
      };
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const handleFilePress = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      onFolderPress?.(file);
    } else {
      setSelectedFile(file);
      onOpen();
      onFilePress?.(file);
    }
  };

  const handleCreateFolder = () => {
    setFolderForm({
      name: '',
      description: '',
    });
    onCreateFolderOpen();
  };

  const handleSaveFolder = async () => {
    if (!folderForm.name.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      setIsLoading(true);
      const newFolder: FileItem = {
        id: `folder_${Date.now()}`,
        name: folderForm.name.trim(),
        type: 'folder',
        size: 0,
        path: `${currentPath}/${folderForm.name.trim()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.id || '',
        familyId,
        isShared: false,
        isFavorite: false,
        children: [],
      };

      setFiles(prev => [newFolder, ...prev]);
      onCreateFolderClose();
      Alert.alert('Success', 'Folder created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = () => {
    // TODO: Implement file upload
    Alert.alert('Upload', 'File upload feature coming soon!');
  };

  const handleToggleFavorite = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isFavorite: !file.isFavorite }
        : file
    ));
  };

  const handleDeleteFile = (fileId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFiles(prev => prev.filter(file => file.id !== fileId));
            onClose();
          },
        },
      ]
    );
  };

  const handleShareFile = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isShared: !file.isShared }
        : file
    ));
  };

  const getFilteredAndSortedFiles = () => {
    let filtered = files;
    
    // Apply filters
    switch (filterType) {
      case 'files':
        filtered = files.filter(file => file.type === 'file');
        break;
      case 'folders':
        filtered = files.filter(file => file.type === 'folder');
        break;
      case 'shared':
        filtered = files.filter(file => file.isShared);
        break;
      default:
        filtered = files;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime();
          break;
        case 'size':
          comparison = b.size - a.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return 'folder';
    }
    
    const mimeType = file.mimeType || '';
    
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

  const getFileColor = (file: FileItem) => {
    if (file.type === 'folder') {
      return colors.yellow[500];
    }
    
    const mimeType = file.mimeType || '';
    
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStorageUsagePercentage = () => {
    return (storageStats.usedSpace / storageStats.totalSpace) * 100;
  };

  const renderFileItem = ({ item: file }: { item: FileItem }) => (
    <Pressable onPress={() => handleFilePress(file)}>
      <Box
        bg={cardBgColor}
        p={4}
        borderRadius={12}
        mb={3}
        borderWidth={1}
        borderColor={colors.gray[200]}
        borderLeftWidth={4}
        borderLeftColor={getFileColor(file)}
      >
        <HStack space={3} alignItems="center">
          <Box
            w={12}
            h={12}
            borderRadius={8}
            bg={getFileColor(file)}
            justifyContent="center"
            alignItems="center"
          >
            <Icon
              as={IconMC}
              name={getFileIcon(file)}
              size={6}
              color={colors.white[500]}
            />
          </Box>
          
          <VStack flex={1}>
            <HStack space={2} alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600" numberOfLines={1}>
                {file.name}
              </Text>
              {file.isFavorite && (
                <Icon as={IconMC} name="star" size={4} color={colors.yellow[500]} />
              )}
              {file.isShared && (
                <Icon as={IconMC} name="share" size={4} color={colors.primary[500]} />
              )}
            </HStack>
            
            <HStack space={2} mt={1}>
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {file.type === 'folder' ? 'Folder' : formatFileSize(file.size)}
              </Text>
              <Text style={textStyles.caption} color={colors.gray[500]}>
                {formatDate(file.updatedAt)}
              </Text>
            </HStack>
          </VStack>
          
          <VStack space={1}>
            <IconButton
              icon={<Icon as={IconMC} name={file.isFavorite ? 'star' : 'star-outline'} size={4} />}
              onPress={() => handleToggleFavorite(file.id)}
              variant="ghost"
              size="sm"
              colorScheme="yellow"
            />
            <IconButton
              icon={<Icon as={IconMC} name={file.isShared ? 'share-variant' : 'share-outline'} size={4} />}
              onPress={() => handleShareFile(file.id)}
              variant="ghost"
              size="sm"
              colorScheme="primary"
            />
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <Box flex={1}>
      {/* Header */}
      <HStack space={3} alignItems="center" mb={4}>
        <Icon
          as={IconMC}
          name="cloud"
          size={6}
          color={colors.primary[500]}
        />
        <VStack flex={1}>
          <Text style={textStyles.h3} color={textColor} fontWeight="600">
            hourse Storage
          </Text>
          <Text style={textStyles.caption} color={colors.gray[600]}>
            {files.length} items • {formatFileSize(storageStats.usedSpace)} used
          </Text>
        </VStack>
        <HStack space={2}>
          <IconButton
            icon={<Icon as={IconMC} name={viewMode === 'list' ? 'view-grid' : 'view-list'} size={5} />}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            variant="ghost"
            size="sm"
            colorScheme="primary"
          />
          <IconButton
            icon={<Icon as={IconMC} name="plus" size={5} />}
            onPress={handleCreateFolder}
            variant="ghost"
            size="sm"
            colorScheme="primary"
          />
        </HStack>
      </HStack>

      {/* Storage Usage */}
      <Box bg={cardBgColor} p={4} borderRadius={12} mb={4}>
        <VStack space={3}>
          <HStack space={3} alignItems="center">
            <Icon as={IconMC} name="harddisk" size={5} color={colors.primary[500]} />
            <VStack flex={1}>
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                Storage Usage
              </Text>
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {formatFileSize(storageStats.usedSpace)} of {formatFileSize(storageStats.totalSpace)} used
              </Text>
            </VStack>
            <Text style={textStyles.h4} color={textColor} fontWeight="600">
              {getStorageUsagePercentage().toFixed(1)}%
            </Text>
          </HStack>
          
          <Progress
            value={getStorageUsagePercentage()}
            colorScheme={getStorageUsagePercentage() > 90 ? 'red' : getStorageUsagePercentage() > 70 ? 'yellow' : 'green'}
            size="sm"
          />
          
          <HStack space={4} justifyContent="space-between">
            <VStack alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {storageStats.fileCount}
              </Text>
              <Text style={textStyles.caption} color={colors.gray[600]}>
                Files
              </Text>
            </VStack>
            <VStack alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {storageStats.folderCount}
              </Text>
              <Text style={textStyles.caption} color={colors.gray[600]}>
                Folders
              </Text>
            </VStack>
            <VStack alignItems="center">
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {formatFileSize(storageStats.availableSpace)}
              </Text>
              <Text style={textStyles.caption} color={colors.gray[600]}>
                Available
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      {/* Breadcrumb */}
      {currentPath !== '/' && (
        <HStack space={2} mb={4} alignItems="center">
          <Pressable onPress={() => setCurrentPath('/')}>
            <Text style={textStyles.body} color={colors.primary[500]}>
              Home
            </Text>
          </Pressable>
          {currentPath.split('/').filter(Boolean).map((segment, index) => (
            <HStack key={index} space={2} alignItems="center">
              <Icon as={IconMC} name="chevron-right" size={4} color={colors.gray[400]} />
              <Pressable onPress={() => {
                const newPath = '/' + currentPath.split('/').slice(1, index + 2).join('/');
                setCurrentPath(newPath);
              }}>
                <Text style={textStyles.body} color={colors.primary[500]}>
                  {segment}
                </Text>
              </Pressable>
            </HStack>
          ))}
        </HStack>
      )}

      {/* Filter and Sort */}
      <HStack space={2} mb={4} flexWrap="wrap">
        {[
          { key: 'all', label: 'All', icon: 'folder-multiple' },
          { key: 'files', label: 'Files', icon: 'file' },
          { key: 'folders', label: 'Folders', icon: 'folder' },
          { key: 'shared', label: 'Shared', icon: 'share' },
        ].map((filter) => (
          <Pressable
            key={filter.key}
            onPress={() => setFilterType(filter.key as any)}
          >
            <Box
              bg={filterType === filter.key ? colors.primary[500] : cardBgColor}
              px={3}
              py={2}
              borderRadius={16}
              borderWidth={1}
              borderColor={filterType === filter.key ? colors.primary[500] : colors.gray[200]}
            >
              <HStack space={1} alignItems="center">
                <Icon
                  as={IconMC}
                  name={filter.icon as any}
                  size={3}
                  color={filterType === filter.key ? colors.white[500] : colors.gray[600]}
                />
                <Text
                  style={textStyles.caption}
                  color={filterType === filter.key ? colors.white[500] : colors.gray[600]}
                  fontWeight={filterType === filter.key ? '600' : '400'}
                >
                  {filter.label}
                </Text>
              </HStack>
            </Box>
          </Pressable>
        ))}
      </HStack>

      {/* Content */}
      {isLoading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color={colors.primary[500]} />
          <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
            Loading files...
          </Text>
        </Box>
      ) : (
        <FlatList
          data={getFilteredAndSortedFiles()}
          renderItem={renderFileItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListEmptyComponent={
            <Box alignItems="center" py={8}>
              <Icon
                as={IconMC}
                name="folder-open"
                size={12}
                color={colors.gray[400]}
                mb={3}
              />
              <Text style={textStyles.h4} color={colors.gray[600]} textAlign="center">
                No files found
              </Text>
              <Text style={textStyles.caption} color={colors.gray[500]} textAlign="center">
                Upload files or create folders to get started
              </Text>
            </Box>
          }
        />
      )}

      {/* Upload FAB */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="lg"
        icon={<FabIcon as={IconMC} name="upload" />}
        label={<FabLabel>Upload</FabLabel>}
        onPress={handleUploadFile}
        bg={colors.primary[500]}
        _pressed={{ bg: colors.primary[600] }}
      />

      {/* File Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack space={3} alignItems="center">
              <Icon
                as={IconMC}
                name={selectedFile ? getFileIcon(selectedFile) : 'file'}
                size={5}
                color={selectedFile ? getFileColor(selectedFile) : colors.primary[500]}
              />
              <VStack flex={1}>
                <Text style={textStyles.h3} color={textColor}>
                  {selectedFile?.name}
                </Text>
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {selectedFile && formatDate(selectedFile.updatedAt)}
                </Text>
              </VStack>
              <HStack space={2}>
                <IconButton
                  icon={<Icon as={IconMC} name={selectedFile?.isFavorite ? 'star' : 'star-outline'} size={5} />}
                  onPress={() => selectedFile && handleToggleFavorite(selectedFile.id)}
                  variant="ghost"
                  colorScheme="yellow"
                />
                <IconButton
                  icon={<Icon as={IconMC} name="delete" size={5} />}
                  onPress={() => selectedFile && handleDeleteFile(selectedFile.id)}
                  variant="ghost"
                  colorScheme="red"
                />
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedFile && (
              <VStack space={4}>
                <HStack space={4}>
                  <VStack>
                    <Text style={textStyles.caption} color={colors.gray[600]}>
                      Size
                    </Text>
                    <Text style={textStyles.body} color={textColor}>
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </VStack>
                  <VStack>
                    <Text style={textStyles.caption} color={colors.gray[600]}>
                      Type
                    </Text>
                    <Text style={textStyles.body} color={textColor}>
                      {selectedFile.type}
                    </Text>
                  </VStack>
                  <VStack>
                    <Text style={textStyles.caption} color={colors.gray[600]}>
                      Created
                    </Text>
                    <Text style={textStyles.body} color={textColor}>
                      {formatDate(selectedFile.createdAt)}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack space={2}>
                  {selectedFile.isShared && (
                    <Badge colorScheme="primary" variant="subtle">
                      Shared
                    </Badge>
                  )}
                  {selectedFile.isFavorite && (
                    <Badge colorScheme="yellow" variant="subtle">
                      Favorite
                    </Badge>
                  )}
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onClose}>
                Close
              </Button>
              <Button
                bg={colors.primary[500]}
                _pressed={{ bg: colors.primary[600] }}
                onPress={() => {
                  // TODO: Download file
                  Alert.alert('Download', 'Download feature coming soon!');
                }}
              >
                Download
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Folder Modal */}
      <Modal isOpen={isCreateFolderOpen} onClose={onCreateFolderClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              Create Folder
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Folder Name</Text>
                </FormControl.Label>
                <Input
                  value={folderForm.name}
                  onChangeText={(text) => setFolderForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter folder name"
                  size="lg"
                  borderRadius={12}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  <Text style={textStyles.h4} color={textColor}>Description (Optional)</Text>
                </FormControl.Label>
                <Input
                  value={folderForm.description}
                  onChangeText={(text) => setFolderForm(prev => ({ ...prev, description: text }))}
                  placeholder="Enter description"
                  size="lg"
                  borderRadius={12}
                  multiline
                  numberOfLines={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onCreateFolderClose}>
                Cancel
              </Button>
              <Button
                onPress={handleSaveFolder}
                isLoading={isLoading}
                bg={colors.primary[500]}
                _pressed={{ bg: colors.primary[600] }}
              >
                Create Folder
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StorageApp; 