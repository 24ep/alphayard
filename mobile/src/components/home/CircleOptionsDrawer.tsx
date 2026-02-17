import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface CircleOptionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onInviteMember: () => void;
  onLeaveCircle: () => void;
  onChangeVisibility: () => void;
}

export const CircleOptionsDrawer: React.FC<CircleOptionsDrawerProps> = ({
  visible,
  onClose,
  onInviteMember,
  onLeaveCircle,
  onChangeVisibility,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.content}>
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          <Text style={styles.title}>Circle Options</Text>
          
          <TouchableOpacity onPress={onInviteMember} style={styles.item}>
            <View style={styles.itemContent}>
              <IconMC name="account-plus-outline" size={24} color="#3B82F6" />
              <Text style={styles.itemText}>Invite member</Text>
            </View>
            <IconMC name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onChangeVisibility} style={styles.item}>
            <View style={styles.itemContent}>
              <IconMC name="eye-outline" size={24} color="#6B7280" />
              <Text style={styles.itemText}>Change visibility</Text>
            </View>
            <IconMC name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onLeaveCircle} style={styles.item}>
            <View style={styles.itemContent}>
              <IconMC name="exit-to-app" size={24} color="#EF4444" />
              <Text style={[styles.itemText, styles.destructiveText]}>Leave circle</Text>
            </View>
            <IconMC name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: 'white',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  destructiveText: {
    color: '#EF4444',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

