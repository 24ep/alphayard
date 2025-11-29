import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { locationSearchService, LocationDetails } from '../../services/locationSearchService';
import { familyService, FamilyMember } from '../../services/familyService';
import { categoryService, Category } from '../../services/categoryService';

interface ShoppingItem {
  id: string;
  item: string;
  quantity: string;
  category: string;
  completed: boolean;
  location?: string;
  targetDate?: string;
  assignedTo?: string;
}

interface ShoppingDrawerProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: ShoppingItem) => void;
}

const CATEGORIES = [
  { key: 'dairy', name: 'Dairy', icon: 'bottle-soda', color: ['#E3F2FD', '#BBDEFB'] },
  { key: 'bakery', name: 'Bakery', icon: 'bread-slice', color: ['#FFF3E0', '#FFE0B2'] },
  { key: 'produce', name: 'Produce', icon: 'apple', color: ['#E8F5E8', '#C8E6C9'] },
  { key: 'meat', name: 'Meat', icon: 'food-drumstick', color: ['#FFEBEE', '#FFCDD2'] },
  { key: 'frozen', name: 'Frozen', icon: 'snowflake', color: ['#E1F5FE', '#B3E5FC'] },
  { key: 'pantry', name: 'Pantry', icon: 'package-variant', color: ['#F3E5F5', '#E1BEE7'] },
  { key: 'beverages', name: 'Beverages', icon: 'cup', color: ['#E0F2F1', '#B2DFDB'] },
  { key: 'snacks', name: 'Snacks', icon: 'cookie', color: ['#FFF8E1', '#FFECB3'] },
  { key: 'pharmacy', name: 'Pharmacy', icon: 'medical-bag', color: ['#FCE4EC', '#F8BBD9'] },
  { key: 'electronics', name: 'Electronics', icon: 'cellphone', color: ['#E8EAF6', '#C5CAE9'] },
  { key: 'clothing', name: 'Clothing', icon: 'tshirt-crew', color: ['#F1F8E9', '#DCEDC8'] },
  { key: 'books', name: 'Books', icon: 'book-open', color: ['#FFFDE7', '#FFF9C4'] },
  { key: 'toys', name: 'Toys', icon: 'toy-brick', color: ['#FFE0B2', '#FFCC80'] },
  { key: 'home', name: 'Home', icon: 'home', color: ['#E0F2F1', '#B2DFDB'] },
  { key: 'garden', name: 'Garden', icon: 'flower', color: ['#E8F5E8', '#C8E6C9'] },
  { key: 'sports', name: 'Sports', icon: 'soccer', color: ['#E3F2FD', '#BBDEFB'] },
  { key: 'beauty', name: 'Beauty', icon: 'face-woman', color: ['#FCE4EC', '#F8BBD9'] },
  { key: 'automotive', name: 'Automotive', icon: 'car', color: ['#F3E5F5', '#E1BEE7'] },
  { key: 'office', name: 'Office', icon: 'briefcase', color: ['#E8EAF6', '#C5CAE9'] },
  { key: 'jewelry', name: 'Jewelry', icon: 'diamond', color: ['#FFF8E1', '#FFECB3'] },
  { key: 'pets', name: 'Pets', icon: 'dog', color: ['#F1F8E9', '#DCEDC8'] },
  { key: 'baby', name: 'Baby', icon: 'baby-face', color: ['#FFE0B2', '#FFCC80'] },
  { key: 'health', name: 'Health', icon: 'heart-pulse', color: ['#FFEBEE', '#FFCDD2'] },
  { key: 'travel', name: 'Travel', icon: 'airplane', color: ['#E1F5FE', '#B3E5FC'] },
  { key: 'music', name: 'Music', icon: 'music', color: ['#F3E5F5', '#E1BEE7'] },
  { key: 'movies', name: 'Movies', icon: 'movie', color: ['#E8EAF6', '#C5CAE9'] },
  { key: 'games', name: 'Games', icon: 'gamepad-variant', color: ['#FFF3E0', '#FFE0B2'] },
  { key: 'tools', name: 'Tools', icon: 'hammer-screwdriver', color: ['#F5F5F5', '#E0E0E0'] },
];

