import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CircularBatteryBorderProps {
    percentage: number;
    size: number;
    strokeWidth?: number;
    children?: React.ReactNode;
}

export const CircularBatteryBorder: React.FC<CircularBatteryBorderProps> = ({
    percentage,
    size,
    strokeWidth = 3,
    children,
}) => {
    // Ensure percentage is between 0 and 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

    // Center coordinate
    const center = size / 2;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={styles.contentContainer}>
                {children}
            </View>
            <Svg width={size} height={size} style={styles.svg}>
                <Defs>
                    <LinearGradient id="batteryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#10B981" />
                        <Stop offset="50%" stopColor="#F59E0B" />
                        <Stop offset="100%" stopColor="#EF4444" />
                    </LinearGradient>
                </Defs>

                {/* Background Track (Grey) */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress Arc */}
                {clampedPercentage > 0 && (
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="url(#batteryGradient)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${center}, ${center}`}
                    />
                )}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    svg: {
        position: 'absolute',
        borderWidth: 0,
        zIndex: 2,
        // Make sure it doesn't block touch events on the children if strictly superimposed without pointerEvents control,
        // though in RN absolute positioning stacking usually works fine for this "border" effect.
    },
});
