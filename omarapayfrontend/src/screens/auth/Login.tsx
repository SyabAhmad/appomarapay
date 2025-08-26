import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = { Login: undefined; Signup: undefined; Home: undefined };
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const Login: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  // use emulator host for Android; if testing on a real device set to your machine IP (e.g. http://192.168.1.10:5000)
  const API_BASE =
    Platform.OS === 'android'
      // ? 'http://10.0.2.2:5000'
      ? 'http://192.168.0.109:5000'
      : 'http://localhost:5000';

  const onLogin = async () => {
    if (!email || !pass) {
      Alert.alert('Error', 'Enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const body = await res.json();
      if (!res.ok) {
        Alert.alert('Login failed', body.message || 'Invalid credentials');
        return;
      }
      const { token, user } = body;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      // go to payment flow after auth
      navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Error', err?.message ?? 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Welcome to OMARA Pay</Text>
        <Text style={styles.subtitle}>The future of digital payments.</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <View style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Login</Text>
          </View>
          <TouchableOpacity style={[styles.tab, styles.tabInactive]} onPress={() => navigation.navigate('Signup' as never)}>
            <Text style={[styles.tabText, styles.tabTextInactive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#9aa2af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={pass}
              onChangeText={setPass}
              placeholderTextColor="#9aa2af"
            />
          </View>

          <TouchableOpacity style={[styles.cta, { opacity: loading ? 0.7 : 1 }]} onPress={onLogin} disabled={loading}>
            <Text style={styles.ctaText}>{loading ? 'Signing in…' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: { width: 140, height: 48, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  subtitle: { marginTop: 6, color: '#6b7280', textAlign: 'center' },

  tabs: {
    marginTop: 18,
    flexDirection: 'row',
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabInactive: { backgroundColor: 'transparent' },
  tabActive: { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  tabText: { fontWeight: '700', fontSize: 14 },
  tabTextInactive: { color: '#64748b' },
  tabTextActive: { color: '#111827' },

  card: {
    marginTop: 14,
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
  },
  cta: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default Login;