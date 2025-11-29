import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { REPORT_OPTIONS } from '../../constants/home';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: (reportType: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onReport,
}) => {
  if (!visible) return null;

  return (
    <View style={homeStyles.modalOverlay}>
      <View style={homeStyles.modalContainer}>
        <View style={homeStyles.modalHeader}>
          <Text style={homeStyles.modalTitle}>Report Post</Text>
          <TouchableOpacity onPress={onClose} style={homeStyles.modalCloseButton}>
            <IconMC name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={homeStyles.modalContent}>
          <Text style={homeStyles.modalDescription}>
            Please select a reason for reporting this post. This helps us keep our community safe.
          </Text>

          <View style={homeStyles.reportOptionsContainer}>
            {REPORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={homeStyles.reportOptionItem}
                onPress={() => onReport(option.id)}
              >
                <View style={homeStyles.reportOptionIcon}>
                  <IconMC name={option.icon} size={24} color="#666666" />
                </View>
                <View style={homeStyles.reportOptionContent}>
                  <Text style={homeStyles.reportOptionTitle}>{option.title}</Text>
                  <Text style={homeStyles.reportOptionDescription}>
                    {option.description}
                  </Text>
                </View>
                <IconMC name="chevron-right" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={homeStyles.modalFooter}>
          <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
            <Text style={homeStyles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ReportModal;
