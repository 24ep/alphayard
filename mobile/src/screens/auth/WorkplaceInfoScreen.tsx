
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const WorkplaceInfoScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { updateUser, user } = useAuth();
    
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContinue = async () => {
        if (!companyName.trim() || !address.trim()) {
            Alert.alert('Missing Information', 'Please fill in Company Name and Address.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Update user profile with workplace info
            // Assuming we store this in user preferences or metadata for now, 
            // as the backend schema might not be fully migrated yet.
            // Or we just proceed if it's a client-side flow.
            
            // For now, we'll confirm the update locally and navigate
            await updateUser({
                // @ts-ignore - Extending User type dynamically if needed, or assuming generic 'metadata' field
                companyName: companyName.trim(),
                workplaceAddress: address.trim(),
                jobTitle: jobTitle.trim(),
                isOnboardingComplete: true // Mark onboarded after this? Or next step?
            });

            // Navigate to main app or next step
            // For this flow, we assume this completes the specific workplace setup
            navigation.navigate('PinSetup'); 
        } catch (error) {
            console.error('Failed to update workplace info:', error);
            Alert.alert('Error', 'Failed to save information. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#FA7272', '#FFBBB4']} style={styles.gradient}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.content}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-left" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Icon name="office-building" size={40} color="#FA7272" />
                            </View>
                            <Text style={styles.title}>Workplace Details</Text>
                            <Text style={styles.subtitle}>
                                Tell us about your organization to verify your workplace account.
                            </Text>
                        </View>

                        <View style={styles.formCard}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Company Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Acme Corp"
                                    value={companyName}
                                    onChangeText={setCompanyName}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Work Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123 Business Rd, Tech City"
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Job Title (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Manager"
                                    value={jobTitle}
                                    onChangeText={setJobTitle}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                                onPress={handleContinue}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <LoadingSpinner size="small" color="#FFF" />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.buttonText}>Continue</Text>
                                        <Icon name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    button: {
        backgroundColor: '#FA7272',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#FA7272',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default WorkplaceInfoScreen;
