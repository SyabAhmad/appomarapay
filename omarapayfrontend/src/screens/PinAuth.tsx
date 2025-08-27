import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  PinAuth: undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'PinAuth'>;

const NumpadButton: React.FC<{ label: string; onPress: () => void; style?: any }> = ({ label, onPress, style }) => (
  <TouchableOpacity style={[styles.key, style]} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.keyText}>{label}</Text>
  </TouchableOpacity>
);

const PinAuth: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(''); // optional company-provided id / email
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const maxLen = 6; // allow up to 6 digits
  const onKey = (d: string) => {
    if (pin.length >= maxLen) return;
    setPin((p) => p + d);
  };
  const onBack = () => setPin((p) => p.slice(0, -1));
  const onClear = () => setPin('');

  // Only accept exactly four zeros
  const isValidPin = () => {
    return pin === '0000';
  };

  const masked = Array.from({ length: pin.length }).map(() => '●').join('');

  const submit = async () => {
    if (!isValidPin()) {
      Alert.alert('Invalid PIN', 'PIN must be exactly "0000"');
      return;
    }
    
    setLoading(true);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      // Navigate directly to payment method without backend call
      navigation.reset({ 
        index: 0, 
        routes: [{ name: 'PaymentMethod' as never }] 
      });
      setLoading(false);
    }, 1000); // 1 second delay for visual feedback
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Sign in with company PIN</Text>
        <Text style={styles.subtitle}>Enter the PIN provided by your company</Text>
      </View>

      <View style={styles.card}>
        <TextInput
          placeholder="Optional ID / Email"
          value={identifier}
          onChangeText={setIdentifier}
          style={styles.input}
          autoCapitalize="none"
        />

        <View style={styles.pinRow}>
          <Text style={styles.pinMasked}>{masked || 'Enter PIN'}</Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.numpad}>
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <NumpadButton key={n} label={String(n)} onPress={() => onKey(String(n))} />
          ))}
          <NumpadButton label={'⌫'} onPress={onBack} style={styles.keySpecial} />
          <NumpadButton label={'0'} onPress={() => onKey('0')} />
          <TouchableOpacity
            style={[styles.key, !isValidPin() ? styles.keyDisabled : styles.keySubmit]}
            onPress={submit}
            disabled={!isValidPin() || loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.keyText, { color: '#fff' }]}>OK</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.hint}>If you don't have a PIN, contact your company admin.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', padding: 20, alignItems: 'center' },
  header: { marginTop: 36, marginBottom: 18, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#6b7280', marginTop: 6 },

  card: { width: '100%', maxWidth: 560, backgroundColor: '#fff', padding: 16, borderRadius: 12, marginTop: 12, alignItems: 'center' },
  input: { width: '100%', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e6eef8', marginBottom: 12 },

  pinRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pinMasked: { fontSize: 22, fontWeight: '800' },
  clearText: { color: '#2563eb', fontWeight: '800' },

  numpad: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  key: { width: '30%', aspectRatio: 1, backgroundColor: '#fff', marginBottom: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6eef8' },
  keyText: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  keySpecial: { backgroundColor: '#fff' },
  keySubmit: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  keyDisabled: { opacity: 0.55, backgroundColor: '#94a3b8', borderColor: '#94a3b8' },

  hint: { marginTop: 12, color: '#6b7280' },
});

export default PinAuth;