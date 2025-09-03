import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_BASE } from '../../../../config/env'; // adjust path if your env wrapper is elsewhere

type RootStackParamList = {
  GCashConfirm: { chainId?: string; chainName?: string; selectedAmount?: string } | undefined;
  GCashPhone: { chainId?: string; chainName?: string; selectedAmount?: string } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'GCashConfirm'>;

const ConfirmPayment: React.FC<Props> = ({ navigation, route }) => {
  const { chainId = 'gcash', chainName = 'GCash', selectedAmount = '0.00' } = route.params ?? {};
  const [loading, setLoading] = useState(false);

  const phpAmount = Number(selectedAmount || '0');

  const onConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/gcash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: phpAmount, currency: 'PHP' }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        console.error('create gcash checkout failed', res.status, body);
        Alert.alert('Create checkout failed', body?.message || JSON.stringify(body) || 'Failed to create GCash checkout');
        setLoading(false);
        return;
      }
      // navigate to QR/receipt screen (ensure route name matches your navigator)
      navigation.navigate('GCashReceipt' as never, { hosted_url: body.hosted_url, phpAmount: String(phpAmount) } as never);
    } catch (err) {
      console.error('gcash create error', err);
      Alert.alert('Network error', 'Unable to create GCash checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm GCash payment</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.card}>
        <Image source={require('../../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.amountLabel}>Amount (PHP)</Text>
        <Text style={styles.amount}>₱{Number(selectedAmount || '0').toFixed(2)}</Text>

        <View style={styles.sep} />

        <View style={styles.row}>
          <Text style={styles.label}>Method</Text>
          <Text style={styles.valueRight}>{chainName}</Text>
        </View>

        <View style={styles.sep} />

        <Text style={styles.note}>No conversion. This will create a GCash checkout in PHP.</Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading ? { opacity: 0.6 } : null]}
          onPress={onConfirm}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm Amount</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', paddingTop: Platform.OS === 'android' ? 12 : 26, alignItems: 'center' },
  header: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '700', fontSize: 16, color: '#0f172a' },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logo: { width: 120, height: 36, alignSelf: 'center', marginBottom: 8 },
  amountLabel: { color: '#6b7280', textAlign: 'center' },
  amount: { fontSize: 44, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#6b7280' },
  valueRight: { fontWeight: '800' },
  sep: { height: 1, backgroundColor: '#eef2ff', marginVertical: 12 },
  note: { color: '#6b7280', textAlign: 'center' },
  bottom: { position: 'absolute', left: 16, right: 16, bottom: 18, alignItems: 'center' },
  confirmBtn: { width: '100%', maxWidth: 560, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800' },
});

export default ConfirmPayment;
