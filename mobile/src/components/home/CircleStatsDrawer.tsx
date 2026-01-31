import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface CircleStatsDrawerProps {
  visible: boolean;
  onClose: () => void;
  currentCircle: any;
  onSwitchCircle: () => void;
}

export const CircleStatsDrawer: React.FC<CircleStatsDrawerProps> = ({
  visible,
  onClose,
  currentCircle,
  onSwitchCircle,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Circle Statistics</Text>
          <Text>{currentCircle?.name || 'No CircleSelected'}</Text>
          <TouchableOpacity onPress={onSwitchCircle} style={styles.button}>
            <Text>Switch Circle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text>Close</Text>
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
    minHeight: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FA7272',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
});

