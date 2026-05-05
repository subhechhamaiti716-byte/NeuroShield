import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../store';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const theme = Colors.dark;
  const [data, setData] = useState(null);
  const [trendTab, setTrendTab] = useState('Week');

  useFocusEffect(
    React.useCallback(() => {
      axios.get(`https://neuroshield-api-8jg5.onrender.com/analytics/${Store.userEmail}`).then(res => setData(res.data)).catch(console.error);
    }, [])
  );

  const getRiskColor = (level) => {
    if (level === 'High') return '#FF4C4C';
    if (level === 'Medium') return '#FFA000';
    return '#00E676';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#060B14' }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="menu" size={24} color="#9BA1A6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NeuroShield</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>OK</Text>
          </View>
        </View>

        {/* 4-Grid Stats */}
        <View style={styles.grid4}>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Total Txns</Text>
              <View style={[styles.iconBox, {backgroundColor: 'rgba(0, 242, 254, 0.1)'}]}>
                <Ionicons name="card" size={16} color="#00f2fe" />
              </View>
            </View>
            <Text style={styles.statValue}>{data?.total_txs || 0}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Total Spent</Text>
              <View style={[styles.iconBox, {backgroundColor: 'rgba(0, 230, 118, 0.1)'}]}>
                <Text style={{color: '#00E676', fontWeight: 'bold'}}>₹</Text>
              </View>
            </View>
            <Text style={styles.statValue}>₹{(data?.total_spent / 1000)?.toFixed(1) || '0'}k</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Fraud Alerts</Text>
              <View style={[styles.iconBox, {backgroundColor: 'rgba(255, 76, 76, 0.1)'}]}>
                <Ionicons name="warning" size={16} color="#FF4C4C" />
              </View>
            </View>
            <Text style={[styles.statValue, {color: '#FF4C4C'}]}>{data?.fraud_alerts || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Risk Level</Text>
              <View style={[styles.iconBox, {backgroundColor: 'rgba(0, 230, 118, 0.1)'}]}>
                <Ionicons name="shield-checkmark" size={16} color="#00E676" />
              </View>
            </View>
            <Text style={[styles.statValue, {color: getRiskColor(data?.risk_level || 'Low')}]}>{data?.risk_level || 'Low'}</Text>
          </View>
        </View>

        {/* Spending Trend (Mock Graph) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Spending Trend</Text>
            <View style={styles.tabs}>
              {['Day', 'Week', 'Month'].map(t => (
                <TouchableOpacity key={t} onPress={() => setTrendTab(t)} style={[styles.tabBtn, trendTab === t && styles.tabActive]}>
                  <Text style={[styles.tabText, trendTab === t && {color: '#00f2fe'}]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.graphContainer}>
            {/* Extremely simple CSS-based mock graph line */}
            <View style={styles.mockLineContainer}>
              <View style={styles.mockLine} />
              <View style={styles.mockPeakDot} />
            </View>
            <View style={styles.graphLabels}>
              {['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <Text key={d} style={styles.graphLabelText}>{d}</Text>)}
            </View>
          </View>
        </View>

        {/* 2-Grid Charts */}
        <View style={styles.grid2}>
          <View style={[styles.card, {flex: 1, marginRight: 8}]}>
            <Text style={styles.cardTitleSmall}>AI Risk Score</Text>
            <View style={styles.circularProgress}>
              <View style={[styles.circleHalf, { borderColor: '#FFA000', transform: [{rotate: '45deg'}] }]} />
              <View style={styles.circleInner}>
                <Text style={styles.circleValue}>{100 - (data?.safe_percentage || 100)}%</Text>
                <Text style={styles.circleSub}>{data?.risk_level || 'Low'} Risk</Text>
              </View>
            </View>
            <Text style={styles.aiConfText}>AI Confidence: {data?.ai_confidence || 98}%</Text>
          </View>

          <View style={[styles.card, {flex: 1, marginLeft: 8}]}>
            <Text style={styles.cardTitleSmall}>Transaction Type</Text>
            <View style={styles.circularProgress}>
              {/* Fake Donut */}
              <View style={styles.donutRing1} />
              <View style={styles.donutRing2} />
              <Ionicons name="pulse" size={24} color="#9BA1A6" style={{position: 'absolute'}} />
            </View>
            <View style={styles.legend}>
              <View style={styles.legendRow}>
                <View style={[styles.dot, {backgroundColor: '#00f2fe'}]} /><Text style={styles.legendText}>Normal</Text>
                <Text style={styles.legendVal}>{data?.safe_percentage || 100}%</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.dot, {backgroundColor: '#FF4C4C'}]} /><Text style={styles.legendText}>Suspicious</Text>
                <Text style={styles.legendVal}>{data?.suspicious_percentage || 0}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Spending Progress Bars */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Category Spending</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9BA1A6" />
          </View>
          
          {data?.categories && Object.entries(data.categories).map(([cat, amount], index) => {
            const colors = ['#00f2fe', '#00E676', '#FF4C4C', '#FFA000'];
            const color = colors[index % colors.length];
            const pct = data.total_spent ? ((amount / data.total_spent) * 100) : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catTextRow}>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, {width: `${pct}%`, backgroundColor: color}]} />
                </View>
              </View>
            );
          })}
          {(!data?.categories || Object.keys(data.categories).length === 0) && (
            <Text style={{color: '#666', marginTop: 10}}>No data available.</Text>
          )}
        </View>

        {/* AI Insights */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <View style={styles.liveTag}><Text style={styles.liveTagText}>Live Updated</Text></View>
        </View>

        <View style={styles.grid2}>
          <View style={[styles.insightCard, {marginRight: 8}]}>
            <Ionicons name="cash-outline" size={20} color="#00f2fe" style={{marginBottom: 8}} />
            <Text style={styles.insightLabel}>Avg Transaction</Text>
            <Text style={styles.insightVal}>₹{data?.avg_transaction || 0}</Text>
          </View>
          <View style={[styles.insightCard, {marginLeft: 8}]}>
            <Ionicons name="time-outline" size={20} color="#00f2fe" style={{marginBottom: 8}} />
            <Text style={styles.insightLabel}>Peak Time</Text>
            <Text style={styles.insightVal}>{data?.peak_time || '--:--'}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 40, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  menuBtn: { padding: 8, backgroundColor: '#111827', borderRadius: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  grid4: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: '#111827', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1F2937' },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statLabel: { color: '#9BA1A6', fontSize: 13, fontWeight: '500' },
  iconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  card: { backgroundColor: '#111827', padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1F2937' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardTitleSmall: { color: '#9BA1A6', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  
  tabs: { flexDirection: 'row' },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  tabActive: { backgroundColor: 'rgba(0, 242, 254, 0.1)' },
  tabText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },

  graphContainer: { height: 120, justifyContent: 'flex-end', paddingTop: 20 },
  mockLineContainer: { flex: 1, justifyContent: 'center', position: 'relative' },
  mockLine: { height: 2, backgroundColor: '#00f2fe', width: '100%', shadowColor: '#00f2fe', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  mockPeakDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4C4C', borderWidth: 2, borderColor: '#111827', top: '20%', left: '40%' },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  graphLabelText: { color: '#6B7280', fontSize: 10 },

  grid2: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  circularProgress: { width: 100, height: 100, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' },
  circleHalf: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: '#1F2937', borderTopColor: '#FFA000', borderRightColor: '#FFA000' },
  circleInner: { alignItems: 'center' },
  circleValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  circleSub: { color: '#FFA000', fontSize: 10, marginTop: 2 },
  aiConfText: { color: '#6B7280', fontSize: 11, textAlign: 'center' },

  donutRing1: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 10, borderColor: '#00f2fe' },
  donutRing2: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 10, borderColor: 'transparent', borderTopColor: '#FF4C4C', transform: [{rotate: '-45deg'}] },
  legend: { marginTop: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { color: '#9BA1A6', fontSize: 12, flex: 1 },
  legendVal: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  catRow: { marginBottom: 16 },
  catTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName: { color: '#9BA1A6', fontSize: 13 },
  catPct: { color: '#fff', fontSize: 13, fontWeight: '600' },
  barBg: { height: 6, backgroundColor: '#1F2937', borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },

  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  liveTag: { backgroundColor: 'rgba(0, 242, 254, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0, 242, 254, 0.2)' },
  liveTagText: { color: '#00f2fe', fontSize: 10, fontWeight: '700' },
  
  insightCard: { flex: 1, backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1F2937' },
  insightLabel: { color: '#9BA1A6', fontSize: 12, marginBottom: 8 },
  insightVal: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
