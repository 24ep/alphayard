import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Modal, Pressable } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

export type SortOrder = 'recent' | 'nearby' | 'popular';
export type LocationType = 'all' | 'hometown' | 'workplace' | 'school';
export type DistanceFilter = 1 | 5 | 10 | null; // null = custom
export type GeoScope = 'worldwide' | 'country' | 'nearby' | 'custom';
export type DistanceUnit = 'km' | 'mile';

interface CustomCoordinates {
    latitude: number;
    longitude: number;
    name?: string;
}

interface LocationFilterBarProps {
    sortOrder: SortOrder;
    onSortOrderChange: (order: SortOrder) => void;
    distanceKm: number | null;
    onDistanceChange: (km: number | null) => void;
    locationType: LocationType;
    onLocationTypeChange: (type: LocationType) => void;
    hasCurrentLocation: boolean;
    // Geographic scope
    geoScope?: GeoScope;
    onGeoScopeChange?: (scope: GeoScope) => void;
    selectedCountry?: string;
    onCountrySelect?: () => void;
    // Custom coordinates
    customCoordinates?: CustomCoordinates;
    onCustomCoordinatesChange?: (coords: CustomCoordinates) => void;
    // Distance unit
    distanceUnit?: DistanceUnit;
    onDistanceUnitChange?: (unit: DistanceUnit) => void;
}

// Conversion constants
const KM_TO_MILE = 0.621371;
const MILE_TO_KM = 1.60934;

