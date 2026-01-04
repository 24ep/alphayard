import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProfileFinancialTabProps {
    userId?: string;
    showFinancial?: boolean;
    onToggleVisibility?: (visible: boolean) => void;
}

export const ProfileFinancialTab: React.FC<ProfileFinancialTabProps> = ({
    showFinancial = false,
    onToggleVisibility,
}) => {
    const [isVisible, setIsVisible] = useState(showFinancial);

    const handleToggle = (value: boolean) => {
        setIsVisible(value);
        onToggleVisibility?.(value);
    };

    // Mock financial data
    const financialData = {
        walletBalance: 12500.00,
        currency: 'THB',
        transactions: [
            { id: '1', type: 'credit', amount: 5000, description: 'Family contribution', date: '2024-01-03' },
            { id: '2', type: 'debit', amount: 1200, description: 'Groceries', date: '2024-01-02' },
            { id: '3', type: 'credit', amount: 800, description: 'Allowance', date: '2024-01-01' },
        ],
        monthlyBudget: 30000,
        spent: 18500,
    };

    const formatCurrency = (amount: number) => {
        return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Privacy Toggle */}
            <View style={styles.privacyCard}>
                <View style={styles.privacyContent}>
                    <IconMC name="shield-lock" size={24} color="#6B7280" />
                    <View style={styles.privacyText}>
                        <Text style={styles.privacyTitle}>Financial Privacy</Text>
                        <Text style={styles.privacySubtitle}>
                            {isVisible ? 'Your financial info is visible' : 'Your financial info is hidden'}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={isVisible}
                    onValueChange={handleToggle}
                    trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
                    thumbColor={isVisible ? '#22C55E' : '#9CA3AF'}
                />
            </View>

            {!isVisible ? (
                /* Hidden State */
                <View style={styles.hiddenContainer}>
                    <View style={styles.hiddenIcon}>
                        <IconMC name="eye-off" size={48} color="#9CA3AF" />
                    </View>
                    <Text style={styles.hiddenTitle}>Financial Info is Private</Text>
                    <Text style={styles.hiddenSubtitle}>
                        Toggle the switch above to show your financial information
                    </Text>
                </View>
            ) : (
                /* Visible State */
                <>
                    {/* Wallet Balance */}
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>Wallet Balance</Text>
                        <Text style={styles.balanceAmount}>
                            {formatCurrency(financialData.walletBalance)}
                        </Text>
                        <View style={styles.balanceActions}>
                            <TouchableOpacity style={styles.balanceButton}>
                                <IconMC name="plus" size={18} color="#FFFFFF" />
                                <Text style={styles.balanceButtonText}>Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.balanceButton, styles.balanceButtonSecondary]}>
                                <IconMC name="send" size={18} color="#3B82F6" />
                                <Text style={[styles.balanceButtonText, { color: '#3B82F6' }]}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Budget Overview */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Monthly Budget</Text>
                        <View style={styles.budgetCard}>
                            <View style={styles.budgetHeader}>
                                <Text style={styles.budgetSpent}>
                                    {formatCurrency(financialData.spent)}
                                </Text>
                                <Text style={styles.budgetTotal}>
                                    of {formatCurrency(financialData.monthlyBudget)}
                                </Text>
                            </View>
                            <View style={styles.budgetBarContainer}>
                                <View
                                    style={[
                                        styles.budgetBar,
                                        { width: `${(financialData.spent / financialData.monthlyBudget) * 100}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.budgetRemaining}>
                                {formatCurrency(financialData.monthlyBudget - financialData.spent)} remaining
                            </Text>
                        </View>
                    </View>

                    {/* Recent Transactions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <View style={styles.transactionsList}>
                            {financialData.transactions.map((tx) => (
                                <View key={tx.id} style={styles.transactionItem}>
                                    <View style={[
                                        styles.transactionIcon,
                                        { backgroundColor: tx.type === 'credit' ? '#DCFCE7' : '#FEE2E2' }
                                    ]}>
                                        <IconMC
                                            name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                                            size={18}
                                            color={tx.type === 'credit' ? '#16A34A' : '#DC2626'}
                                        />
                                    </View>
                                    <View style={styles.transactionContent}>
                                        <Text style={styles.transactionDesc}>{tx.description}</Text>
                                        <Text style={styles.transactionDate}>{tx.date}</Text>
                                    </View>
                                    <Text style={[
                                        styles.transactionAmount,
                                        { color: tx.type === 'credit' ? '#16A34A' : '#DC2626' }
                                    ]}>
                                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    privacyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
    },
    privacyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    privacyText: {
        marginLeft: 12,
        flex: 1,
    },
    privacyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    privacySubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    hiddenContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    hiddenIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    hiddenTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    hiddenSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    balanceCard: {
        backgroundColor: '#3B82F6',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 24,
    },
    balanceLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 8,
    },
    balanceActions: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    balanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    balanceButtonSecondary: {
        backgroundColor: '#FFFFFF',
    },
    balanceButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    budgetCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    budgetSpent: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
    },
    budgetTotal: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    budgetBarContainer: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginTop: 16,
        overflow: 'hidden',
    },
    budgetBar: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 4,
    },
    budgetRemaining: {
        fontSize: 13,
        color: '#16A34A',
        marginTop: 12,
    },
    transactionsList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    transactionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionContent: {
        flex: 1,
    },
    transactionDesc: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    transactionDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ProfileFinancialTab;
