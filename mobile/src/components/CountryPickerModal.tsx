import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { configService, Country } from '../services/api/config';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface CountryPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (country: Country) => void;
    selectedCountryCode?: string;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
    visible,
    onClose,
    onSelect,
    selectedCountryCode,
}) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (visible) {
            loadCountries();
            setSearchQuery('');
        }
    }, [visible]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            setFilteredCountries(
                countries.filter(
                    (c) =>
                        c.name.toLowerCase().includes(lower) ||
                        c.dial_code.includes(lower) ||
                        c.code.toLowerCase().includes(lower)
                )
            );
        } else {
            setFilteredCountries(countries);
        }
    }, [searchQuery, countries]);

    const loadCountries = async () => {
        setLoading(true);
        try {
            const data = await configService.getCountries();
            setCountries(data);
            setFilteredCountries(data);
        } catch (error) {
            console.error('Failed to load countries', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Country }) => (
        <TouchableOpacity
            style={[
                styles.item,
                selectedCountryCode === item.code && styles.selectedItem,
            ]}
            onPress={() => {
                onSelect(item);
                onClose();
            }}
        >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.dialCode}>{item.dial_code}</Text>
            {selectedCountryCode === item.code && (
                <Icon name="check" size={20} color="#FA7272" style={styles.checkIcon} />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardAvoid}
                    >
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalContainer}>
                                <View style={styles.header}>
                                    <Text style={styles.title}>Select Country</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Icon name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.searchContainer}>
                                    <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search country..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        autoCorrect={false}
                                    />
                                </View>

                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#FA7272" />
                                    </View>
                                ) : (
                                    <FlatList
                                        data={filteredCountries}
                                        renderItem={renderItem}
                                        keyExtractor={(item) => item.code}
                                        keyboardShouldPersistTaps="handled"
                                        contentContainerStyle={styles.listContent}
                                        showsVerticalScrollIndicator={false}
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardAvoid: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%', // Takes up 80% of screen
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 40,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedItem: {
        backgroundColor: '#FFF0F0',
    },
    flag: {
        fontSize: 24,
        marginRight: 12,
    },
    name: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    dialCode: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    checkIcon: {
        marginLeft: 12,
    },
});