const LOCATIONS = [
  'Supermarket',
  'Pharmacy',
  'Electronics Store',
  'Mall',
  'Bookstore',
  'Toy Store',
  'Home Goods',
  'Garden Center',
  'Sports Store',
  'Cosmetics Store',
  'Auto Parts',
  'Stationery Shop',
  'Jewelry Store',
  'Pet Store',
  'Baby Store',
  'Hardware Store',
  'Online',
  'Other'
];

const FAMILY_MEMBERS = [
  'You',
  'Mom',
  'Dad',
  'Sister',
  'Brother',
  'Grandma',
  'Grandpa',
  'Uncle',
  'Aunt',
  'Cousin'
];

const TARGET_DATES = [
  'Today',
  'Tomorrow',
  'This Weekend',
  'Next Week',
  'Next Month',
  'Custom Date'
];

export const ShoppingDrawer: React.FC<ShoppingDrawerProps> = ({
  visible,
  onClose,
  onAddItem
}) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTargetDate, setSelectedTargetDate] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [customDate, setCustomDate] = useState('');

  // Location search states
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<LocationDetails[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationResults, setShowLocationResults] = useState(false);

  // Category search states
  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryResults, setCategoryResults] = useState<Category[]>([]);
  const [showCategoryResults, setShowCategoryResults] = useState(false);

  // hourse member states
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<FamilyMember[]>([]);
  const [showMemberResults, setShowMemberResults] = useState(false);

  // Initialize hourse members
  useEffect(() => {
    if (visible) {
      const members = familyService.getFamilyMembers();
      setFamilyMembers(members);
      setMemberResults(members);
    }
  }, [visible]);

  // Location search effect
  useEffect(() => {
    if (locationQuery.trim()) {
      setIsSearchingLocation(true);
      const searchTimeout = setTimeout(async () => {
        try {
          const results = await locationSearchService.searchLocations(locationQuery);
          setLocationResults(results);
          setShowLocationResults(true);
        } catch (error) {
          console.error('Location search error:', error);
        } finally {
          setIsSearchingLocation(false);
        }
      }, 500);

      return () => clearTimeout(searchTimeout);
    } else {
      setLocationResults([]);
      setShowLocationResults(false);
    }
  }, [locationQuery]);

  // Category search effect
  useEffect(() => {
    if (categoryQuery.trim()) {
      const results = categoryService.searchCategories(categoryQuery);
      setCategoryResults(results);
      setShowCategoryResults(true);
    } else {
      const popularCategories = categoryService.getPopularCategories();
      setCategoryResults(popularCategories);
      setShowCategoryResults(false);
    }
  }, [categoryQuery]);

  // hourse member search effect
  useEffect(() => {
    if (memberQuery.trim()) {
      const results = familyService.searchFamilyMembers(memberQuery);
      setMemberResults(results);
      setShowMemberResults(true);
    } else {
      setMemberResults(familyMembers);
      setShowMemberResults(false);
    }
  }, [memberQuery, familyMembers]);

  const handleAddItem = () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      item: itemName.trim(),
      quantity: quantity || '1',
      category: selectedCategory,
      completed: false,
      location: selectedLocation || undefined,
      targetDate: selectedTargetDate === 'Custom Date' ? customDate : selectedTargetDate || undefined,
      assignedTo: selectedAssignee || undefined,
    };

    onAddItem(newItem);
    
    // Reset form
    setItemName('');
    setQuantity('1');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedTargetDate('');
    setSelectedAssignee('');
    setCustomDate('');
    setLocationQuery('');
    setCategoryQuery('');
    setMemberQuery('');
    setShowLocationResults(false);
    setShowCategoryResults(false);
    setShowMemberResults(false);
  };

  const handleLocationSelect = (location: LocationDetails) => {
    setSelectedLocation(location.name);
    setLocationQuery(location.name);
    setShowLocationResults(false);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.id);
    setCategoryQuery(category.name);
    setShowCategoryResults(false);
  };

  const handleMemberSelect = (member: FamilyMember) => {
    setSelectedAssignee(member.name);
    setMemberQuery(member.name);
    setShowMemberResults(false);
  };

  const selectedCategoryData = CATEGORIES.find(cat => cat.key === selectedCategory);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={homeStyles.shoppingDrawerOverlay}>
        <View style={homeStyles.shoppingDrawerContainer}>
          {/* Header */}
          <LinearGradient
            colors={selectedCategoryData?.color || ['#FFB6C1', '#FF69B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={homeStyles.shoppingDrawerHeader}
          >
            <View style={homeStyles.shoppingDrawerHeaderContent}>
              <View style={homeStyles.shoppingDrawerTitleRow}>
                <View style={homeStyles.shoppingDrawerIcon}>
                  <IconMC 
                    name={selectedCategoryData?.icon || 'shopping'} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={homeStyles.shoppingDrawerTitleContainer}>
                  <Text style={homeStyles.shoppingDrawerTitle}>Add Shopping Item</Text>
                  <Text style={homeStyles.shoppingDrawerSubtitle}>
                    {selectedCategoryData?.name || 'Select a category'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={homeStyles.shoppingDrawerCloseButton} onPress={onClose}>
                <IconMC name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={homeStyles.shoppingDrawerContent}>
            {/* Item Name */}
            <View style={homeStyles.shoppingDrawerField}>
              <Text style={homeStyles.shoppingDrawerFieldLabel}>Item Name *</Text>
              <TextInput
                style={homeStyles.shoppingDrawerInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Enter item name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Quantity */}
            <View style={homeStyles.shoppingDrawerField}>
              <Text style={homeStyles.shoppingDrawerFieldLabel}>Quantity</Text>
              <TextInput
                style={homeStyles.shoppingDrawerInput}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            {/* Category Search */}
            <View style={homeStyles.shoppingDrawerField}>
              <Text style={homeStyles.shoppingDrawerFieldLabel}>Category *</Text>
              <View style={homeStyles.shoppingDrawerSearchContainer}>
                <TextInput
                  style={homeStyles.shoppingDrawerSearchInput}
                  value={categoryQuery}
                  onChangeText={setCategoryQuery}
                  placeholder="Search categories..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              {/* Category Results - 2 Rows */}
              {categoryResults.length > 0 && (
                <View style={homeStyles.shoppingDrawerCategoryGrid}>
                  <FlatList
                    data={categoryResults}
                    numColumns={2}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          homeStyles.shoppingDrawerCategoryGridItem,
                          selectedCategory === item.id && homeStyles.shoppingDrawerCategoryGridItemSelected
                        ]}
                        onPress={() => handleCategorySelect(item)}
                      >
                        <View style={[
                          homeStyles.shoppingDrawerCategoryGridIcon,
                          { backgroundColor: selectedCategory === item.id ? item.color[0] : '#F3F4F6' }
                        ]}>
                          <IconMC 
                            name={item.icon} 
                            size={24} 
                            color={selectedCategory === item.id ? '#FFFFFF' : '#6B7280'} 
                          />
                        </View>
                        <Text style={[
                          homeStyles.shoppingDrawerCategoryGridText,
                          selectedCategory === item.id && homeStyles.shoppingDrawerCategoryGridTextSelected
                        ]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* Location Search */}
            <View style={homeStyles.shoppingDrawerField}>
              <Text style={homeStyles.shoppingDrawerFieldLabel}>Location</Text>
              <View style={homeStyles.shoppingDrawerSearchContainer}>
                <TextInput
                  style={homeStyles.shoppingDrawerSearchInput}
                  value={locationQuery}
                  onChangeText={setLocationQuery}
                  placeholder="Search for a location..."
                  placeholderTextColor="#9CA3AF"
                />
                {isSearchingLocation && (
                  <ActivityIndicator size="small" color="#6B7280" style={homeStyles.shoppingDrawerSearchLoader} />
                )}
              </View>
              
              {/* Location Results */}
              {showLocationResults && locationResults.length > 0 && (
                <View style={homeStyles.shoppingDrawerSearchResults}>
                  <ScrollView style={homeStyles.shoppingDrawerSearchResultsScroll} nestedScrollEnabled>
                    {locationResults.map((location) => (
                      <TouchableOpacity
                        key={location.id}
                        style={homeStyles.shoppingDrawerSearchResultItem}
                        onPress={() => handleLocationSelect(location)}
                      >
                        <IconMC name="map-marker" size={16} color="#6B7280" />
                        <View style={homeStyles.shoppingDrawerSearchResultContent}>
                          <Text style={homeStyles.shoppingDrawerSearchResultTitle}>{location.name}</Text>
                          <Text style={homeStyles.shoppingDrawerSearchResultSubtitle} numberOfLines={1}>
                            {location.address}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Target Date Selection */}
            <View style={homeStyles.shoppingDrawerField}>
              <Text style={homeStyles.shoppingDrawerFieldLabel}>Target Date</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={homeStyles.shoppingDrawerDateScroll}
              >
                {TARGET_DATES.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      homeStyles.shoppingDrawerDateItem,
                      selectedTargetDate === date && homeStyles.shoppingDrawerDateItemSelected
                    ]}
                    onPress={() => setSelectedTargetDate(date)}
                  >
                    <IconMC 
                      name="calendar" 
                      size={16} 
                      color={selectedTargetDate === date ? '#FFFFFF' : '#6B7280'} 
                    />
                    <Text style={[
                      homeStyles.shoppingDrawerDateText,
                      selectedTargetDate === date && homeStyles.shoppingDrawerDateTextSelected
                    ]}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Custom Date Input */}
            {selectedTargetDate === 'Custom Date' && (
              <View style={homeStyles.shoppingDrawerField}>
                <Text style={homeStyles.shoppingDrawerFieldLabel}>Custom Date</Text>
                <TextInput
                  style={homeStyles.shoppingDrawerInput}
                  value={customDate}
                  onChangeText={setCustomDate}
                  placeholder="e.g., Dec 25, 2024"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            {/* hourse Member Assignment */}
            <View style={homeStyles.shoppingDrawerField}>
              <Text style={homeStyles.shoppingDrawerFieldLabel}>Assign To</Text>
              <View style={homeStyles.shoppingDrawerSearchContainer}>
                <TextInput
                  style={homeStyles.shoppingDrawerSearchInput}
                  value={memberQuery}
                  onChangeText={setMemberQuery}
                  placeholder="Search hourse members..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              {/* hourse Member Results */}
              {memberResults.length > 0 && (
                <View style={homeStyles.shoppingDrawerSearchResults}>
                  <ScrollView style={homeStyles.shoppingDrawerSearchResultsScroll} nestedScrollEnabled>
                    {memberResults.map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          homeStyles.shoppingDrawerSearchResultItem,
                          selectedAssignee === member.name && homeStyles.shoppingDrawerSearchResultItemSelected
                        ]}
                        onPress={() => handleMemberSelect(member)}
                      >
                        <View style={[
                          homeStyles.shoppingDrawerMemberAvatar,
                          { backgroundColor: member.isOnline ? '#10B981' : '#6B7280' }
                        ]}>
                          <Text style={homeStyles.shoppingDrawerMemberAvatarText}>
                            {member.name.charAt(0)}
                          </Text>
                        </View>
                        <View style={homeStyles.shoppingDrawerSearchResultContent}>
                          <Text style={homeStyles.shoppingDrawerSearchResultTitle}>{member.name}</Text>
                          <Text style={homeStyles.shoppingDrawerSearchResultSubtitle}>
                            {member.relationship} • {member.isOnline ? 'Online' : 'Offline'}
                          </Text>
                        </View>
                        {member.isOnline && (
                          <View style={homeStyles.shoppingDrawerMemberOnlineIndicator} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Add Button */}
            <TouchableOpacity 
              style={homeStyles.shoppingDrawerAddButton}
              onPress={handleAddItem}
            >
              <LinearGradient
                colors={selectedCategoryData?.color || ['#FFB6C1', '#FF69B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={homeStyles.shoppingDrawerAddButtonGradient}
              >
                <IconMC name="plus" size={20} color="#FFFFFF" />
                <Text style={homeStyles.shoppingDrawerAddButtonText}>Add Item</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
