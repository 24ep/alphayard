import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { GoalsCard } from './GoalsCard';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

interface FinancialTabProps {}

type Period = 'Current' | 'Week' | 'Month' | 'Quarter' | 'Year';

enum DrawerType { Assets = 'assets', Liabilities = 'liabilities' }

export const FinancialTab: React.FC<FinancialTabProps> = () => {
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [compare, setCompare] = useState<Period>('Current');
  const [drawerOpen, setDrawerOpen] = useState<{ type: DrawerType | null }>(() => ({ type: null }));

  // Mock data
  const assetsLiabilities = { assets: 200000, liabilities: 74570 };
  const netWorth = assetsLiabilities.assets - assetsLiabilities.liabilities;
  const assetCats = [
    { id: 'a1', name: 'เงินสด', value: 15000 },
    { id: 'a2', name: 'บัญชีเงินฝาก', value: 60000 },
    { id: 'a3', name: 'กองทุน/หุ้น', value: 90000 },
    { id: 'a4', name: 'ทรัพย์สินอื่น', value: 35000 },
  ];
  const liabilityCats = [
    { id: 'l1', name: 'บัตรเครดิต', value: 10570 },
    { id: 'l2', name: 'สินเชื่อบ้าน', value: 50000 },
    { id: 'l3', name: 'สินเชื่อรถ', value: 14000 },
  ];
  const incomeThis = [
    { id: 'i1', name: 'เงินเดือน', value: 3500 },
    { id: 'i2', name: 'ฟรีแลนซ์', value: 900 },
    { id: 'i3', name: 'ปันผล', value: 250 },
  ];
  const expenseThis = [
    { id: 'e1', name: 'อาหาร', value: 520 },
    { id: 'e2', name: 'เดินทาง', value: 180 },
    { id: 'e3', name: 'ค่าสาธารณูปโภค', value: 240 },
    { id: 'e4', name: 'สุขภาพ', value: 110 },
  ];
  const fixedUpcoming = [
    { id: 'f1', name: 'ผ่อนบ้าน', due: '5th', value: 1200 },
    { id: 'f2', name: 'ผ่อนรถ', due: '12th', value: 450 },
    { id: 'f3', name: 'บัตรเครดิต', due: '22nd', value: 300 },
  ];

  const mockGoals = [
    { id: '1', name: 'hourse Vacation Fund', amount: '$2,500', progress: 75, target: '$3,000', targetDate: 'Dec 20, 2025' },
    { id: '2', name: 'Home Renovation', amount: '$8,200', progress: 45, target: '$18,000', targetDate: 'Mar 15, 2026' },
  ];

  const fmt = (n: number) => `฿${n.toLocaleString('th-TH')}`;
  const sum = (arr: { value: number }[]) => arr.reduce((s, x) => s + x.value, 0);

  const closeDrawer = () => setDrawerOpen({ type: null });

  const PeriodChip: React.FC<{ label: Period }> = ({ label }) => (
    <TouchableOpacity onPress={() => setCompare(label)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 9999, backgroundColor: compare === label ? '#FFB6C1' : 'rgba(255,182,193,0.2)' }}>
      <Text style={{ color: compare === label ? '#1F2937' : '#6B7280', fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={homeStyles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Net Worth card (ทรัพย์สิน - หนี้สิน) */}
      <View style={homeStyles.section}>
        <LinearGradient colors={["#E0EAFC", "#CFDEF3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, marginHorizontal: 20, padding: 16 }}>
          <Text style={{ color: '#1F2937', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>ความมั่งคั่งสุทธิ</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text style={{ color: '#111827', fontSize: 26, fontWeight: '800' }}>{fmt(netWorth)}</Text>
            <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999 }}>
              <Text style={{ color: '#111827', fontWeight: '700' }}>ดูรายละเอียด</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={[homeStyles.assetCard, { flex: 1, padding: 12 }]}>
              <Text style={homeStyles.assetCardTitle}>ทรัพย์สิน</Text>
              <Text style={homeStyles.assetCardValue}>{fmt(assetsLiabilities.assets)}</Text>
            </View>
            <View style={[homeStyles.assetCard, { flex: 1, padding: 12 }]}>
              <Text style={homeStyles.assetCardTitle}>หนี้สิน</Text>
              <Text style={homeStyles.assetCardValue}>{fmt(assetsLiabilities.liabilities)}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* 3-bar chart (Assets / Liabilities / Net Worth) with compare selector */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>ภาพรวม</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8, flexWrap: 'wrap' }}>
          {(['Current','Week','Month','Year'] as Period[]).map(p => <PeriodChip key={p} label={p} />)}
        </View>
        <View style={[homeStyles.portfolioItem, { marginHorizontal: 20, padding: 16 }] }>
          {[{ name: 'ทรัพย์สิน', color: '#10B981', value: assetsLiabilities.assets }, { name: 'หนี้สิน', color: '#EF4444', value: assetsLiabilities.liabilities }, { name: 'สุทธิ', color: '#4F46E5', value: netWorth }].map((b, i) => {
            const max = Math.max(assetsLiabilities.assets, assetsLiabilities.liabilities, netWorth) || 1;
            const pct = Math.round((b.value / max) * 100);
            return (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={homeStyles.portfolioItemName}>{b.name}</Text>
                  <Text style={homeStyles.portfolioItemValue}>{fmt(b.value)}</Text>
                </View>
                <View style={{ height: 10, borderRadius: 8, backgroundColor: '#F3F4F6', overflow: 'hidden', marginTop: 6 }}>
                  <View style={{ width: `${pct}%`, backgroundColor: b.color, flex: 1 }} />
                </View>
              </View>
            );
          })}
          <Text style={[homeStyles.attnMetaText, { marginTop: 4 }]}>โหมดเปรียบเทียบ: {compare}</Text>
        </View>
      </View>

      {/* Assets & Liabilities pie charts with drawers */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>ทรัพย์สิน และ หนี้สิน (หมวดหมู่)</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
          <TouchableOpacity style={[homeStyles.assetCard, { flex: 1, padding: 16, alignItems: 'center' }]} onPress={() => setDrawerOpen({ type: DrawerType.Assets })}>
            <IconMC name="chart-pie" size={28} color="#10B981" />
            <Text style={{ marginTop: 8, fontWeight: '700', color: '#111827' }}>ทรัพย์สิน</Text>
            <Text style={{ color: '#6B7280' }}>{assetCats.length} หมวด</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[homeStyles.assetCard, { flex: 1, padding: 16, alignItems: 'center' }]} onPress={() => setDrawerOpen({ type: DrawerType.Liabilities })}>
            <IconMC name="chart-pie" size={28} color="#EF4444" />
            <Text style={{ marginTop: 8, fontWeight: '700', color: '#111827' }}>หนี้สิน</Text>
            <Text style={{ color: '#6B7280' }}>{liabilityCats.length} หมวด</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Income composition compare */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>สัดส่วนรายได้</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8, flexWrap: 'wrap' }}>
          {(['Month','Quarter','Year'] as Period[]).map(p => <PeriodChip key={`inc-${p}`} label={p} />)}
        </View>
        <View style={homeStyles.familyLocationMap}>
          <View style={homeStyles.familyLocationMapPlaceholder}>
            <IconMC name="chart-donut" size={28} color="#9CA3AF" />
            <Text style={homeStyles.attnMetaText}>รายได้เดือนปัจจุบัน (ตัวอย่าง)</Text>
          </View>
        </View>
      </View>

      {/* Expense composition compare */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>สัดส่วนค่าใช้จ่าย</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8, flexWrap: 'wrap' }}>
          {(['Month','Quarter','Year'] as Period[]).map(p => <PeriodChip key={`exp-${p}`} label={p} />)}
        </View>
        <View style={homeStyles.familyLocationMap}>
          <View style={homeStyles.familyLocationMapPlaceholder}>
            <IconMC name="chart-donut" size={28} color="#9CA3AF" />
            <Text style={homeStyles.attnMetaText}>ค่าใช้จ่ายเดือนปัจจุบัน (ตัวอย่าง)</Text>
          </View>
        </View>
      </View>

      {/* Upcoming fixed payments & last month spend */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>ภาระจ่ายถัดไป & เดือนก่อน</Text>
        </View>
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          {fixedUpcoming.map(item => (
            <View key={item.id} style={[homeStyles.portfolioItem, { padding: 12 }]}>
              <View style={homeStyles.portfolioItemLeft}>
                <View style={[homeStyles.portfolioIcon, { backgroundColor: '#F59E0B' }]}>
                  <Text style={homeStyles.portfolioIconText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={homeStyles.portfolioItemInfo}>
                  <Text style={homeStyles.portfolioItemName}>{item.name}</Text>
                  <Text style={homeStyles.portfolioItemValue}>กำหนด {item.due}</Text>
                </View>
              </View>
              <Text style={homeStyles.portfolioItemValue}>{fmt(item.value)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Budgeting & compare */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>งบประมาณ & เปรียบเทียบ</Text>
        </View>
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          <View style={[homeStyles.portfolioItem, { padding: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={homeStyles.portfolioItemName}>ค่าใช้จ่ายรวม</Text>
              <Text style={homeStyles.portfolioItemValue}>{fmt(sum(expenseThis))} / {fmt(3000)}</Text>
            </View>
            <View style={{ height: 10, borderRadius: 8, backgroundColor: '#F3F4F6', overflow: 'hidden', marginTop: 8 }}>
              <View style={{ width: `${Math.min(100, Math.round((sum(expenseThis)/3000)*100))}%`, backgroundColor: '#EF4444', flex: 1 }} />
            </View>
          </View>
          <TouchableOpacity style={[homeStyles.portfolioItem, { padding: 12, alignItems: 'center', justifyContent: 'center' }]}>
            <IconMC name="cog" size={18} color="#6B7280" />
            <Text style={{ marginTop: 6, color: '#6B7280' }}>ตั้งค่างบประมาณ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Goals */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Goals</Text>
        </View>
        <GoalsCard goals={mockGoals as any} />
      </View>

      {/* Drawers for Assets/Liabilities lists with basic CRUD placeholders */}
      <Modal visible={drawerOpen.type === DrawerType.Assets} transparent animationType="slide" onRequestClose={closeDrawer}>
        <TouchableOpacity style={homeStyles.categoryDrawerOverlay} activeOpacity={1} onPress={closeDrawer}>
          <View style={homeStyles.categoryDrawerContainer}>
            <View style={[homeStyles.categoryDrawerHeader, { height: 100 }] }>
              <View style={homeStyles.categoryDrawerHeaderContent}>
                <View style={homeStyles.categoryDrawerTitleRow}>
                  <View style={[homeStyles.categoryDrawerIcon, { backgroundColor: '#10B981' }]}>
                    <IconMC name="chart-pie" size={24} color="#FFFFFF" />
                  </View>
                  <View style={homeStyles.categoryDrawerTitleContainer}>
                    <Text style={homeStyles.categoryDrawerTitle}>หมวดหมู่ทรัพย์สิน</Text>
                    <Text style={homeStyles.categoryDrawerSubtitle}>{assetCats.length} รายการ</Text>
                  </View>
                </View>
                <TouchableOpacity style={homeStyles.categoryDrawerCloseButton} onPress={closeDrawer}>
                  <IconMC name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={homeStyles.categoryDrawerContent}>
              {assetCats.map(c => (
                <View key={c.id} style={homeStyles.categoryDrawerItem}>
                  <View style={homeStyles.categoryDrawerItemLeft}>
                    <View style={[homeStyles.categoryDrawerItemIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                      <IconMC name="checkbox-blank-circle" size={16} color="#10B981" />
                    </View>
                  </View>
                  <View style={homeStyles.categoryDrawerItemContent}>
                    <Text style={homeStyles.categoryDrawerItemName}>{c.name}</Text>
                    <Text style={homeStyles.categoryDrawerItemDescription}>{fmt(c.value)}</Text>
                  </View>
                  <View style={homeStyles.categoryDrawerItemRight}>
                    <TouchableOpacity><IconMC name="pencil" size={18} color="#6B7280" /></TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 12 }}><IconMC name="trash-can" size={18} color="#EF4444" /></TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={[homeStyles.portfolioItem, { padding: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 }]}>
                <IconMC name="plus" size={18} color="#10B981" />
                <Text style={{ marginTop: 6, color: '#10B981' }}>เพิ่มหมวดหมู่</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={drawerOpen.type === DrawerType.Liabilities} transparent animationType="slide" onRequestClose={closeDrawer}>
        <TouchableOpacity style={homeStyles.categoryDrawerOverlay} activeOpacity={1} onPress={closeDrawer}>
          <View style={homeStyles.categoryDrawerContainer}>
            <View style={[homeStyles.categoryDrawerHeader, { height: 100 }] }>
              <View style={homeStyles.categoryDrawerHeaderContent}>
                <View style={homeStyles.categoryDrawerTitleRow}>
                  <View style={[homeStyles.categoryDrawerIcon, { backgroundColor: '#EF4444' }]}>
                    <IconMC name="chart-pie" size={24} color="#FFFFFF" />
                  </View>
                  <View style={homeStyles.categoryDrawerTitleContainer}>
                    <Text style={homeStyles.categoryDrawerTitle}>หมวดหมู่หนี้สิน</Text>
                    <Text style={homeStyles.categoryDrawerSubtitle}>{liabilityCats.length} รายการ</Text>
                  </View>
                </View>
                <TouchableOpacity style={homeStyles.categoryDrawerCloseButton} onPress={closeDrawer}>
                  <IconMC name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={homeStyles.categoryDrawerContent}>
              {liabilityCats.map(c => (
                <View key={c.id} style={homeStyles.categoryDrawerItem}>
                  <View style={homeStyles.categoryDrawerItemLeft}>
                    <View style={[homeStyles.categoryDrawerItemIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                      <IconMC name="checkbox-blank-circle" size={16} color="#EF4444" />
                    </View>
                  </View>
                  <View style={homeStyles.categoryDrawerItemContent}>
                    <Text style={homeStyles.categoryDrawerItemName}>{c.name}</Text>
                    <Text style={homeStyles.categoryDrawerItemDescription}>{fmt(c.value)}</Text>
                  </View>
                  <View style={homeStyles.categoryDrawerItemRight}>
                    <TouchableOpacity><IconMC name="pencil" size={18} color="#6B7280" /></TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 12 }}><IconMC name="trash-can" size={18} color="#EF4444" /></TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={[homeStyles.portfolioItem, { padding: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 }]}>
                <IconMC name="plus" size={18} color="#EF4444" />
                <Text style={{ marginTop: 6, color: '#EF4444' }}>เพิ่มหมวดหมู่</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};
