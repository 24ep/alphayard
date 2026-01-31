import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface CircleOptionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSettingsPress: () => void;
  onSwitchCirclePress: () => void;
}

export const CircleOptionsDrawer: React.FC<CircleOptionsDrawerProps> = ({
  visible,
  onClose,
  onSettingsPress,
  onSwitchCirclePress,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Circle Options</Text>
          <TouchableOpacity onPress={onSettingsPress} style={styles.item}>
            <Text>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSwitchCirclePress} style={styles.item}>
            <Text>Switch Circle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text>Cancel</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
});

