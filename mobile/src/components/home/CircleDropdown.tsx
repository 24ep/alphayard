import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';

interface CircleDropdownProps {
  visible: boolean;
  onClose: () => void;
  selectedCircle: string;
  onCircleSelect: (circle: any) => void;
  availableFamilies: any[];
}

export const CircleDropdown: React.FC<CircleDropdownProps> = ({
  visible,
  onClose,
  selectedCircle,
  onCircleSelect,
  availableFamilies,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Circle</Text>
          <FlatList
            data={availableFamilies}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.item, selectedCircle === item.name && styles.selectedItem]}
                onPress={() => onCircleSelect(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id || item.name}
          />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    maxHeight: '60%',
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
  selectedItem: {
    backgroundColor: '#FFF0F0',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
});

