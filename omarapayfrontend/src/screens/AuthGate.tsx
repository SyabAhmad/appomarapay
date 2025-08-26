import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  AuthGate: undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'AuthGate'>;

const AuthGate: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });
    }, 1500); // splash duration in ms
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <View style={styles.badge}>
        <Text style={styles.check}>✓</Text>
      </View>
      <Text style={styles.title}>OmaraPay</Text>
      <Text style={styles.subtitle}>Redirecting to payment...</Text>
      <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 18 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 160, height: 44, marginBottom: 18 },
  badge: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  check: { fontSize: 40, color: '#10b981', fontWeight: '800' },
  title: { fontSize: 24, color: '#111827', fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6b7280', fontWeight: '400', marginBottom: 24, textAlign: 'center' },
});

export default AuthGate;