import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface ShoppingItem {
  id: string;
  item: string;
  quantity: string;
  category: string;
  completed: boolean;
  list?: string; // Optional list name (e.g., Groceries, Pharmacy)
}

interface ShoppingListProps {
  items: ShoppingItem[];
}

interface CategoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  categoryName: string;
  items: ShoppingItem[];
  gradientColors: string[];
}

const getItemIcon = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'dairy':
      return 'bottle-soda';
    case 'bakery':
      return 'bread-slice';
    case 'produce':
      return 'apple';
    case 'meat':
      return 'food-drumstick';
    case 'frozen':
      return 'snowflake';
    case 'pantry':
      return 'package-variant';
    case 'beverages':
      return 'cup';
    case 'snacks':
      return 'cookie';
    case 'pharmacy':
      return 'medical-bag';
    case 'electronics':
      return 'cellphone';
    case 'clothing':
      return 'tshirt-crew';
    case 'books':
      return 'book-open';
    case 'toys':
      return 'toy-brick';
    case 'home':
      return 'home';
    case 'garden':
      return 'flower';
    case 'sports':
      return 'soccer';
    case 'beauty':
      return 'face-woman';
    case 'automotive':
      return 'car';
    case 'office':
      return 'briefcase';
    case 'jewelry':
      return 'diamond';
    case 'pets':
      return 'dog';
    case 'baby':
      return 'baby-face';
    case 'health':
      return 'heart-pulse';
    case 'travel':
      return 'airplane';
    case 'music':
      return 'music';
    case 'movies':
      return 'movie';
    case 'games':
      return 'gamepad-variant';
    case 'tools':
      return 'hammer-screwdriver';
    default:
      return 'shopping';
  }
};

const getCategoryGradient = (category: string): string[] => {
  switch (category.toLowerCase()) {
    case 'dairy':
      return ['#E3F2FD', '#BBDEFB'];
    case 'bakery':
      return ['#FFF3E0', '#FFE0B2'];
    case 'produce':
      return ['#E8F5E8', '#C8E6C9'];
    case 'meat':
      return ['#FFEBEE', '#FFCDD2'];
    case 'frozen':
      return ['#E1F5FE', '#B3E5FC'];
    case 'pantry':
      return ['#F3E5F5', '#E1BEE7'];
    case 'beverages':
      return ['#E0F2F1', '#B2DFDB'];
    case 'snacks':
      return ['#FFF8E1', '#FFECB3'];
    case 'pharmacy':
      return ['#FCE4EC', '#F8BBD9'];
    case 'electronics':
      return ['#E8EAF6', '#C5CAE9'];
    case 'clothing':
      return ['#F1F8E9', '#DCEDC8'];
    case 'books':
      return ['#FFFDE7', '#FFF9C4'];
    case 'toys':
      return ['#FFE0B2', '#FFCC80'];
    case 'home':
      return ['#E0F2F1', '#B2DFDB'];
    case 'garden':
      return ['#E8F5E8', '#C8E6C9'];
    case 'sports':
      return ['#E3F2FD', '#BBDEFB'];
    case 'beauty':
      return ['#FCE4EC', '#F8BBD9'];
    case 'automotive':
      return ['#F3E5F5', '#E1BEE7'];
    case 'office':
      return ['#E8EAF6', '#C5CAE9'];
    case 'jewelry':
      return ['#FFF8E1', '#FFECB3'];
    case 'pets':
      return ['#F1F8E9', '#DCEDC8'];
    case 'baby':
      return ['#FFE0B2', '#FFCC80'];
    case 'health':
      return ['#FFEBEE', '#FFCDD2'];
    case 'travel':
      return ['#E1F5FE', '#B3E5FC'];
    case 'music':
      return ['#F3E5F5', '#E1BEE7'];
    case 'movies':
      return ['#E8EAF6', '#C5CAE9'];
    case 'games':
      return ['#FFF3E0', '#FFE0B2'];
    case 'tools':
      return ['#F5F5F5', '#E0E0E0'];
    default:
      return ['#F5F5F5', '#E0E0E0'];
  }
};

