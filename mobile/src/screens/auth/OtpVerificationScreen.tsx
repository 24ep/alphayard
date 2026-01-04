import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    Keyboard,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';

export const OtpVerificationScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { loginWithOtp, requestOtp, verifyEmail } = useAuth();

    // Route params: identifier (email/phone), mode ('login' | 'signup')
    const { identifier, mode } = route.params as { identifier: string; mode: 'login' | 'signup' };

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(30);
    const inputs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        // Start countdown
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }

        // Auto-submit if all filled
        // if (newOtp.every(d => d !== '') && index === 5) {
        //   verifyOtp(newOtp.join(''));
        // }
    };

    const handleBackspace = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const verifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the full 6-digit code.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                await loginWithOtp(identifier, code);
                // Navigation handled by AuthContext (user set -> RootNavigator updates)
            } else {
                // Signup verification flow
                await verifyEmail(identifier, code);
            }
            // Success is implicit if no error thrown
        } catch (error: any) {
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
            <LinearGradient colors={['#FA7272', '#FFBBB4']} style={styles.gradient}>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Icon name="email-check-outline" size={64} color="#FFF" />
                        <Text style={styles.title}>Verification</Text>
                        <Text style={styles.subtitle}>Enter the code sent to {identifier}</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={ref => inputs.current[index] = ref}
                                    style={styles.otpInput}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.verifyButton, isSubmitting && styles.disabledButton]}
                            onPress={verifyOtp}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.verifyButtonText}>Verify</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                            <Text style={[styles.resendText, timer > 0 && styles.disabledText]}>
                                {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    content: { flex: 1, padding: 20 },
    backButton: { marginTop: 20 },
    header: { alignItems: 'center', marginVertical: 40 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 16 },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        fontSize: 24,
        textAlign: 'center',
        backgroundColor: '#F9F9F9'
    },
    verifyButton: {
        backgroundColor: '#FA7272',
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    disabledButton: { opacity: 0.7 },
    verifyButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    resendText: { marginTop: 20, color: '#FA7272', fontSize: 16 },
    disabledText: { color: '#999' }
});

export default OtpVerificationScreen;
