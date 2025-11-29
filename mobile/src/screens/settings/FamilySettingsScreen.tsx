import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  Share,
  Clipboard,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoolIcon from '../../components/common/CoolIcon';
import * as ImagePicker from 'expo-image-picker';
import { familyApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { InlineWysiwygEditor } from '../../components/common/InlineWysiwygEditor';

const { width } = Dimensions.get('window');

interface FamilySettingsScreenProps {
  navigation: any;
}

interface FamilyData {
  id: string;
  name: string;
  story: string;
  logo?: string;
  inviteCode?: string;
  inviteCodeExpiry?: string;
}

export const FamilySettingsScreen: React.FC<FamilySettingsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [familyData, setFamilyData] = useState<FamilyData>({
    id: '',
    name: '',
    story: '',
    logo: '',
    inviteCode: '',
    inviteCodeExpiry: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [storyText, setStoryText] = useState('');

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      // const response = await familyApi.getFamilySettings();
      // For now, using mock data
      setFamilyData({
        id: '1',
        name: 'The Smith Family',
        story: 'Welcome to our family! We love spending time together and creating memories.',
        logo: '',
        inviteCode: '',
        inviteCodeExpiry: '',
      });
      setStoryText('Welcome to our family! We love spending time together and creating memories.');
    } catch (error) {
      console.error('Error loading family data:', error);
      Alert.alert('Error', 'Failed to load family settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFamilyName = async () => {
    if (!familyData.name.trim()) {
      Alert.alert('Error', 'Family name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      // API call to update family name
      // await familyApi.updateFamilyName(familyData.id, familyData.name);
      Alert.alert('Success', 'Family name updated successfully');
    } catch (error) {
      console.error('Error updating family name:', error);
      Alert.alert('Error', 'Failed to update family name');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFamilyStory = async () => {
    try {
      setSaving(true);
      // API call to update family story
      // await familyApi.updateFamilyStory(familyData.id, storyText);
      setFamilyData(prev => ({ ...prev, story: storyText }));
      Alert.alert('Success', 'Family story updated successfully');
    } catch (error) {
      console.error('Error updating family story:', error);
      Alert.alert('Error', 'Failed to update family story');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        // Upload image to server
        // const uploadedUrl = await familyApi.uploadFamilyLogo(familyData.id, imageUri);
        setFamilyData(prev => ({ ...prev, logo: imageUri }));
        Alert.alert('Success', 'Family logo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      Alert.alert('Error', 'Failed to upload family logo');
    }
  };

  const generateInviteCode = async () => {
    try {
      setSaving(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);

      // API call to generate invite code
      // await familyApi.generateInviteCode(familyData.id, code, expiryDate);
      
      setFamilyData(prev => ({
        ...prev,
        inviteCode: code,
        inviteCodeExpiry: expiryDate.toISOString(),
      }));
      
      Alert.alert('Success', 'Invite code generated successfully');
    } catch (error) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', 'Failed to generate invite code');
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = () => {
    if (familyData.inviteCode) {
      Clipboard.setString(familyData.inviteCode);
      Alert.alert('Copied', 'Invite code copied to clipboard');
    }
  };

  const shareInviteCode = async () => {
    if (familyData.inviteCode) {
      try {
        await Share.share({
          message: `Join our family on Bondarys! Use this code: ${familyData.inviteCode}`,
        });
      } catch (error) {
        console.error('Error sharing invite code:', error);
      }
    }
  };

  const sendInviteEmail = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      setSaving(true);
      // API call to send invite email
      // await familyApi.sendInviteEmail(familyData.id, inviteEmail);
      Alert.alert('Success', 'Invite sent successfully');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite');
    } finally {
      setSaving(false);
    }
  };

  const formatExpiryTime = (expiryDate: string) => {
    if (!expiryDate) return '';
    const date = new Date(expiryDate);
    const now = new Date();
    const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Expired';
    if (diffHours < 24) return `Expires in ${diffHours} hours`;
    return `Expires on ${date.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading family settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <CoolIcon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Family Logo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Logo</Text>
          <View style={styles.logoContainer}>
            {familyData.logo ? (
              <Image source={{ uri: familyData.logo }} style={styles.familyLogo} />
            ) : (
              <View style={styles.placeholderLogo}>
                <CoolIcon name="camera-plus" size={40} color="#9CA3AF" />
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={handleLogoUpload}>
            <CoolIcon name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Upload Logo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Family Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={familyData.name}
              onChangeText={(text) => setFamilyData(prev => ({ ...prev, name: text }))}
              placeholder="Enter family name"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveFamilyName}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Family Story Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Story</Text>
          <View style={styles.storyContainer}>
            <InlineWysiwygEditor
              value={storyText}
              onChange={setStoryText}
              placeholder="Tell your family's story... Share memories, traditions, and what makes your family special!"
              minHeight={150}
              maxHeight={300}
              showToolbar={true}
              editable={true}
            />
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveFamilyStory}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Story'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Invite Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite Members</Text>
          
          {/* Email Invite */}
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
          >
            <CoolIcon name="email-plus" size={20} color="#FFFFFF" />
            <Text style={styles.inviteButtonText}>Send Email Invite</Text>
          </TouchableOpacity>

          {/* Generate Code */}
          <TouchableOpacity
            style={[styles.inviteButton, styles.codeButton]}
            onPress={generateInviteCode}
            disabled={saving}
          >
            <CoolIcon name="qrcode" size={20} color="#FFFFFF" />
            <Text style={styles.inviteButtonText}>
              {saving ? 'Generating...' : 'Generate Invite Code'}
            </Text>
          </TouchableOpacity>

          {/* Display Invite Code */}
          {familyData.inviteCode && (
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>6-Digit Invite Code:</Text>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>{familyData.inviteCode}</Text>
                <View style={styles.codeActions}>
                  <TouchableOpacity style={styles.codeActionButton} onPress={copyInviteCode}>
                    <CoolIcon name="content-copy" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.codeActionButton} onPress={shareInviteCode}>
                    <CoolIcon name="share" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.expiryText}>
                {formatExpiryTime(familyData.inviteCodeExpiry || '')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Invite Email Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Email Invite</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowInviteModal(false)}
              >
                <CoolIcon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.emailInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Enter email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendInviteEmail}
                disabled={saving}
              >
                <Text style={styles.sendButtonText}>
                  {saving ? 'Sending...' : 'Send Invite'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
  },
  familyLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  placeholderLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB6C1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#FFB6C1',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  storyContainer: {
    gap: 12,
    flex: 1,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB6C1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
    gap: 8,
  },
  codeButton: {
    backgroundColor: '#9B59B6',
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  codeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeActionButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  expiryText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  sendButton: {
    backgroundColor: '#FFB6C1',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FamilySettingsScreen;
