import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Store } from './store';

export default function SignupScreen() {
  const router = useRouter();
  const theme = Colors.dark;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      const res = await axios.post('http://10.110.159.61:8080/signup', { 
        name, 
        email, 
        phone, 
        password,
        initial_balance: parseFloat(initialBalance) || 0.0
      });
      if (res.data.status === 'success') {
        Store.userEmail = email;
        Alert.alert('Success', 'Account created! Please log in.');
        router.replace('/login');
      }
    } catch (e) {
      Alert.alert('Signup Failed', 'Could not create account.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>NeuroShield</Text>
            <Text style={styles.subtitle}>Create Your Secure Account</Text>
          </View>

          <View style={styles.form}>
            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Full Name" placeholderTextColor={theme.icon} value={name} onChangeText={setName} />
            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Email" placeholderTextColor={theme.icon} value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Phone Number" placeholderTextColor={theme.icon} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Initial Balance (₹)" placeholderTextColor={theme.icon} value={initialBalance} onChangeText={setInitialBalance} keyboardType="decimal-pad" />
            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Password" placeholderTextColor={theme.icon} secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Confirm Password" placeholderTextColor={theme.icon} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
            
            <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
              <Text style={styles.signupText}>Create Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkBtn}>
              <Text style={styles.linkText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#00f2fe', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9BA1A6' },
  form: { backgroundColor: '#161B2B', padding: 24, borderRadius: 24 },
  input: { borderWidth: 1, borderColor: '#2A3042', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16 },
  signupBtn: { backgroundColor: '#00f2fe', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  signupText: { color: '#0B0F19', fontSize: 16, fontWeight: 'bold' },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#00f2fe', fontSize: 14 },
});
