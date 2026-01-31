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
  useDisclosure,
  Button,
  Input,
  FormControl,
  FormControlLabel,
  Select,
  CheckIcon,
  Divider,
  Spinner,
  FlatList,
  Avatar,
  Progress,
  Switch,
} from 'native-base';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import localizationService, { Language } from '../../services/localizationService';
import { useTranslation } from 'react-i18next';

interface LanguageSettingsProps {
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  onLanguageChange,
}) => {
  const { t } = useTranslation();
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translationProgress, setTranslationProgress] = useState<Record<string, number>>({});
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const cardBgColor = useColorModeValue(colors.gray[50], colors.gray[700]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);

  useEffect(() => {
    loadLanguageSettings();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      setIsLoading(true);
      
      const languages = await localizationService.getSupportedLanguages();
      const current = localizationService.getCurrentLanguage();
      const config = localizationService.getConfig();
      
      setSupportedLanguages(languages);
      setCurrentLanguage(current);
      setSelectedLanguage(current);
      setAutoDetect(config.autoDetect);
      
      // Calculate translation progress
      const progress: Record<string, number> = {};
      const missingKeys = localizationService.validateTranslations();
      
      languages.forEach(language => {
        if (language.code === config.defaultLanguage) {
          progress[language.code] = 100;
        } else {
          const missing = missingKeys[language.code] || [];
          const totalKeys = localizationService.getAllTranslationKeys().length;
          const translatedKeys = totalKeys - missing.length;
          progress[language.code] = Math.round((translatedKeys / totalKeys) * 100);
        }
      });
      
      setTranslationProgress(progress);
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      setIsLoading(true);
      await localizationService.setLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setSelectedLanguage(languageCode);
      onLanguageChange?.(languageCode);
      Alert.alert(t('common.success'), t('settings.languageSettings'));
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoDetectToggle = (enabled: boolean) => {
    setAutoDetect(enabled);
    localizationService.updateConfig({ autoDetect: enabled });
  };

  const handlePreviewLanguage = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onPreviewOpen();
  };

  const getLanguageInfo = (languageCode: string): Language | undefined => {
    return supportedLanguages.find(lang => lang.code === languageCode);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return colors.green[500];
    if (progress >= 70) return colors.yellow[500];
    return colors.red[500];
  };

  const renderLanguageItem = ({ item: language }: { item: Language }) => {
    const isCurrent = language.code === currentLanguage;
    const progress = translationProgress[language.code] || 0;
    
    return (
      <Pressable onPress={() => setSelectedLanguage(language.code)}>
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius={12}
          mb={3}
          borderWidth={2}
          borderColor={isCurrent ? colors.primary[500] : colors.gray[200]}
        >
          <HStack space={3} alignItems="center">
            <Text fontSize={24}>{language.flag_emoji}</Text>
            
            <VStack flex={1}>
              <HStack space={2} alignItems="center">
                <Text style={textStyles.h4} color={textColor} fontWeight="600">
                  {language.name}
                </Text>
                {isCurrent && (
                  <Badge colorScheme="primary" variant="solid" size="sm">
                    {t('common.current') || 'Current'}
                  </Badge>
                )}
              </HStack>
              
              <Text style={textStyles.caption} color={colors.gray[600]}>
                {language.native_name}
              </Text>
              
              <HStack space={2} mt={2} alignItems="center">
                <Progress
                  value={progress}
                  colorScheme={progress >= 90 ? 'green' : progress >= 70 ? 'yellow' : 'red'}
                  size="xs"
                  flex={1}
                />
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {progress}%
                </Text>
              </HStack>
            </VStack>
            
            <VStack space={2}>
              <IconButton
                icon={<Icon as={IconMC} name="eye" size={4} />}
                onPress={() => handlePreviewLanguage(language.code)}
                variant="ghost"
                size="sm"
                colorScheme="primary"
              />
              
              {!isCurrent && (
                <IconButton
                  icon={<Icon as={IconMC} name="check" size={4} />}
                  onPress={() => handleLanguageChange(language.code)}
                  variant="ghost"
                  size="sm"
                  colorScheme="success"
                />
              )}
            </VStack>
          </HStack>
        </Box>
      </Pressable>
    );
  };

  return (
    <Box>
      {/* Header */}
      <HStack space={3} alignItems="center" mb={4}>
        <Icon
          as={IconMC}
          name="translate"
          size={6}
          color={colors.primary[500]}
        />
        <VStack flex={1}>
          <Text style={textStyles.h3} color={textColor} fontWeight="600">
            {t('settings.languageSettings')}
          </Text>
          <Text style={textStyles.caption} color={colors.gray[600]}>
            {t('settings.selectLanguage')}
          </Text>
        </VStack>
      </HStack>

      {/* Auto-detect toggle */}
      <Box bg={cardBgColor} p={4} borderRadius={12} mb={4}>
        <HStack space={3} alignItems="center" justifyContent="space-between">
          <VStack flex={1}>
            <Text style={textStyles.h4} color={textColor} fontWeight="600">
              {t('settings.autoDetectLanguage')}
            </Text>
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {t('settings.language')}
            </Text>
          </VStack>
          <Switch
            isChecked={autoDetect}
            onToggle={handleAutoDetectToggle}
            colorScheme="success"
          />
        </HStack>
      </Box>

      {/* Current language info */}
      {currentLanguage && (
        <Box bg={cardBgColor} p={4} borderRadius={12} mb={4}>
          <HStack space={3} alignItems="center">
              <Text fontSize={24}>
                {getLanguageInfo(currentLanguage)?.flag_emoji}
              </Text>
            <VStack flex={1}>
              <Text style={textStyles.h4} color={textColor} fontWeight="600">
                {t('common.current') || 'Current'}
              </Text>
              <Text style={textStyles.body} color={textColor}>
                {getLanguageInfo(currentLanguage)?.name} ({getLanguageInfo(currentLanguage)?.native_name})
              </Text>
            </VStack>
            <Badge colorScheme="primary" variant="solid">
              {t('common.active') || 'Active'}
            </Badge>
          </HStack>
        </Box>
      )}

      {/* Supported languages */}
      <VStack space={3}>
        <HStack space={3} alignItems="center">
          <Icon as={IconMC} name="flag" size={5} color={colors.primary[500]} />
          <Text style={textStyles.h4} color={textColor} fontWeight="600">
            {t('settings.language')}
          </Text>
          <Badge colorScheme="gray" variant="subtle">
            {supportedLanguages.length}
          </Badge>
        </HStack>
        
        {isLoading ? (
          <Box alignItems="center" py={8}>
            <Spinner size="lg" color={colors.primary[500]} />
            <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
              {t('common.loading')}
            </Text>
          </Box>
        ) : (
          <FlatList
            data={supportedLanguages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Box alignItems="center" py={8}>
                <Icon
                  as={IconMC}
                  name="translate-off"
                  size={12}
                  color={colors.gray[400]}
                  mb={3}
                />
                <Text style={textStyles.h4} color={colors.gray[600]} textAlign="center">
                  {t('errors.notFound')}
                </Text>
                <Text style={textStyles.caption} color={colors.gray[500]} textAlign="center">
                  {t('errors.tryAgain')}
                </Text>
              </Box>
            }
          />
        )}
      </VStack>

      {/* Language Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack space={3} alignItems="center">
              <Text fontSize={24}>
                {getLanguageInfo(selectedLanguage)?.flag_emoji}
              </Text>
              <VStack>
                <Text style={textStyles.h3} color={textColor}>
                  {getLanguageInfo(selectedLanguage)?.name}
                </Text>
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {getLanguageInfo(selectedLanguage)?.native_name}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <Box>
                <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                  {t('settings.language')}
                </Text>
                <Text style={textStyles.body} color={textColor}>
                  {t('auth.welcomeSubtitle')}
                </Text>
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {t('navigation.home')} • {t('navigation.Circle')} • {t('navigation.settings')}
                </Text>
              </Box>
              
              <Box>
                <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                  {t('settings.dataUsage')}
                </Text>
                <HStack space={2} alignItems="center">
                  <Progress
                    value={translationProgress[selectedLanguage] || 0}
                    colorScheme={getProgressColor(translationProgress[selectedLanguage] || 0)}
                    flex={1}
                  />
                  <Text style={textStyles.body} color={textColor}>
                    {translationProgress[selectedLanguage] || 0}%
                  </Text>
                </HStack>
                <Text style={textStyles.caption} color={colors.gray[600]} mt={1}>
                  {(translationProgress[selectedLanguage] === 100 
                    ? t('common.success')
                    : t('errors.tryAgain'))}
                </Text>
              </Box>
              
              <Box>
                <Text style={textStyles.h4} color={textColor} fontWeight="600" mb={2}>
                  {t('settings.textDirection')}
                </Text>
                <HStack space={2} alignItems="center">
                  <Icon 
                    as={IconMC} 
                    name={getLanguageInfo(selectedLanguage)?.direction === 'rtl' ? 'format-textdirection-rtl' : 'format-textdirection-ltr'} 
                    size={5} 
                    color={colors.primary[500]} 
                  />
                  <Text style={textStyles.body} color={textColor}>
                    {getLanguageInfo(selectedLanguage)?.direction === 'rtl' ? 'Right-to-Left' : 'Left-to-Right'}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space={3}>
              <Button variant="ghost" onPress={onPreviewClose}>
                {t('common.close')}
              </Button>
              {selectedLanguage !== currentLanguage && (
                <Button
                  onPress={() => {
                    handleLanguageChange(selectedLanguage);
                    onPreviewClose();
                  }}
                  isLoading={isLoading}
                  bg={colors.primary[500]}
                  _pressed={{ bg: colors.primary[600] }}
                >
                  {t('common.confirm')}
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LanguageSettings; 
