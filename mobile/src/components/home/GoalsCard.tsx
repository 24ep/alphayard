import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface Goal {
  id: string;
  name: string;
  amount: string;
  progress: number;
  target: string;
  targetDate?: string;
}

interface GoalsCardProps {
  goals: Goal[];
}

export const GoalsCard: React.FC<GoalsCardProps> = ({ goals }) => {
  if (!goals || !Array.isArray(goals)) {
    return null;
  }

  return (
    <View style={homeStyles.goalsList}>
        {goals.map((goal) => (
          <View key={goal.id} style={homeStyles.goalItem}>
            <View style={homeStyles.goalItemLeft}>
              <View style={homeStyles.goalIconContainer}>
                <IconMC 
                  name={goal.name.includes('Vacation') ? 'airplane' : 
                        goal.name.includes('Home') ? 'home' : 'shield-check'} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            
            <View style={homeStyles.goalItemRight}>
              <View style={homeStyles.goalItemHeader}>
                <Text style={homeStyles.goalName}>{goal.name}</Text>
                <Text style={homeStyles.goalProgressText}>{goal.progress}%</Text>
              </View>
              
              <View style={homeStyles.goalAmountRow}>
                <Text style={homeStyles.goalAmount}>{goal.amount}</Text>
                <Text style={homeStyles.goalTarget}>/ {goal.target}</Text>
              </View>
              {goal.targetDate && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <IconMC name="calendar" size={14} color="#6B7280" />
                  <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>{goal.targetDate}</Text>
                </View>
              )}
              
              <View style={homeStyles.goalProgressContainer}>
                <View style={homeStyles.goalProgressBar}>
                  <View 
                    style={[
                      homeStyles.goalProgressFill, 
                      { width: `${goal.progress}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        ))}
    </View>
  );
};
