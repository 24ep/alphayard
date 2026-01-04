import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PIN_HASH_KEY = 'pin_hash';
const PIN_ENABLED_KEY = 'pin_enabled';
const SESSION_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const LAST_ACTIVITY_KEY = 'last_activity';

interface PinContextType {
    hasPin: boolean;
    isPinLocked: boolean;
    isPinSetupRequired: boolean;
    isLoading: boolean;
    setupPin: (pin: string) => Promise<boolean>;
    verifyPin: (pin: string) => Promise<boolean>;
    lockApp: () => void;
    unlockApp: () => void;
    resetPin: () => Promise<void>;
    checkLockStatus: () => Promise<void>;
    updateLastActivity: () => void;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

interface PinProviderProps {
    children: ReactNode;
}

export const PinProvider: React.FC<PinProviderProps> = ({ children }) => {
    const [hasPin, setHasPin] = useState(false);
    const [isPinLocked, setIsPinLocked] = useState(false);
    const [isPinSetupRequired, setIsPinSetupRequired] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check PIN status on mount
    useEffect(() => {
        checkPinStatus();
    }, []);

    // Hash PIN using SHA-256
    const hashPin = async (pin: string): Promise<string> => {
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            pin + 'bondarys_salt_v1' // Add salt for extra security
        );
        return hash;
    };

    // Check if PIN is set up
    const checkPinStatus = async () => {
        try {
            setIsLoading(true);
            const pinEnabled = await AsyncStorage.getItem(PIN_ENABLED_KEY);
            const pinHash = await AsyncStorage.getItem(PIN_HASH_KEY);

            const hasPinSetup = pinEnabled === 'true' && !!pinHash;
            setHasPin(hasPinSetup);

            if (hasPinSetup) {
                // Force lock on startup if PIN exists
                setIsPinLocked(true);
            }
        } catch (error) {
            console.error('Error checking PIN status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check if app should be locked based on last activity
    const checkLockStatus = async () => {
        try {
            const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
            if (lastActivity) {
                const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
                if (timeSinceActivity > SESSION_LOCK_TIMEOUT) {
                    setIsPinLocked(true);
                    console.log('[PIN] Session timed out, app locked');
                }
            } else {
                // If IDK when last activity was but PIN exists, lock it
                if (hasPin) setIsPinLocked(true);
            }
        } catch (error) {
            console.error('Error checking lock status:', error);
        }
    };

    // Set up a new PIN
    const setupPin = async (pin: string): Promise<boolean> => {
        try {
            if (pin.length !== 6) {
                console.error('PIN must be exactly 6 digits');
                return false;
            }

            const pinHash = await hashPin(pin);
            await AsyncStorage.setItem(PIN_HASH_KEY, pinHash);
            await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
            await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

            setHasPin(true);
            setIsPinSetupRequired(false);
            setIsPinLocked(false);

            console.log('[PIN] PIN setup successful');
            return true;
        } catch (error) {
            console.error('Error setting up PIN:', error);
            return false;
        }
    };

    // Verify entered PIN
    const verifyPin = async (pin: string): Promise<boolean> => {
        try {
            const storedHash = await AsyncStorage.getItem(PIN_HASH_KEY);
            if (!storedHash) {
                console.error('No PIN hash found');
                return false;
            }

            const enteredHash = await hashPin(pin);
            const isValid = enteredHash === storedHash;

            if (isValid) {
                setIsPinLocked(false);
                await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
                console.log('[PIN] PIN verified successfully');
            } else {
                console.log('[PIN] Invalid PIN entered');
            }

            return isValid;
        } catch (error) {
            console.error('Error verifying PIN:', error);
            return false;
        }
    };

    // Lock the app
    const lockApp = () => {
        setIsPinLocked(true);
        console.log('[PIN] App locked');
    };

    // Unlock the app (called after successful PIN verification)
    const unlockApp = () => {
        setIsPinLocked(false);
        AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        console.log('[PIN] App unlocked');
    };

    // Reset PIN (for "Forgot PIN" - requires full re-login)
    const resetPin = async () => {
        try {
            await AsyncStorage.removeItem(PIN_HASH_KEY);
            await AsyncStorage.removeItem(PIN_ENABLED_KEY);
            await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
            setHasPin(false);
            setIsPinLocked(false);
            console.log('[PIN] PIN reset');
        } catch (error) {
            console.error('Error resetting PIN:', error);
        }
    };

    // Update last activity timestamp
    const updateLastActivity = () => {
        AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    // Mark PIN setup as required (called after successful login when no PIN exists)
    useEffect(() => {
        if (!isLoading && !hasPin) {
            // This will be set by AuthContext when needed
        }
    }, [isLoading, hasPin]);

    const contextValue: PinContextType = {
        hasPin,
        isPinLocked,
        isPinSetupRequired,
        isLoading,
        setupPin,
        verifyPin,
        lockApp,
        unlockApp,
        resetPin,
        checkLockStatus,
        updateLastActivity,
    };

    return (
        <PinContext.Provider value={contextValue}>
            {children}
        </PinContext.Provider>
    );
};

export const usePin = (): PinContextType => {
    const context = useContext(PinContext);
    if (context === undefined) {
        // Return safe defaults if provider is not present
        console.warn('usePin: PinProvider not found, using defaults');
        return {
            hasPin: false,
            isPinLocked: false,
            isPinSetupRequired: false,
            isLoading: false,
            setupPin: async () => false,
            verifyPin: async () => false,
            lockApp: () => { },
            unlockApp: () => { },
            resetPin: async () => { },
            checkLockStatus: async () => { },
            updateLastActivity: () => { },
        };
    }
    return context;
};

export default PinContext;