export const LocationFilterBar: React.FC<LocationFilterBarProps> = ({
    sortOrder,
    onSortOrderChange,
    distanceKm,
    onDistanceChange,
    locationType,
    onLocationTypeChange,
    hasCurrentLocation,
    geoScope = 'nearby',
    onGeoScopeChange,
    selectedCountry,
    onCountrySelect,
    customCoordinates,
    onCustomCoordinatesChange,
    distanceUnit = 'km',
    onDistanceUnitChange
}) => {
    const [customDistanceModalVisible, setCustomDistanceModalVisible] = React.useState(false);
    const [customDistanceInput, setCustomDistanceInput] = React.useState('');

    // Custom coordinates modal state
    const [customCoordsModalVisible, setCustomCoordsModalVisible] = React.useState(false);
    const [customLatInput, setCustomLatInput] = React.useState('');
    const [customLngInput, setCustomLngInput] = React.useState('');
    const [customNameInput, setCustomNameInput] = React.useState('');

    // Helper functions for distance conversion
    const toDisplayUnit = (km: number): number => {
        return distanceUnit === 'mile' ? km * KM_TO_MILE : km;
    };

    const toKm = (value: number): number => {
        return distanceUnit === 'mile' ? value * MILE_TO_KM : value;
    };

    const getUnitLabel = (): string => {
        return distanceUnit === 'mile' ? 'mi' : 'km';
    };

    const handleCustomDistanceSubmit = () => {
        const value = parseFloat(customDistanceInput);
        if (!isNaN(value) && value > 0) {
            // Convert to km if user entered miles
            const km = toKm(value);
            onDistanceChange(km);
            setCustomDistanceModalVisible(false);
            setCustomDistanceInput('');
        }
    };

    // Distance presets with dynamic labels based on unit
    const distancePresets: Array<{ label: string; valueKm: number | null }> = [
        { label: `1${getUnitLabel()}`, valueKm: distanceUnit === 'mile' ? 1.60934 : 1 },
        { label: `5${getUnitLabel()}`, valueKm: distanceUnit === 'mile' ? 8.0467 : 5 },
        { label: `10${getUnitLabel()}`, valueKm: distanceUnit === 'mile' ? 16.0934 : 10 },
        { label: 'Custom', valueKm: null },
    ];

    // Unit toggle options
    const unitOptions: Array<{ label: string; value: DistanceUnit }> = [
        { label: 'km', value: 'km' },
        { label: 'mile', value: 'mile' },
    ];

    const locationTypes: Array<{ label: string; value: LocationType; icon: string }> = [
        { label: 'All', value: 'all', icon: 'earth' },
        { label: 'Hometown', value: 'hometown', icon: 'home' },
        { label: 'Workplace', value: 'workplace', icon: 'briefcase' },
        { label: 'School', value: 'school', icon: 'school' },
    ];

    const sortOptions: Array<{ label: string; value: SortOrder; icon: string }> = [
        { label: 'Recent', value: 'recent', icon: 'clock-outline' },
        { label: 'Nearby', value: 'nearby', icon: 'map-marker-radius' },
        { label: 'Popular', value: 'popular', icon: 'fire' },
    ];

    const geoScopeOptions: Array<{ label: string; value: GeoScope; icon: string }> = [
        { label: 'Worldwide', value: 'worldwide', icon: 'earth' },
        { label: 'Country', value: 'country', icon: 'flag' },
        { label: 'Nearby', value: 'nearby', icon: 'map-marker-radius' },
        { label: 'Custom', value: 'custom', icon: 'crosshairs-gps' },
    ];

    const handleCustomCoordsSubmit = () => {
        const lat = parseFloat(customLatInput);
        const lng = parseFloat(customLngInput);
        if (!isNaN(lat) && !isNaN(lng)) {
            onCustomCoordinatesChange?.({
                latitude: lat,
                longitude: lng,
                name: customNameInput || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            });
            setCustomCoordsModalVisible(false);
            setCustomLatInput('');
            setCustomLngInput('');
            setCustomNameInput('');
        }
    };

    const getCustomLabel = () => {
        if (customCoordinates?.name) {
            return customCoordinates.name.length > 12
                ? customCoordinates.name.substring(0, 12) + '...'
                : customCoordinates.name;
        }
        return 'Custom';
    };

    return (
        <View style={styles.container}>
            {/* Sort Order Section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Sort by</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.chip,
                                    sortOrder === option.value && styles.chipSelected
                                ]}
                                onPress={() => onSortOrderChange(option.value)}
                            >
                                <IconMC
                                    name={option.icon}
                                    size={16}
                                    color={sortOrder === option.value ? '#FFFFFF' : '#6B7280'}
                                />
                                <Text style={[
                                    styles.chipText,
                                    sortOrder === option.value && styles.chipTextSelected
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Geographic Scope Section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Scope</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {geoScopeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.chip,
                                    geoScope === option.value && styles.chipSelected
                                ]}
                                onPress={() => {
                                    if (option.value === 'country') {
                                        onCountrySelect?.();
                                    } else if (option.value === 'custom') {
                                        setCustomCoordsModalVisible(true);
                                    }
                                    onGeoScopeChange?.(option.value);
                                }}
                            >
                                <IconMC
                                    name={option.icon}
                                    size={16}
                                    color={geoScope === option.value ? '#FFFFFF' : '#6B7280'}
                                />
                                <Text style={[
                                    styles.chipText,
                                    geoScope === option.value && styles.chipTextSelected
                                ]}>
                                    {option.value === 'custom' && customCoordinates
                                        ? getCustomLabel()
                                        : option.value === 'country' && selectedCountry
                                            ? selectedCountry
                                            : option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Distance Filter Section - Only show when sorting by nearby and scope is nearby */}
            {sortOrder === 'nearby' && hasCurrentLocation && geoScope === 'nearby' && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionLabel}>Distance</Text>
                        {/* Unit Toggle */}
                        <View style={styles.unitToggle}>
                            {unitOptions.map((unit) => (
                                <TouchableOpacity
                                    key={unit.value}
                                    style={[
                                        styles.unitChip,
                                        distanceUnit === unit.value && styles.unitChipSelected
                                    ]}
                                    onPress={() => onDistanceUnitChange?.(unit.value)}
                                >
                                    <Text style={[
                                        styles.unitChipText,
                                        distanceUnit === unit.value && styles.unitChipTextSelected
                                    ]}>
                                        {unit.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.chipRow}>
                            {distancePresets.map((preset) => {
                                // Check if this preset matches current distance
                                const isCustom = preset.valueKm === null;
                                const presetKmValues = distancePresets.filter(p => p.valueKm !== null).map(p => p.valueKm);
                                const isSelected = isCustom
                                    ? (distanceKm !== null && !presetKmValues.some(v => Math.abs(v! - distanceKm) < 0.1))
                                    : (distanceKm !== null && Math.abs(preset.valueKm! - distanceKm) < 0.1);

                                return (
                                    <TouchableOpacity
                                        key={preset.label}
                                        style={[
                                            styles.chip,
                                            isSelected && styles.chipSelected
                                        ]}
                                        onPress={() => {
                                            if (preset.valueKm === null) {
                                                setCustomDistanceModalVisible(true);
                                            } else {
                                                onDistanceChange(preset.valueKm);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            isSelected && styles.chipTextSelected
                                        ]}>
                                            {isCustom && distanceKm !== null && !presetKmValues.some(v => Math.abs(v! - distanceKm) < 0.1)
                                                ? `${toDisplayUnit(distanceKm).toFixed(1)}${getUnitLabel()}`
                                                : preset.label
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Location Type Section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Near</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {locationTypes.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                style={[
                                    styles.chip,
                                    locationType === type.value && styles.chipSelected
                                ]}
                                onPress={() => onLocationTypeChange(type.value)}
                            >
                                <IconMC
                                    name={type.icon}
                                    size={16}
                                    color={locationType === type.value ? '#FFFFFF' : '#6B7280'}
                                />
                                <Text style={[
                                    styles.chipText,
                                    locationType === type.value && styles.chipTextSelected
                                ]}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Custom Distance Modal */}
            <Modal
                visible={customDistanceModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setCustomDistanceModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setCustomDistanceModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Custom Distance</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                value={customDistanceInput}
                                onChangeText={setCustomDistanceInput}
                                placeholder="Enter distance"
                                keyboardType="numeric"
                                autoFocus
                            />
                            <Text style={styles.inputUnit}>km</Text>
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setCustomDistanceModalVisible(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonConfirm}
                                onPress={handleCustomDistanceSubmit}
                            >
                                <Text style={styles.modalButtonConfirmText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* Custom Coordinates Modal */}
            <Modal
                visible={customCoordsModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setCustomCoordsModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setCustomCoordsModalVisible(false)}
                >
                    <Pressable style={styles.modalContentWide} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Custom Location</Text>

                        {/* Location Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name (optional)</Text>
                            <TextInput
                                style={styles.inputFull}
                                value={customNameInput}
                                onChangeText={setCustomNameInput}
                                placeholder="e.g., Beach Resort"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Coordinates Row */}
                        <View style={styles.coordsRow}>
                            <View style={styles.coordInput}>
                                <Text style={styles.inputLabel}>Latitude</Text>
                                <TextInput
                                    style={styles.inputFull}
                                    value={customLatInput}
                                    onChangeText={setCustomLatInput}
                                    placeholder="e.g., 13.7563"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.coordInput}>
                                <Text style={styles.inputLabel}>Longitude</Text>
                                <TextInput
                                    style={styles.inputFull}
                                    value={customLngInput}
                                    onChangeText={setCustomLngInput}
                                    placeholder="e.g., 100.5018"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setCustomCoordsModalVisible(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonConfirm}
                                onPress={handleCustomCoordsSubmit}
                            >
                                <Text style={styles.modalButtonConfirmText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        gap: 4,
    },
    chipSelected: {
        backgroundColor: '#3B82F6',
    },
    chipText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    inputUnit: {
        marginLeft: 8,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButtonCancel: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    modalButtonCancelText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    modalButtonConfirm: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
    },
    modalButtonConfirmText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Custom coordinates modal styles
    modalContentWide: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    inputFull: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    coordsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    coordInput: {
        flex: 1,
    },
    // Unit toggle styles
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 2,
    },
    unitChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    unitChipSelected: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    unitChipText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    unitChipTextSelected: {
        color: '#3B82F6',
        fontWeight: '600',
    },
});

export default LocationFilterBar;
