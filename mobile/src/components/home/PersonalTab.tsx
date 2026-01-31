import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { DailyBriefing } from './DailyBriefing';
import { MiniAppsGrid } from './MiniAppsGrid';
import { FinanceSummary } from './FinanceSummary';
import { HealthSummary } from './HealthSummary';
import { GoalsCard } from './GoalsCard';
import RecentlyUsedWidget from './RecentlyUsedWidget';

interface PersonalTabProps {
  circleStatusMembers?: any[];
  circleLocations?: any[];
  selectedCircle?: any;
  isCircleLoading?: boolean;
  onOpenApps?: () => void;
  onGoToFinance?: () => void;
}

export const PersonalTab: React.FC<PersonalTabProps> = ({
  onOpenApps,
  onGoToFinance,
}) => {

  // Use memo for mock data to prevent unnecessary re-renders
  const mockGoals = useMemo(() => [
    { id: '1', name: 'Vacation Fund', amount: '$2,400', target: '$5,000', progress: 48, targetDate: 'Aug 2024' },
    { id: '2', name: 'New Home', amount: '$45,000', target: '$80,000', progress: 56, targetDate: 'Dec 2025' },
    { id: '3', name: 'Emergency', amount: '$8,200', target: '$10,000', progress: 82 },
  ], []);

  return (
    <View style={styles.container}>
      {/* 1. Daily Briefing (Greeting & Key Info) */}
      <DailyBriefing />

      {/* 2. Mini Apps Grid (Quick Access) */}
      <View style={styles.sectionHeader}>
        <MiniAppsGrid onSeeAllPress={onOpenApps} />
      </View>

      {/* 3. Recently Used (Recents) */}
      <RecentlyUsedWidget 
        apps={[]} // Pass empty or mock apps if needed, but it should handle empty safely or we need to pass mock data
        onAppPress={(app) => console.log('App pressed', app)}
      />

      {/* 4. Finance Summary (Wallet Snapshot) */}
      <FinanceSummary onGoToFinance={onGoToFinance || (() => {})} />

      {/* 5. Health Summary (Vitals Snapshot) */}
      <HealthSummary />

      {/* 6. Goals (Personal Goals) */}
      <GoalsCard goals={mockGoals} />

      <View style={{ height: 100 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  sectionHeader: {
    marginBottom: 8,
  },
});

