import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenBackground } from '../../components/ScreenBackground';
import { PinKeypad } from '../../components/auth/PinKeypad';

export const TwoFactorVerifyScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { loginWithOtp, requestOtp, verifyEmail } = useAuth();

    // Route params: identifier (email/phone), mode ('login' | 'signup'), channel
    const { identifier, mode, channel } = route.params as { identifier: string; mode: 'login' | 'signup'; channel?: string };

    // Determine icon and subtitle based on channel
    const getChannelInfo = () => {
        switch (channel) {
            case 'sms':
                return { icon: 'message-text-outline', subtitle: `Enter the code sent via SMS to ${identifier}` };
            case 'authenticator':
                return { icon: 'shield-key-outline', subtitle: 'Enter the code from your authenticator app' };
            case 'email':
            default:
                return { icon: 'email-check-outline', subtitle: `Enter the code sent to ${identifier}` };
        }
    };
    const channelInfo = getChannelInfo();

    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(30);
    const [error, setError] = useState('');

    useEffect(() => {
        // Start countdown
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = async (newOtp: string) => {
        setOtp(newOtp);
        setError('');

        if (newOtp.length === 6) {
            await verifyOtp(newOtp);
        }
    };

    const verifyOtp = async (code: string) => {
        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                await loginWithOtp(identifier, code);
                // Navigation handled by AuthContext
            } else {
                // Signup verification flow
                await verifyEmail(identifier, code);
            }
        } catch (error: any) {
            setError(error.message || 'Verification failed');
            setOtp(''); // Clear OTP on error so user can retry
            Alert.alert('Error', error.message || 'Verification failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            await requestOtp(identifier);
            setTimer(30);
            Alert.alert('Sent', `A new code has been sent to ${identifier}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to resend code');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenBackground screenId="twofactor-verify" style={styles.gradient}>
                <View style={styles.content}>
                    
                    {/* Header with back button */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-left" size={24} color="#FFF" />
                        </TouchableOpacity>
                        
                        <View style={styles.headerIconContainer}>
                             <Icon name={channelInfo.icon} size={48} color="#FFF" />
                        </View>
                        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
                        <Text style={styles.headerSubtitle}>{channelInfo.subtitle}</Text>
                    </View>

                    {/* Card Container similar to Login */}
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                             <PinKeypad
                                pin={otp}
                                onPinChange={handleOtpChange}
                                maxLength={6}
                                title="Enter 6-Digit Code"
                                subtitle={isSubmitting ? "Verifying..." : (error ? error : "Please enter the verification code")}
                                error={error}
                                showValues={true}
                            >
                                <TouchableOpacity 
                                    onPress={handleResend} 
                                    disabled={timer > 0}
                                    style={styles.resendButton}
                                >
                                    <Text style={[styles.resendText, timer > 0 && styles.disabledText]}>
                                        {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
                                    </Text>
                                </TouchableOpacity>
                            </PinKeypad>

                             {isSubmitting && (
                                <ActivityIndicator style={{ marginTop: 20 }} color="#FA7272" />
                            )}
                        </View>
                    </View>
                </View>
            </ScreenBackground>
        </SafeAreaView>
    );
};

// Custom styles that mimic the Login card look but tailored for OTP
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
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
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        paddingBottom: 40, // Extra padding for safety
    },
    resendButton: {
        marginTop: 20,
        padding: 10,
    },
    resendText: {
        color: '#FA7272',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    disabledText: {
        color: '#999999',
    }
});

export default TwoFactorVerifyScreen;
