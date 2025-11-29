import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { WALLET_ICONS } from '../../constants/home';

interface AddWalletModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  icon: string;
  color: string;
  targetValue: string;
  bankAccount: string;
  showBankAccount: boolean;
  onNameChange: (text: string) => void;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
  onTargetValueChange: (text: string) => void;
  onBankAccountChange: (text: string) => void;
  onToggleBankAccount: () => void;
  onSave: () => void;
}

const WALLET_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6B7280'
];

const AddWalletModal: React.FC<AddWalletModalProps> = ({
  visible,
  onClose,
  name,
  icon,
  color,
  targetValue,
  bankAccount,
  showBankAccount,
  onNameChange,
  onIconChange,
  onColorChange,
  onTargetValueChange,
  onBankAccountChange,
  onToggleBankAccount,
  onSave,
}) => {
  if (!visible) return null;

  return (
    <View style={homeStyles.modalOverlay}>
      <View style={homeStyles.modalContainer}>
        <View style={homeStyles.modalHeader}>
          <Text style={homeStyles.modalTitle}>Add New Wallet</Text>
          <TouchableOpacity onPress={onClose} style={homeStyles.modalCloseButton}>
            <IconMC name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={homeStyles.modalContent}>
          {/* Wallet Name */}
          <View style={homeStyles.modalSection}>
            <Text style={homeStyles.modalLabel}>Wallet Name</Text>
            <TextInput
              style={homeStyles.modalTextInput}
              placeholder="Enter wallet name"
              value={name}
              onChangeText={onNameChange}
            />
          </View>

          {/* Icon Selection */}
          <View style={homeStyles.modalSection}>
            <Text style={homeStyles.modalLabel}>Icon</Text>
            <View style={homeStyles.iconGrid}>
              {WALLET_ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    homeStyles.iconOption,
                    icon === iconName && homeStyles.iconOptionActive
                  ]}
                  onPress={() => onIconChange(iconName)}
                >
                  <IconMC
                    name={iconName}
                    size={24}
                    color={icon === iconName ? '#FFFFFF' : '#666666'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={homeStyles.modalSection}>
            <Text style={homeStyles.modalLabel}>Color</Text>
            <View style={homeStyles.colorGrid}>
              {WALLET_COLORS.map((colorValue) => (
                <TouchableOpacity
                  key={colorValue}
                  style={[
                    homeStyles.colorOption,
                    { backgroundColor: colorValue },
                    color === colorValue && homeStyles.colorOptionActive
                  ]}
                  onPress={() => onColorChange(colorValue)}
                />
              ))}
            </View>
          </View>

          {/* Target Value */}
          <View style={homeStyles.modalSection}>
            <Text style={homeStyles.modalLabel}>Target Value (optional)</Text>
            <TextInput
              style={homeStyles.modalTextInput}
              placeholder="Enter target amount"
              value={targetValue}
              onChangeText={onTargetValueChange}
              keyboardType="numeric"
            />
          </View>

          {/* Bank Account Toggle */}
          <View style={homeStyles.modalSection}>
            <TouchableOpacity
              style={homeStyles.toggleContainer}
              onPress={onToggleBankAccount}
            >
              <Text style={homeStyles.toggleLabel}>Link Bank Account</Text>
              <View style={[
                homeStyles.toggle,
                showBankAccount && homeStyles.toggleActive
              ]}>
                <View style={[
                  homeStyles.toggleThumb,
                  showBankAccount && homeStyles.toggleThumbActive
                ]} />
              </View>
            </TouchableOpacity>

            {showBankAccount && (
              <TextInput
                style={homeStyles.modalTextInput}
                placeholder="Enter bank account number"
                value={bankAccount}
                onChangeText={onBankAccountChange}
                keyboardType="numeric"
              />
            )}
          </View>
        </ScrollView>

        <View style={homeStyles.modalFooter}>
          <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
            <Text style={homeStyles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave} style={homeStyles.modalSaveButton}>
            <Text style={homeStyles.modalSaveText}>Save Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddWalletModal;
