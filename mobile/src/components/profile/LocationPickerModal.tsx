import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, TextInput, ActivityIndicator } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

export type LocationType = 'hometown' | 'workplace' | 'school' | 'custom';

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: {
        locationType: LocationType;
        name: string;
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
    locationType: LocationType;
    initialData?: {
        name?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
    };
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
    visible,
    onClose,
    onSave,
    locationType,
    initialData
}) => {
    const [name, setName] = React.useState(initialData?.name || '');
    const [latitude, setLatitude] = React.useState(initialData?.latitude?.toString() || '');
    const [longitude, setLongitude] = React.useState(initialData?.longitude?.toString() || '');
    const [address, setAddress] = React.useState(initialData?.address || '');
    const [loading, setLoading] = React.useState(false);
    const [useCurrentLocation, setUseCurrentLocation] = React.useState(false);

    React.useEffect(() => {
        if (visible) {
            setName(initialData?.name || '');
            setLatitude(initialData?.latitude?.toString() || '');
            setLongitude(initialData?.longitude?.toString() || '');
            setAddress(initialData?.address || '');
        }
    }, [visible, initialData]);

    const getLocationTypeLabel = () => {
        switch (locationType) {
            case 'hometown': return 'Hometown';
            case 'workplace': return 'Workplace';
            case 'school': return 'School';
            case 'custom': return 'Custom Location';
            default: return 'Location';
        }
    };

    const getLocationTypeIcon = () => {
        switch (locationType) {
            case 'hometown': return 'home';
            case 'workplace': return 'briefcase';
            case 'school': return 'school';
            case 'custom': return 'map-marker';
            default: return 'map-marker';
        }
    };

    const handleGetCurrentLocation = async () => {
        setLoading(true);
        setUseCurrentLocation(true);

        try {
            // For web/development, use a mock location or geolocation API
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLatitude(position.coords.latitude.toString());
                        setLongitude(position.coords.longitude.toString());
                        setAddress('Current Location');
                        setLoading(false);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        // Use mock location for development
                        setLatitude('13.7563');
                        setLongitude('100.5018');
                        setAddress('Bangkok, Thailand (Mock)');
                        setLoading(false);
                    }
                );
            } else {
                // Mock location for development
                setLatitude('13.7563');
                setLongitude('100.5018');
                setAddress('Bangkok, Thailand (Mock)');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            setLoading(false);
        }
    };

    const handleSave = () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return; // TODO: Show error
        }

        onSave({
            locationType,
            name: name || getLocationTypeLabel(),
            latitude: lat,
            longitude: lng,
            address
        });
    };

    const isValid = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <IconMC name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <View style={styles.titleRow}>
                            <IconMC name={getLocationTypeIcon()} size={24} color="#3B82F6" />
                            <Text style={styles.title}>Set {getLocationTypeLabel()}</Text>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name (optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder={`My ${getLocationTypeLabel()}`}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Use Current Location Button */}
                        <TouchableOpacity
                            style={styles.currentLocationButton}
                            onPress={handleGetCurrentLocation}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                            ) : (
                                <IconMC name="crosshairs-gps" size={20} color="#3B82F6" />
                            )}
                            <Text style={styles.currentLocationText}>Use Current Location</Text>
                        </TouchableOpacity>

                        {/* Coordinates */}
                        <View style={styles.coordinatesRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Latitude</Text>
                                <TextInput
                                    style={styles.input}
                                    value={latitude}
                                    onChangeText={setLatitude}
                                    placeholder="13.7563"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Longitude</Text>
                                <TextInput
                                    style={styles.input}
                                    value={longitude}
                                    onChangeText={setLongitude}
                                    placeholder="100.5018"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Address */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address (optional)</Text>
                            <TextInput
                                style={[styles.input, styles.addressInput]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter address or description"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={!isValid}
                        >
                            <Text style={[styles.saveButtonText, !isValid && styles.saveButtonTextDisabled]}>
                                Save Location
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
        padding: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    addressInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#3B82F6',
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    currentLocationText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3B82F6',
    },
    coordinatesRow: {
        flexDirection: 'row',
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    saveButtonTextDisabled: {
        color: '#9CA3AF',
    },
});

export default LocationPickerModal;
