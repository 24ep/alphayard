import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => Promise<void>;
  loading: boolean;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam', icon: 'email-alert' },
  { id: 'inappropriate', label: 'Inappropriate Content', icon: 'alert-circle' },
  { id: 'harassment', label: 'Harassment', icon: 'account-alert' },
  { id: 'violence', label: 'Violence', icon: 'shield-alert' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal' },
];

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) return;
    await onSubmit(selectedReason, description);
    // Reset state after successful submit (parent handles closing/error)
    setSelectedReason(null);
    setDescription('');
  };

  const handleClose = () => {
      setSelectedReason(null);
      setDescription('');
      onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Post</Text>
            <TouchableOpacity onPress={handleClose}>
              <IconMC name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Please select a reason for reporting this post. This helps us keep the community safe.
          </Text>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.option,
                  selectedReason === reason.id && styles.optionSelected
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconMC 
                    name={reason.icon} 
                    size={24} 
                    color={selectedReason === reason.id ? '#EF4444' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.optionText,
                    selectedReason === reason.id && styles.optionTextSelected
                  ]}>
                    {reason.label}
                  </Text>
                </View>
                {selectedReason === reason.id && (
                  <IconMC name="check-circle" size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            ))}

            {selectedReason === 'other' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Additional Details</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Please provide more details..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                  styles.submitButton, 
                  (!selectedReason || loading) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  content: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  optionSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#EF4444',
    fontWeight: '600',
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    height: 100,
  },
  footer: {
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  submitButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#FCA5A5',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
