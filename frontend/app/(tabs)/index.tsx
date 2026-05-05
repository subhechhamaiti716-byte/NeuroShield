import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../store';

export default function DashboardScreen() {
  const theme = Colors.dark;
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`http://10.110.159.61:8080/dashboard/${Store.userEmail}`);
      setDashboardData(res.data);
    } catch (e) {
      console.error('Failed to fetch dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
    }, [])
  );

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={theme.tint} /></View>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={() => router.replace('/login')} style={{marginRight: 12, backgroundColor: 'rgba(255,76,76,0.1)', padding: 8, borderRadius: 12}}>
              <Ionicons name="log-out-outline" size={20} color={theme.danger} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>OK</Text>
            </View>
            <Text style={styles.headerTitle}>NeuroShield</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
          <Text style={styles.balanceLabel}>Total Protected Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{dashboardData?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </Text>
          <View style={[styles.riskBadge, dashboardData?.risk_level === 'HIGH' && { backgroundColor: 'rgba(255,76,76,0.1)', borderColor: 'rgba(255,76,76,0.3)' }]}>
            <Ionicons name={dashboardData?.risk_level === 'HIGH' ? "warning" : "shield-checkmark"} size={16} color={dashboardData?.risk_level === 'HIGH' ? theme.danger : theme.success} />
            <Text style={[styles.riskText, dashboardData?.risk_level === 'HIGH' && { color: theme.danger }]}>
              RISK LEVEL: {dashboardData?.risk_level || 'LOW'}
            </Text>
          </View>
        </View>

        {/* Add Transaction Button */}
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/add-transaction')}>
          <Text style={styles.actionButtonText}>+ Add Transaction</Text>
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.transactionList, { backgroundColor: theme.card }]}>
          {dashboardData?.recent_transactions?.length === 0 && (
            <Text style={{ color: '#666', textAlign: 'center', padding: 20 }}>No recent transactions.</Text>
          )}
          {dashboardData?.recent_transactions?.map((tx, index) => (
            <View key={tx.id || index} style={[styles.transactionItem, tx.is_suspicious && styles.suspiciousItem]}>
              <View style={[styles.iconContainer, tx.is_suspicious && { backgroundColor: theme.danger }]}>
                <Ionicons name={tx.is_suspicious ? "warning" : "card"} size={20} color="#fff" />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionName, tx.is_suspicious && { color: theme.danger }]}>
                  {tx.is_suspicious ? "Suspicious Activity" : tx.category}
                </Text>
                <Text style={[styles.transactionTime, tx.is_suspicious && { color: theme.danger }]}>
                  {tx.is_suspicious ? "Action Required" : new Date(tx.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
              <Text style={[styles.transactionAmount, tx.is_suspicious && { color: theme.danger }, tx.type === 'income' && { color: theme.success }]}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00f2fe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  notificationBtn: { position: 'relative', padding: 8, backgroundColor: '#161B2B', borderRadius: 12 },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4C4C', borderWidth: 1.5, borderColor: '#161B2B' },
  balanceCard: { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#2A3042', shadowColor: '#00f2fe', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  balanceLabel: { color: '#9BA1A6', fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: '#fff', fontSize: 40, fontWeight: '800', marginBottom: 16, letterSpacing: -1 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)' },
  riskText: { color: '#00E676', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  actionButton: { backgroundColor: '#00f2fe', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 30, shadowColor: '#00f2fe', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  actionButtonText: { color: '#0B0F19', fontSize: 16, fontWeight: '700' },
  transactionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  seeAllText: { color: '#00f2fe', fontSize: 14, fontWeight: '600' },
  transactionList: { borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#2A3042' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2A3042' },
  suspiciousItem: { borderBottomWidth: 0, backgroundColor: 'rgba(255, 76, 76, 0.05)', marginHorizontal: -16, paddingHorizontal: 16, borderRadius: 12, marginVertical: 4 },
  iconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#2A3042', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  transactionDetails: { flex: 1 },
  transactionName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  transactionTime: { color: '#9BA1A6', fontSize: 13 },
  transactionAmount: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
