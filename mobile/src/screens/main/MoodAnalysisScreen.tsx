import React from 'react';
import { Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, VStack, HStack, Center, Heading, Pressable } from 'native-base';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const MoodAnalysisScreen: React.FC = () => {
    const navigation = useNavigation();

    // Data for Bar Chart (Mood Distribution)
    const moodDistributionData = {
        labels: ['Happy', 'Neutral', 'Sad', 'Stress', 'Tired'],
        datasets: [
            {
                data: [45, 20, 10, 15, 10], // percentages
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green primary
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
        fillShadowGradient: '#10B981',
        fillShadowGradientOpacity: 1,
    };

    return (
        <Box flex={1} bg="white" safeArea>
            <VStack space={0} flex={1}>
                {/* Header */}
                <HStack px={4} py={3} alignItems="center" bg="white" shadow={1} zIndex={1}>
                    <Pressable onPress={() => navigation.goBack()} p={2}>
                        <Icon name="arrow-left" size={24} color="#333" />
                    </Pressable>
                    <Heading size="md" ml={2} color="gray.800">Mood Analysis</Heading>
                </HStack>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space={6} p={4} pb={10}>

                        {/* Overview Card (Bar Chart) */}
                        <Box bg="white" borderRadius="xl" shadow={2} p={5}>
                            <Text style={styles.cardTitle}>Mood Overview (30 Days)</Text>
                            <Text style={styles.cardSubtitle}>Circle average is looking <Text style={{ fontWeight: 'bold', color: '#10B981' }}>Good</Text></Text>

                            <Center mt={2}>
                                <BarChart
                                    data={moodDistributionData}
                                    width={screenWidth - 60}
                                    height={220}
                                    yAxisLabel=""
                                    yAxisSuffix="%"
                                    chartConfig={chartConfig}
                                    verticalLabelRotation={0}
                                    fromZero
                                    showValuesOnTopOfBars
                                />
                            </Center>
                        </Box>

                        {/* Weekly Trend */}
                        <Box bg="white" borderRadius="xl" shadow={2} p={5}>
                            <Text style={styles.cardTitle}>Weekly Trend</Text>
                            <LineChart
                                data={{
                                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                                    datasets: [
                                        {
                                            data: [3.5, 4.0, 3.8, 4.5, 4.2, 3.9, 4.1]
                                        }
                                    ]
                                }}
                                width={screenWidth - 60}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                yAxisInterval={1}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                                    decimalPlaces: 1,
                                    // Reset fill shadow for line chart if needed, or keep green
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                        </Box>

                        {/* Circle Members Heatmap (Simulated 30-day row) */}
                        <Box bg="white" borderRadius="xl" shadow={2} p={5}>
                            <Text style={styles.cardTitle}>Member History (30 Days)</Text>
                            <Text style={styles.cardSubtitle} style={{ marginBottom: 16 }}>Detailed daily breakdown per person</Text>

                            {['Dad', 'Mom', 'Son', 'Daughter'].map((member, idx) => (
                                <VStack key={idx} mb={4}>
                                    <Text style={{ fontWeight: '600', marginBottom: 4 }}>{member}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <HStack space={1}>
                                            {Array.from({ length: 30 }).map((_, i) => {
                                                // Random mood color
                                                const moodColors = ['#10B981', '#F59E0B', '#EF4444', '#E5E7EB', '#10B981'];
                                                const color = moodColors[Math.floor(Math.random() * moodColors.length)];
                                                return (
                                                    <Box key={i} w={3} h={6} bg={color} borderRadius="sm" />
                                                );
                                            })}
                                        </HStack>
                                    </ScrollView>
                                </VStack>
                            ))}
                        </Box>

                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
};

const styles = StyleSheet.create({
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    }
});

export default MoodAnalysisScreen;

