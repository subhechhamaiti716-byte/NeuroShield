import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Store } from './store';

export default function AddTransactionScreen() {
  const router = useRouter();
  const theme = Colors.dark;

  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [txType, setTxType] = useState('expense'); // 'income' or 'expense'
  const [lat, setLat] = useState(0.0);
  const [lon, setLon] = useState(0.0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLocating(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsLocating(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        const latitude = currentLocation.coords.latitude;
        const longitude = currentLocation.coords.longitude;
        setLat(latitude);
        setLon(longitude);

        let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          setLocation(`${place.city || place.subregion || 'Unknown City'}, ${place.region || place.country}`);
        } else {
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      } catch (error) {
        console.error("Location error:", error);
      } finally {
        setIsLocating(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalReceiptUrl = null;
      if (receiptUri) {
        const formData = new FormData();
        formData.append('file', {
          uri: receiptUri,
          name: 'receipt.jpg',
          type: 'image/jpeg',
        } as any);
        const uploadRes = await axios.post('http://10.110.159.61:8080/upload-receipt', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalReceiptUrl = uploadRes.data.receipt_url;
      }

      const response = await axios.post('http://10.110.159.61:8080/transaction/check', {
        amount: parseFloat(amount),
        type: txType,
        category: category || "General",
        time: new Date().toISOString(),
        location: location || "Manual Entry",
        lat: lat,
        lon: lon,
        receipt_url: finalReceiptUrl,
        user_email: Store.userEmail,
        device_id: 'device_xyz123',
        device_model: 'Android 14'
      });

      const { fraud_score, is_suspicious } = response.data;
      setIsSubmitting(false);

      if (is_suspicious) {
        Alert.alert(
          '🚨 Suspicious Transaction',
          `Fraud Score: ${fraud_score}\nThis looks unusual based on your location and amount. Was this you?`,
          [
            { text: 'Report Fraud', style: 'destructive' },
            { text: 'Yes, It was me', onPress: () => router.back() },
          ]
        );
      } else {
        Alert.alert('Success', 'Transaction added securely.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Connection Error', 'Could not connect to the ML Backend.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Transaction</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Toggle Income / Expense */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, txType === 'expense' && styles.toggleBtnActive]} 
              onPress={() => setTxType('expense')}
            >
              <Text style={[styles.toggleText, txType === 'expense' && { color: '#0B0F19' }]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, txType === 'income' && [styles.toggleBtnActive, { backgroundColor: theme.success }]]} 
              onPress={() => setTxType('income')}
            >
              <Text style={[styles.toggleText, txType === 'income' && { color: '#0B0F19' }]}>Income</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, txType === 'income' && { color: theme.success }]}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CATEGORY</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="pricetag" size={20} color={txType === 'income' ? theme.success : "#00f2fe"} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Shopping, Salary..."
                  placeholderTextColor="#666"
                  value={category}
                  onChangeText={setCategory}
                />
              </View>
            </View>

            {/* Receipt Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>RECEIPT (OPTIONAL)</Text>
              <TouchableOpacity onPress={pickImage} style={{ flexRow: 'row', alignItems: 'center', backgroundColor: '#111827', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', marginTop: 8 }}>
                <Ionicons name="camera" size={20} color={txType === 'income' ? theme.success : "#00f2fe"} style={{marginRight: 10}} />
                <Text style={{color: '#fff'}}>{receiptUri ? "Change Receipt Image" : "Attach Receipt Image"}</Text>
              </TouchableOpacity>
              {receiptUri && <Image source={{ uri: receiptUri }} style={{ width: '100%', height: 150, borderRadius: 12, marginTop: 10 }} />}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DETECTED LOCATION</Text>
              <View style={styles.inputWrapper}>
                {isLocating ? (
                  <ActivityIndicator size="small" color="#00f2fe" style={styles.inputIcon} />
                ) : (
                  <Ionicons name="location" size={20} color={txType === 'income' ? theme.success : "#00f2fe"} style={styles.inputIcon} />
                )}
                <TextInput
                  style={styles.textInput}
                  placeholder={isLocating ? "Getting GPS Location..." : "Location"}
                  placeholderTextColor="#666"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }, txType === 'income' && { backgroundColor: theme.success, shadowColor: theme.success }]} 
            onPress={handleSubmit}
            disabled={isSubmitting || isLocating}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Processing...' : `Submit ${txType === 'income' ? 'Income' : 'Expense'}`}
            </Text>
            {!isSubmitting && <Ionicons name="shield-checkmark" size={20} color="#0B0F19" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#161B2B', borderRadius: 16, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: '#2A3042' },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#00f2fe' },
  toggleText: { color: '#9BA1A6', fontWeight: 'bold', fontSize: 16 },
  card: { borderRadius: 24, padding: 24, marginBottom: 30, borderWidth: 1, borderColor: '#2A3042' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#2A3042', paddingBottom: 20 },
  currencySymbol: { color: '#00f2fe', fontSize: 40, fontWeight: 'bold', marginRight: 8 },
  amountInput: { color: '#fff', fontSize: 48, fontWeight: 'bold', minWidth: 100 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#9BA1A6', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0F19', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#2A3042' },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 16 },
  submitButton: { backgroundColor: '#00f2fe', flexDirection: 'row', borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#00f2fe', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  submitButtonText: { color: '#0B0F19', fontSize: 16, fontWeight: '700' },
});
