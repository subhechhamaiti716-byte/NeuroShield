import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../store';

export default function HistoryScreen() {
  const theme = Colors.dark;
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 10;

  const fetchHistory = async (reset = false) => {
    try {
      if (!reset) setLoadingMore(true);
      const skip = reset ? 0 : page * limit;
      const res = await axios.get(`http://10.110.159.61:8080/transactions/${Store.userEmail}?skip=${skip}&limit=${limit}`);
      
      if (reset) {
        setTransactions(res.data.transactions);
        setPage(1);
      } else {
        setTransactions(prev => [...prev, ...res.data.transactions]);
        setPage(prev => prev + 1);
      }
      setHasMore(res.data.has_more);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHistory(true);
    }, [])
  );

  const resolveTx = async (id, isSafe) => {
    try {
      await axios.post(`http://10.110.159.61:8080/transaction/resolve?tx_id=${id}&is_safe=${isSafe}`);
      fetchHistory(true);
    } catch(e) {}
  }

  const filteredTxs = transactions.filter(t => {
    // 1. Tab Filter
    if (filter === 'Alerts' && !t.is_suspicious) return false;
    if (filter === 'Income' && t.type !== 'income') return false;
    if (filter === 'Expense' && t.type !== 'expense') return false;

    // 2. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCat = t.category?.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      if (!matchCat && !matchNotes) return false;
    }

    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9BA1A6" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by category or notes..."
          placeholderTextColor="#9BA1A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filters}>
        {['All', 'Income', 'Expense', 'Alerts'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterActive]}>
            <Text style={[styles.filterText, filter === f && { color: '#00f2fe' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredTxs.length === 0 && <Text style={{color: '#999', textAlign: 'center'}}>No transactions found.</Text>}
        {filteredTxs.map((tx, i) => (
          <View key={i} style={[styles.txCard, tx.is_suspicious && { borderColor: theme.danger }]}>
            <View style={styles.txHeader}>
              <View style={styles.txLeft}>
                <View style={[styles.icon, tx.is_suspicious && { backgroundColor: theme.danger }]}>
                  <Ionicons name={tx.is_suspicious ? 'warning' : 'cart'} size={20} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.title, tx.is_suspicious && { color: theme.danger }]}>
                    {tx.category || "General"}
                  </Text>
                  <Text style={styles.time}>{new Date(tx.time).toLocaleString()}</Text>
                </View>
              </View>
              <Text style={[styles.amount, tx.is_suspicious && { color: theme.danger }, tx.type === 'income' && { color: theme.success }]}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
              </Text>
            </View>

            {tx.is_suspicious && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.btnSafe} onPress={() => resolveTx(tx.id, true)}>
                  <Text style={{color: '#00E676', fontWeight: 'bold'}}>Mark Safe</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnFraud} onPress={() => resolveTx(tx.id, false)}>
                  <Text style={{color: '#FF4C4C', fontWeight: 'bold'}}>Confirm Fraud</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {hasMore && (
          <TouchableOpacity 
            style={styles.loadMoreBtn} 
            onPress={() => fetchHistory(false)}
            disabled={loadingMore}
          >
            <Text style={styles.loadMoreText}>
              {loadingMore ? "Loading..." : "Load More"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', height: 48 },
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 16 },
  filters: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  filterBtn: { marginRight: 16, paddingBottom: 8 },
  filterActive: { borderBottomWidth: 2, borderBottomColor: '#00f2fe' },
  filterText: { color: '#9BA1A6', fontSize: 16, fontWeight: '600' },
  list: { padding: 20 },
  txCard: { backgroundColor: '#161B2B', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A3042' },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txLeft: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#2A3042', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  time: { color: '#9BA1A6', fontSize: 12, marginTop: 4 },
  amount: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2A3042' },
  btnSafe: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: 'rgba(0,230,118,0.1)', borderRadius: 8, marginRight: 8 },
  btnFraud: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,76,76,0.1)', borderRadius: 8, marginLeft: 8 },
  loadMoreBtn: { padding: 16, alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', marginTop: 8 },
  loadMoreText: { color: '#00f2fe', fontWeight: 'bold', fontSize: 16 }
});