const CategoryDrawer: React.FC<CategoryDrawerProps> = ({ visible, onClose, categoryName, items, gradientColors }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={homeStyles.categoryDrawerOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={homeStyles.categoryDrawerContainer}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={homeStyles.categoryDrawerHeader}
          >
            <View style={homeStyles.categoryDrawerHeaderContent}>
              <View style={homeStyles.categoryDrawerTitleRow}>
                <View style={homeStyles.categoryDrawerIcon}>
                  <IconMC name={getItemIcon(categoryName)} size={24} color="#FFFFFF" />
                </View>
                <View style={homeStyles.categoryDrawerTitleContainer}>
                  <Text style={homeStyles.categoryDrawerTitle}>{categoryName}</Text>
                  <Text style={homeStyles.categoryDrawerSubtitle}>{items.length} items</Text>
                </View>
              </View>
              <TouchableOpacity style={homeStyles.categoryDrawerCloseButton} onPress={onClose}>
                <IconMC name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          <ScrollView style={homeStyles.categoryDrawerContent}>
            {items.map((item) => (
              <View key={item.id} style={homeStyles.categoryDrawerItem}>
                <View style={homeStyles.categoryDrawerItemLeft}>
                  <View style={[
                    homeStyles.categoryDrawerItemIcon,
                    item.completed && homeStyles.categoryDrawerItemIconCompleted
                  ]}>
                    <IconMC 
                      name={item.completed ? "check" : getItemIcon(item.category)} 
                      size={20} 
                      color={item.completed ? "#FFFFFF" : "#6B7280"} 
                    />
                  </View>
                </View>
                <View style={homeStyles.categoryDrawerItemContent}>
                  <Text style={[
                    homeStyles.categoryDrawerItemName,
                    item.completed && homeStyles.categoryDrawerItemNameCompleted
                  ]}>
                    {item.item}
                  </Text>
                  <Text style={homeStyles.categoryDrawerItemDescription}>
                    {item.category} • Quantity: {item.quantity}
                  </Text>
                </View>
                <View style={homeStyles.categoryDrawerItemRight}>
                  <Text style={[
                    homeStyles.categoryDrawerItemQuantity,
                    item.completed && homeStyles.categoryDrawerItemQuantityCompleted
                  ]}>
                    x{item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const ShoppingList: React.FC<ShoppingListProps> = ({ items }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  if (!items || !Array.isArray(items)) {
    return null;
  }

  // Create placeholder products to ensure minimum 22 items
  const placeholderProducts: ShoppingItem[] = [
    { id: 'p1', item: 'Medicine', category: 'pharmacy', quantity: '1', completed: false },
    { id: 'p2', item: 'Phone', category: 'electronics', quantity: '1', completed: false },
    { id: 'p3', item: 'Shirt', category: 'clothing', quantity: '2', completed: false },
    { id: 'p4', item: 'Novel', category: 'books', quantity: '1', completed: false },
    { id: 'p5', item: 'Toy Car', category: 'toys', quantity: '1', completed: false },
    { id: 'p6', item: 'Lamp', category: 'home', quantity: '1', completed: false },
    { id: 'p7', item: 'Seeds', category: 'garden', quantity: '1', completed: false },
    { id: 'p8', item: 'Ball', category: 'sports', quantity: '1', completed: false },
    { id: 'p9', item: 'Lipstick', category: 'beauty', quantity: '1', completed: false },
    { id: 'p10', item: 'Oil', category: 'automotive', quantity: '1', completed: false },
    { id: 'p11', item: 'Pen', category: 'office', quantity: '3', completed: false },
    { id: 'p12', item: 'Ring', category: 'jewelry', quantity: '1', completed: false },
    { id: 'p13', item: 'Food', category: 'pets', quantity: '1', completed: false },
    { id: 'p14', item: 'Diapers', category: 'baby', quantity: '1', completed: false },
    { id: 'p15', item: 'Vitamins', category: 'health', quantity: '1', completed: false },
    { id: 'p16', item: 'Suitcase', category: 'travel', quantity: '1', completed: false },
    { id: 'p17', item: 'Headphones', category: 'music', quantity: '1', completed: false },
    { id: 'p18', item: 'DVD', category: 'movies', quantity: '1', completed: false },
    { id: 'p19', item: 'Controller', category: 'games', quantity: '1', completed: false },
    { id: 'p20', item: 'Screwdriver', category: 'tools', quantity: '1', completed: false },
    { id: 'p21', item: 'Candle', category: 'home', quantity: '2', completed: false },
    { id: 'p22', item: 'Notebook', category: 'office', quantity: '1', completed: false },
  ];

  // Build category summaries for wide cards
  const categoryToItems = items.reduce((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [] as ShoppingItem[];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const categoryMeta: Record<string, { location: string; actionDate: string; displayName?: string }> = {
    meat: { location: 'Butcher Shop', actionDate: 'Today 6:00 PM' },
    produce: { location: 'Farmer\'s Market', actionDate: 'Tomorrow 10:00 AM', displayName: 'Vegetables & Fruits' },
    pantry: { location: 'Supermarket', actionDate: 'This Weekend' },
    bakery: { location: 'Bakery', actionDate: 'Today 5:00 PM' },
    beverages: { location: 'Supermarket', actionDate: 'This Weekend' },
    snacks: { location: 'Supermarket', actionDate: 'This Weekend' },
    frozen: { location: 'Supermarket', actionDate: 'This Weekend' },
    dairy: { location: 'Supermarket', actionDate: 'This Weekend' },
    pharmacy: { location: 'Pharmacy', actionDate: 'Today 7:00 PM' },
    electronics: { location: 'Electronics Store', actionDate: 'Next Week' },
    clothing: { location: 'Mall', actionDate: 'This Weekend' },
    books: { location: 'Bookstore', actionDate: 'This Weekend' },
    toys: { location: 'Toy Store', actionDate: 'This Weekend' },
    home: { location: 'Home Goods', actionDate: 'Next Week' },
    garden: { location: 'Garden Center', actionDate: 'Saturday 11:00 AM' },
    sports: { location: 'Sports Store', actionDate: 'This Weekend' },
    beauty: { location: 'Cosmetics Store', actionDate: 'This Weekend' },
    automotive: { location: 'Auto Parts', actionDate: 'Next Week' },
    office: { location: 'Stationery Shop', actionDate: 'This Weekend' },
    jewelry: { location: 'Jewelry Store', actionDate: 'Next Week' },
    pets: { location: 'Pet Store', actionDate: 'This Weekend' },
    baby: { location: 'Baby Store', actionDate: 'This Weekend' },
    health: { location: 'Pharmacy', actionDate: 'Today 7:00 PM' },
    travel: { location: 'Travel Store', actionDate: 'Next Month' },
    music: { location: 'Music Store', actionDate: 'Next Week' },
    movies: { location: 'Online', actionDate: 'Anytime' },
    games: { location: 'Game Store', actionDate: 'This Weekend' },
    tools: { location: 'Hardware Store', actionDate: 'Saturday 2:00 PM' },
  };

  const handleProductPress = (product: ShoppingItem) => {
    // Group items by category for the drawer
    const categories = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);
    
    setSelectedCategory(product.category);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedCategory(null);
  };

  const categoryEntries = Object.entries(categoryToItems).sort((a, b) => b[1].length - a[1].length);

  return (
    <View style={homeStyles.shoppingListContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={homeStyles.shoppingCategoryScroll}
        contentContainerStyle={homeStyles.shoppingCategoryContent}
      >
        {categoryEntries.map(([category, catItems]) => (
          <TouchableOpacity
            key={category}
            style={homeStyles.shoppingCategoryCard}
            onPress={() => handleProductPress({ id: 'cat', item: '', quantity: '0', category, completed: false })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={getCategoryGradient(category)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={homeStyles.shoppingCategoryCardGradient}
            >
              <View style={homeStyles.shoppingCategoryLeft}>
                <View style={homeStyles.shoppingCategoryIconWrap}>
                  <IconMC name={getItemIcon(category)} size={20} color="#FFFFFF" />
                </View>
                <View style={homeStyles.shoppingCategoryText}>
                  <Text style={homeStyles.shoppingCategoryTitle} numberOfLines={1}>
                    {categoryMeta[category]?.displayName || category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <Text style={homeStyles.shoppingCategorySubtitle}>
                    {catItems.length} items
                  </Text>
                </View>
              </View>
              <View style={homeStyles.shoppingCategoryRight}>
                <View style={homeStyles.shoppingCategoryMetaRow}>
                  <IconMC name="map-marker" size={14} color="#FFFFFF" />
                  <Text style={homeStyles.shoppingCategoryMetaText} numberOfLines={1}>
                    {categoryMeta[category]?.location || 'Store'}
                  </Text>
                </View>
                <View style={homeStyles.shoppingCategoryMetaRow}>
                  <IconMC name="calendar" size={14} color="#FFFFFF" />
                  <Text style={homeStyles.shoppingCategoryMetaText} numberOfLines={1}>
                    {categoryMeta[category]?.actionDate || 'Soon'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory && (
        <CategoryDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          categoryName={selectedCategory}
          items={items.filter(item => item.category === selectedCategory)}
          gradientColors={getCategoryGradient(selectedCategory)}
        />
      )}
    </View>
  );
};
