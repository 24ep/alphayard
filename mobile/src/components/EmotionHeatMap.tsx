import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_STYLES } from '../utils/fontUtils';
import { emotionService, EmotionRecord, FamilyEmotionAverage } from '../services/emotionService';

interface EmotionHeatMapProps {
  type: 'personal' | 'hourse';
  data: EmotionRecord[] | FamilyEmotionAverage[];
  onDayPress?: (date: string, emotion: number) => void;
}

const EmotionHeatMap: React.FC<EmotionHeatMapProps> = ({
  type,
  data,
  onDayPress,
}) => {
  const generateLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const getEmotionForDate = (date: string): number | null => {
    if (type === 'personal') {
      const record = (data as EmotionRecord[]).find(d => d.date === date);
      return record ? record.emotion : null;
    } else {
      const record = (data as FamilyEmotionAverage[]).find(d => d.date === date);
      return record ? Math.round(record.average_emotion) : null;
    }
  };

  const getDayLabel = (date: string): string => {
    const day = new Date(date).getDay();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return dayNames[day];
  };

  const getMonthLabel = (date: string): string => {
    const month = new Date(date).getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month];
  };

  const renderHeatMap = () => {
    const days = generateLast30Days();
    const weeks = [];
    
    // Group days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.week}>
        {week.map((date, dayIndex) => {
          const emotion = getEmotionForDate(date);
          const color = emotion ? emotionService.getEmotionColor(emotion) : '#CCCCCC';
          const isToday = date === new Date().toISOString().split('T')[0];
          
          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.day,
                { backgroundColor: color },
                isToday && styles.today
              ]}
              onPress={() => onDayPress && emotion && onDayPress(date, emotion)}
              disabled={!emotion}
            >
              <Text style={[
                styles.dayLabel,
                { color: emotion ? '#FFFFFF' : '#999999' }
              ]}>
                {getDayLabel(date)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  const getStats = () => {
    if (type === 'personal') {
      const records = data as EmotionRecord[];
      const totalDays = records.length;
      const averageEmotion = totalDays > 0 
        ? records.reduce((sum, record) => sum + record.emotion, 0) / totalDays 
        : 0;
      
      return {
        totalDays,
        averageEmotion: Math.round(averageEmotion * 10) / 10,
        label: 'Your Average'
      };
    } else {
      const records = data as FamilyEmotionAverage[];
      const totalDays = records.length;
      const averageEmotion = totalDays > 0 
        ? records.reduce((sum, record) => sum + record.average_emotion, 0) / totalDays 
        : 0;
      
      return {
        totalDays,
        averageEmotion: Math.round(averageEmotion * 10) / 10,
        label: 'hourse Average'
      };
    }
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon 
              name={type === 'personal' ? 'account-heart' : 'account-group'} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.title}>
              {type === 'personal' ? 'Your Wellbeing' : 'hourse Wellbeing'}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsLabel}>{stats.label}</Text>
            <Text style={styles.statsValue}>
              {stats.averageEmotion > 0 ? stats.averageEmotion.toFixed(1) : '--'}
            </Text>
            <Text style={styles.statsDays}>{stats.totalDays} days</Text>
          </View>
        </View>

        <View style={styles.heatMapContainer}>
          <View style={styles.legend}>
            <Text style={styles.legendLabel}>Less</Text>
            <View style={styles.legendColors}>
              <View style={[styles.legendColor, { backgroundColor: '#FF4444' }]} />
              <View style={[styles.legendColor, { backgroundColor: '#FF8800' }]} />
              <View style={[styles.legendColor, { backgroundColor: '#FFBB00' }]} />
              <View style={[styles.legendColor, { backgroundColor: '#88CC00' }]} />
              <View style={[styles.legendColor, { backgroundColor: '#00AA00' }]} />
            </View>
            <Text style={styles.legendLabel}>More</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.heatMap}>
              {renderHeatMap()}
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {type === 'personal' 
              ? 'Track your daily emotions to see patterns over time'
              : 'See how your hourse is feeling together'
            }
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT_STYLES.englishBody,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  statsDays: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: FONT_STYLES.englishBody,
  },
  heatMapContainer: {
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT_STYLES.englishBody,
  },
  legendColors: {
    flexDirection: 'row',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  heatMap: {
    flexDirection: 'row',
    gap: 4,
  },
  week: {
    flexDirection: 'column',
    gap: 4,
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  today: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: FONT_STYLES.englishBody,
    textAlign: 'center',
  },
});

export default EmotionHeatMap;
