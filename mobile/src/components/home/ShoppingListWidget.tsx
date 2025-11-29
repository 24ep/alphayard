import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { ShoppingItem } from '../../types/home';

interface ShoppingListWidgetProps {
  items: ShoppingItem[];
  onItemPress: (item: ShoppingItem) => void;
  onAddItem: () => void;
  onToggleComplete: (itemId: string) => void;
}

const ShoppingListWidget: React.FC<ShoppingListWidgetProps> = ({
  items,
  onItemPress,
  onAddItem,
  onToggleComplete,
}) => {
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  return (
    <View style={homeStyles.widgetContainer}>
      <View style={homeStyles.widgetHeader}>
        <View style={homeStyles.widgetTitleContainer}>
          <Text style={homeStyles.widgetTitle}>Shopping List</Text>
          <Text style={homeStyles.widgetSubtitle}>
            {completedCount}/{totalCount} completed
          </Text>
        </View>
        <TouchableOpacity onPress={onAddItem} style={homeStyles.addButton}>
          <IconMC name="plus" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.widgetScrollContent}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              homeStyles.shoppingItemCard,
              item.completed && homeStyles.shoppingItemCompleted
            ]}
            onPress={() => onItemPress(item)}
          >
            <View style={homeStyles.shoppingItemHeader}>
              <TouchableOpacity
                style={[
                  homeStyles.shoppingItemCheckbox,
                  item.completed && homeStyles.shoppingItemCheckboxCompleted
                ]}
                onPress={() => onToggleComplete(item.id)}
              >
                {item.completed && (
                  <IconMC name="check" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              
              <View style={homeStyles.shoppingItemInfo}>
                <Text style={[
                  homeStyles.shoppingItemName,
                  item.completed && homeStyles.shoppingItemNameCompleted
                ]}>
                  {item.item}
                </Text>
                <Text style={homeStyles.shoppingItemQuantity}>{item.quantity}</Text>
              </View>
            </View>
            
            <View style={homeStyles.shoppingItemFooter}>
              <Text style={homeStyles.shoppingItemCategory}>{item.category}</Text>
              <Text style={homeStyles.shoppingItemAssignee}>{item.assignedTo}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ShoppingListWidget;
