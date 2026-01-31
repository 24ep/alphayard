import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors } from '../../theme/colors';

export interface CalendarFilter {
  type: 'all' | 'personal' | 'Circle' | 'work' | 'school' | 'medical' | 'other';
  priority: 'all' | 'low' | 'medium' | 'high';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  showCompleted: boolean;
}

interface CalendarFiltersProps {
  filters: CalendarFilter;
  onFilterChange: (filters: CalendarFilter) => void;
  onSearchPress?: () => void;
  showSearchButton?: boolean;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  filters,
  onFilterChange,
  onSearchPress,
  showSearchButton = true,
}) => {
  const eventTypes = [
    { key: 'all', label: 'All', icon: 'apps-outline', color: '#666' },
    { key: 'personal', label: 'Personal', icon: 'person-outline', color: '#4caf50' },
    { key: 'Circle', label: 'Circle', icon: 'people-outline', color: '#e91e63' },
    { key: 'work', label: 'Work', icon: 'briefcase-outline', color: '#2196f3' },
    { key: 'school', label: 'School', icon: 'school-outline', color: '#9c27b0' },
    { key: 'medical', label: 'Medical', icon: 'medical-outline', color: '#f44336' },
    { key: 'other', label: 'Other', icon: 'calendar-outline', color: '#666' },
  ] as const;

  const priorityLevels = [
    { key: 'all', label: 'All', color: '#666' },
    { key: 'low', label: 'Low', color: '#10b981' },
    { key: 'medium', label: 'Medium', color: '#f59e0b' },
    { key: 'high', label: 'High', color: '#ef4444' },
  ] as const;

  const dateRanges = [
    { key: 'all', label: 'All Time', icon: 'calendar-outline' },
    { key: 'today', label: 'Today', icon: 'today-outline' },
    { key: 'week', label: 'This Week', icon: 'calendar-outline' },
    { key: 'month', label: 'This Month', icon: 'calendar-outline' },
    { key: 'custom', label: 'Custom', icon: 'calendar-outline' },
  ] as const;

  const handleTypeChange = (type: CalendarFilter['type']) => {
    onFilterChange({ ...filters, type });
  };

  const handlePriorityChange = (priority: CalendarFilter['priority']) => {
    onFilterChange({ ...filters, priority });
  };

  const handleDateRangeChange = (dateRange: CalendarFilter['dateRange']) => {
    onFilterChange({ ...filters, dateRange });
  };

  const handleShowCompletedChange = () => {
    onFilterChange({ ...filters, showCompleted: !filters.showCompleted });
  };

  const renderFilterChip = (
    key: string,
    label: string,
    icon?: string,
    color?: string,
    isSelected: boolean = false,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.filterChip,
        isSelected && styles.selectedFilterChip,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={
          isSelected
            ? [brandColors.primary, brandColors.secondary]
            : ['#f5f5f5', '#f0f0f0']
        }
        style={styles.filterChipGradient}
      >
        {icon && (
          <IconIon
            name={icon}
            size={16}
            color={isSelected ? '#ffffff' : color || '#666'}
            style={styles.filterChipIcon}
          />
        )}
        <Text
          style={[
            styles.filterChipText,
            isSelected && styles.selectedFilterChipText,
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTypeFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Event Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterScrollContent}
      >
        {eventTypes.map((type) =>
          renderFilterChip(
            type.key,
            type.label,
            type.icon,
            type.color,
            filters.type === type.key,
            () => handleTypeChange(type.key)
          )
        )}
      </ScrollView>
    </View>
  );

  const renderPriorityFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Priority</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterScrollContent}
      >
        {priorityLevels.map((priority) =>
          renderFilterChip(
            priority.key,
            priority.label,
            undefined,
            priority.color,
            filters.priority === priority.key,
            () => handlePriorityChange(priority.key)
          )
        )}
      </ScrollView>
    </View>
  );

  const renderDateRangeFilters = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Date Range</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterScrollContent}
      >
        {dateRanges.map((range) =>
          renderFilterChip(
            range.key,
            range.label,
            range.icon,
            undefined,
            filters.dateRange === range.key,
            () => handleDateRangeChange(range.key)
          )
        )}
      </ScrollView>
    </View>
  );

  const renderAdditionalFilters = () => (
    <View style={styles.filterSection}>
      <View style={styles.additionalFiltersRow}>
        <TouchableOpacity
          style={[
            styles.toggleFilter,
            filters.showCompleted && styles.activeToggleFilter,
          ]}
          onPress={handleShowCompletedChange}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              filters.showCompleted
                ? [brandColors.primary, brandColors.secondary]
                : ['#f5f5f5', '#f0f0f0']
            }
            style={styles.toggleFilterGradient}
          >
            <IconIon
              name="checkmark-circle-outline"
              size={16}
              color={filters.showCompleted ? '#ffffff' : '#666'}
            />
            <Text
              style={[
                styles.toggleFilterText,
                filters.showCompleted && styles.activeToggleFilterText,
              ]}
            >
              Show Completed
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {showSearchButton && onSearchPress && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[brandColors.primary, brandColors.secondary]}
              style={styles.searchButtonGradient}
            >
              <IconIon name="search-outline" size={16} color="#ffffff" />
              <Text style={styles.searchButtonText}>Search</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderClearFilters = () => {
    const hasActiveFilters = 
      filters.type !== 'all' ||
      filters.priority !== 'all' ||
      filters.dateRange !== 'all' ||
      filters.showCompleted;

    if (!hasActiveFilters) return null;

    return (
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={() => onFilterChange({
            type: 'all',
            priority: 'all',
            dateRange: 'all',
            showCompleted: false,
          })}
          activeOpacity={0.7}
        >
          <IconIon name="close-circle-outline" size={16} color="#ef4444" />
          <Text style={styles.clearFiltersText}>Clear All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
        style={styles.containerGradient}
      >
        {renderTypeFilters()}
        {renderPriorityFilters()}
        {renderDateRangeFilters()}
        {renderAdditionalFilters()}
        {renderClearFilters()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  containerGradient: {
    borderRadius: 16,
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedFilterChip: {
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  filterChipIcon: {
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedFilterChipText: {
    color: '#ffffff',
  },
  additionalFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleFilter: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeToggleFilter: {
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleFilterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  toggleFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeToggleFilterText: {
    color: '#ffffff',
  },
  searchButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});

