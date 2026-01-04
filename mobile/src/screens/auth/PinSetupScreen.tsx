import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PinKeypad } from '../../components/auth/PinKeypad';
import { usePin } from '../../contexts/PinContext';

type SetupStep = 'enter' | 'confirm';

export const PinSetupScreen: React.FC = () => {
    const { setupPin } = usePin();
    const [step, setStep] = useState<SetupStep>('enter');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePinChange = (newPin: string) => {
        setError('');

        if (step === 'enter') {
            setPin(newPin);

            // Auto-advance to confirm step when 6 digits entered
            if (newPin.length === 6) {
                setTimeout(() => {
                    setStep('confirm');
                }, 200);
            }
        } else {
            setConfirmPin(newPin);

            // Auto-submit when 6 digits entered in confirm step
            if (newPin.length === 6) {
                handleConfirmPin(newPin);
            }
        }
    };

    const handleConfirmPin = async (confirmedPin: string) => {
        if (confirmedPin !== pin) {
            setError("PINs don't match. Please try again.");
            setConfirmPin('');
            return;
        }

        setIsSubmitting(true);
        const success = await setupPin(confirmedPin);
        setIsSubmitting(false);

        if (!success) {
            setError('Failed to set up PIN. Please try again.');
            setConfirmPin('');
        }
        // Success will automatically navigate via RootNavigator
    };

    const handleBack = () => {
        if (step === 'confirm') {
            setStep('enter');
            setConfirmPin('');
            setError('');
        }
    };

    const currentPin = step === 'enter' ? pin : confirmPin;
    const title = step === 'enter' ? 'Create Your PIN' : 'Confirm Your PIN';
    const subtitle = step === 'enter'
        ? 'Enter a 6-digit PIN to secure your app'
        : 'Re-enter your PIN to confirm';

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#FA7272', '#FFBBB4']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        {step === 'confirm' && (
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Icon name="arrow-left" size={24} color="#FFF" />
                            </TouchableOpacity>
                        )}
                        <View style={styles.iconContainer}>
                            <Icon name="lock-outline" size={48} color="#FFF" />
                        </View>
                    </View>

                    {/* PIN Card */}
                    <View style={styles.card}>
                        <PinKeypad
                            pin={currentPin}
                            onPinChange={handlePinChange}
                            title={title}
                            subtitle={subtitle}
                            error={error}
                        />

                        {isSubmitting && (
                            <Text style={styles.submittingText}>Setting up PIN...</Text>
                        )}

                        {/* Step Indicator */}
                        <View style={styles.stepIndicator}>
                            <View style={[styles.stepDot, step === 'enter' && styles.stepDotActive]} />
                            <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
                        </View>
                    </View>
                </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 0, // Full width
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 40,
        padding: 8,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingVertical: 32,
        paddingHorizontal: 16,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    submittingText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 16,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DDD',
    },
    stepDotActive: {
        backgroundColor: '#FA7272',
        width: 24,
    },
});

export default PinSetupScreen;
