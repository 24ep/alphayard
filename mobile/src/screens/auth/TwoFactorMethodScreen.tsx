import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type TwoFactorMethodNavigationProp = StackNavigationProp<AuthStackParamList, 'TwoFactorMethod'>;
type TwoFactorMethodRouteProp = RouteProp<AuthStackParamList, 'TwoFactorMethod'>;

interface ChannelOption {
    id: 'email' | 'sms' | 'authenticator';
    title: string;
    description: string;
    icon: string;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
    {
        id: 'email',
        title: 'Email',
        description: 'Receive a code via email',
        icon: 'email-outline'
    },
    {
        id: 'sms',
        title: 'SMS',
        description: 'Receive a code via text message',
        icon: 'message-text-outline'
    },
    {
        id: 'authenticator',
        title: 'Authenticator App',
        description: 'Use Google Authenticator or similar',
        icon: 'shield-key-outline'
    }
];

export const TwoFactorMethodScreen: React.FC = () => {
    const navigation = useNavigation<TwoFactorMethodNavigationProp>();
    const route = useRoute<TwoFactorMethodRouteProp>();
    const { requestOtp } = useAuth();

    const { identifier, mode } = route.params;

    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChannelSelect = (channelId: string) => {
        setSelectedChannel(channelId);
    };

    const handleContinue = async () => {
        if (!selectedChannel) {
            Alert.alert('Select Method', 'Please select a verification method to continue.');
            return;
        }

        setIsLoading(true);
        try {
            const channel = selectedChannel as 'email' | 'sms' | 'authenticator';
            
            if (channel === 'authenticator') {
                // Navigate directly to 2FA verification for authenticator app
                navigation.navigate('TwoFactorVerify', { 
                    identifier, 
                    mode, 
                    channel
                });
            } else {
                // Request OTP via selected channel (email or sms)
                await requestOtp(identifier);
                navigation.navigate('TwoFactorVerify', { 
                    identifier, 
                    mode, 
                    channel
                });
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenBackground screenId="twofactor-method" style={styles.gradient}>
                <View style={styles.content}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-left" size={24} color="#FFF" />
                        </TouchableOpacity>
                        
                        <View style={styles.headerIconContainer}>
                            <Icon name="shield-check-outline" size={48} color="#FFF" />
                        </View>
                        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
                        <Text style={styles.headerSubtitle}>Choose how you want to receive your verification code</Text>
                    </View>

                    {/* Card Container */}
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Select Verification Method</Text>
                            
                            {CHANNEL_OPTIONS.map((channel) => (
                                <TouchableOpacity
                                    key={channel.id}
                                    style={[
                                        styles.channelOption,
                                        selectedChannel === channel.id && styles.channelOptionSelected
                                    ]}
                                    onPress={() => handleChannelSelect(channel.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.channelIconContainer,
                                        selectedChannel === channel.id && styles.channelIconContainerSelected
                                    ]}>
                                        <Icon 
                                            name={channel.icon} 
                                            size={24} 
                                            color={selectedChannel === channel.id ? '#FFF' : '#FA7272'} 
                                        />
                                    </View>
                                    <View style={styles.channelTextContainer}>
                                        <Text style={[
                                            styles.channelTitle,
                                            selectedChannel === channel.id && styles.channelTitleSelected
                                        ]}>
                                            {channel.title}
                                        </Text>
                                        <Text style={styles.channelDescription}>{channel.description}</Text>
                                    </View>
                                    <View style={[
                                        styles.radioOuter,
                                        selectedChannel === channel.id && styles.radioOuterSelected
                                    ]}>
                                        {selectedChannel === channel.id && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {/* Continue Button */}
                            <TouchableOpacity
                                style={[styles.continueButton, !selectedChannel && styles.continueButtonDisabled]}
                                onPress={handleContinue}
                                disabled={!selectedChannel || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.continueButtonText}>Continue</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScreenBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    gradient: { 
        flex: 1 
    },
    content: { 
        flex: 1, 
        justifyContent: 'space-between'
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 20,
        zIndex: 10,
        padding: 8
    },
    headerIconContainer: {
        marginBottom: 16,
        marginTop: 20
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        paddingHorizontal: 40
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingVertical: 32,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        paddingBottom: 40,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    channelOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
    },
    channelOptionSelected: {
        borderColor: '#FA7272',
        backgroundColor: '#FFF5F5',
    },
    channelIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    channelIconContainerSelected: {
        backgroundColor: '#FA7272',
    },
    channelTextContainer: {
        flex: 1,
    },
    channelTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    channelTitleSelected: {
        color: '#FA7272',
    },
    channelDescription: {
        fontSize: 13,
        color: '#666',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#FA7272',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FA7272',
    },
    continueButton: {
        backgroundColor: '#FA7272',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default TwoFactorMethodScreen;
