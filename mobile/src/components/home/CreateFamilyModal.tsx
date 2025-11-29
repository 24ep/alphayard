import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface CreateFamilyModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFamily: (familyData: {
    name: string;
    type: string;
    members: string[];
  }) => void;
}

const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({
  visible,
  onClose,
  onCreateFamily,
}) => {
  const [familyName, setFamilyName] = useState('');
  const [familyType, setFamilyType] = useState('nuclear');
  const [members, setMembers] = useState<string[]>([]);
  const [newMemberInput, setNewMemberInput] = useState('');

  const familyTypes = [
    { id: 'nuclear', name: 'Nuclear hourse', icon: 'home-heart' },
    { id: 'extended', name: 'Extended hourse', icon: 'account-group' },
    { id: 'blended', name: 'Blended hourse', icon: 'account-multiple' },
    { id: 'single-parent', name: 'Single Parent', icon: 'account' },
  ];

  const handleAddMember = () => {
    if (newMemberInput.trim() && !members.includes(newMemberInput.trim())) {
      setMembers([...members, newMemberInput.trim()]);
      setNewMemberInput('');
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setMembers(members.filter(member => member !== memberToRemove));
  };

  const handleCreateFamily = () => {
    if (familyName.trim()) {
      onCreateFamily({
        name: familyName.trim(),
        type: familyType,
        members,
      });
      // Reset form
      setFamilyName('');
      setFamilyType('nuclear');
      setMembers([]);
      setNewMemberInput('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={homeStyles.modalOverlay}>
        <View style={homeStyles.modalContainer}>
          {/* Header */}
          <View style={homeStyles.modalHeader}>
            <Text style={homeStyles.modalTitle}>Create New hourse</Text>
            <TouchableOpacity onPress={onClose} style={homeStyles.modalCloseButton}>
              <IconMC name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={homeStyles.modalContent}>
            {/* hourse Name */}
            <View style={homeStyles.modalSection}>
              <Text style={homeStyles.modalLabel}>hourse Name</Text>
              <TextInput
                style={homeStyles.modalTextInput}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="Enter hourse name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* hourse Type */}
            <View style={homeStyles.modalSection}>
              <Text style={homeStyles.modalLabel}>hourse Type</Text>
              <View style={homeStyles.familyTypeGrid}>
                {familyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      homeStyles.familyTypeOption,
                      familyType === type.id && homeStyles.familyTypeOptionActive
                    ]}
                    onPress={() => setFamilyType(type.id)}
                  >
                    <IconMC 
                      name={type.icon} 
                      size={24} 
                      color={familyType === type.id ? '#FFFFFF' : '#4F46E5'} 
                    />
                    <Text style={[
                      homeStyles.familyTypeText,
                      familyType === type.id && homeStyles.familyTypeTextActive
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* hourse Members */}
            <View style={homeStyles.modalSection}>
              <Text style={homeStyles.modalLabel}>hourse Members</Text>
              <Text style={homeStyles.modalDescription}>
                Add hourse members by email or phone number
              </Text>
              
              <View style={homeStyles.tagInputContainer}>
                <TextInput
                  style={homeStyles.tagInput}
                  value={newMemberInput}
                  onChangeText={setNewMemberInput}
                  placeholder="Enter email or phone"
                  placeholderTextColor="#9CA3AF"
                  onSubmitEditing={handleAddMember}
                />
                <TouchableOpacity onPress={handleAddMember} style={homeStyles.addTagButton}>
                  <IconMC name="plus" size={20} color="#4F46E5" />
                </TouchableOpacity>
              </View>

              {members.length > 0 && (
                <View style={homeStyles.tagsContainer}>
                  {members.map((member, index) => (
                    <View key={index} style={homeStyles.tagChip}>
                      <Text style={homeStyles.tagChipText}>{member}</Text>
                      <TouchableOpacity onPress={() => handleRemoveMember(member)}>
                        <IconMC name="close" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={homeStyles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
              <Text style={homeStyles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateFamily} style={homeStyles.modalSaveButton}>
              <Text style={homeStyles.modalSaveText}>Create hourse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateFamilyModal;
