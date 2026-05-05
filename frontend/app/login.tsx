import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Store } from './store';

export default function LoginScreen() {
  const router = useRouter();
  const theme = Colors.dark;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://10.110.159.61:8080/login', { email, password });
      if (res.data.status === 'success') {
        Store.userEmail = email;
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Login Failed', 'Invalid credentials or backend not reachable.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>NeuroShield</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { borderColor: theme.card, color: theme.text }]}
            placeholder="Email"
            placeholderTextColor={theme.icon}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { borderColor: theme.card, color: theme.text }]}
            placeholder="Password"
            placeholderTextColor={theme.icon}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBtn}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#00f2fe', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#9BA1A6' },
  form: { backgroundColor: '#161B2B', padding: 24, borderRadius: 24 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16 },
  loginBtn: { backgroundColor: '#00f2fe', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  loginText: { color: '#0B0F19', fontSize: 16, fontWeight: 'bold' },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#00f2fe', fontSize: 14 },
});
