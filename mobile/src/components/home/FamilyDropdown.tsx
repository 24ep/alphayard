import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface hourse {
  id: string;
  name: string;
  members: number;
}

interface FamilyDropdownProps {
  visible: boolean;
  onClose: () => void;
  selectedFamily: string;
  onFamilySelect: (familyName: string) => void;
  availableFamilies: hourse[];
}

export const FamilyDropdown: React.FC<FamilyDropdownProps> = ({
  visible,
  onClose,
  selectedFamily,
  onFamilySelect,
  availableFamilies,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={homeStyles.calendarDrawerOverlay}>
        <View style={homeStyles.calendarDrawerContainer}>
          <View style={homeStyles.familyDropdownHeader}>
            <Text style={homeStyles.familyDropdownTitle}>Select hourse</Text>
            <TouchableOpacity onPress={onClose}>
              <IconMC name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={homeStyles.familyDropdownList}>
            {availableFamilies.map((hourse) => (
              <TouchableOpacity
                key={hourse.id}
                style={[
                  homeStyles.familyDropdownItem,
                  selectedFamily === hourse.name && homeStyles.familyDropdownItemSelected
                ]}
                onPress={() => onFamilySelect(hourse.name)}
              >
                <View style={homeStyles.familyDropdownItemContent}>
                  <View style={homeStyles.familyDropdownItemLogo}>
                    <IconMC name="crown" size={24} color="#FFD700" />
                  </View>
                  <View style={homeStyles.familyDropdownItemInfo}>
                    <Text style={[
                      homeStyles.familyDropdownItemName,
                      selectedFamily === hourse.name && homeStyles.familyDropdownItemNameSelected
                    ]}>
                      {hourse.name}
                    </Text>
                    <Text style={homeStyles.familyDropdownItemMembers}>
                      {hourse.members} members
                    </Text>
                  </View>
                  {selectedFamily === hourse.name && (
                    <IconMC name="check" size={20} color="#FFB6C1" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
