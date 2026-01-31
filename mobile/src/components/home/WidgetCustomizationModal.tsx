import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface WidgetType {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  category: string;
}

interface WidgetCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  widgets: WidgetType[];
  onToggleWidget: (widgetId: string) => void;
  onSave: (widgets: WidgetType[]) => void;
}

const WidgetCustomizationModal: React.FC<WidgetCustomizationModalProps> = ({
  visible,
  onClose,
  widgets,
  onToggleWidget,
  onSave,
}) => {
  const [localWidgets, setLocalWidgets] = useState<WidgetType[]>(widgets);

  const handleToggleWidget = (widgetId: string) => {
    const updatedWidgets = localWidgets.map(widget =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    setLocalWidgets(updatedWidgets);
    onToggleWidget(widgetId);
  };

  const handleSave = () => {
    onSave(localWidgets);
    onClose();
  };

  const categories = [
    { id: 'Circle', name: 'Circle', icon: 'account-group' },
    { id: 'productivity', name: 'Productivity', icon: 'briefcase' },
    { id: 'social', name: 'Social', icon: 'account-multiple' },
    { id: 'health', name: 'Health', icon: 'heart-pulse' },
    { id: 'finance', name: 'Finance', icon: 'wallet' },
  ];

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
            <Text style={homeStyles.modalTitle}>Customize Widgets</Text>
            <TouchableOpacity onPress={onClose} style={homeStyles.modalCloseButton}>
              <IconMC name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={homeStyles.modalContent}>
            {categories.map((category) => {
              const categoryWidgets = localWidgets.filter(w => w.category === category.id);
              
              return (
                <View key={category.id} style={homeStyles.modalSection}>
                  <View style={homeStyles.categoryHeader}>
                    <IconMC name={category.icon} size={20} color="#4F46E5" />
                    <Text style={homeStyles.categoryTitle}>{category.name}</Text>
                  </View>
                  
                  {categoryWidgets.map((widget) => (
                    <TouchableOpacity
                      key={widget.id}
                      style={[
                        homeStyles.widgetOption,
                        widget.enabled && homeStyles.widgetOptionActive
                      ]}
                      onPress={() => handleToggleWidget(widget.id)}
                    >
                      <View style={homeStyles.widgetOptionContent}>
                        <IconMC name={widget.icon} size={24} color="#4F46E5" />
                        <Text style={homeStyles.widgetOptionName}>{widget.name}</Text>
                      </View>
                      
                      <View style={[
                        homeStyles.toggle,
                        widget.enabled && homeStyles.toggleActive
                      ]}>
                        <View style={[
                          homeStyles.toggleThumb,
                          widget.enabled && homeStyles.toggleThumbActive
                        ]} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={homeStyles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={homeStyles.modalCancelButton}>
              <Text style={homeStyles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={homeStyles.modalSaveButton}>
              <Text style={homeStyles.modalSaveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WidgetCustomizationModal;

