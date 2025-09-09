import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Alert, Platform, ScrollView, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  CryptoPay: { amount: string; currency?: string; description?: string } | undefined;
  FinalSuccess: undefined;
  FinalFailure: undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CryptoPay'>;

// Prefer a centralized config if you have one; fallback to production API
const API_BASE =
  (typeof process !== 'undefined' && (process as any)?.env?.EXPO_PUBLIC_API_BASE) ||
  (typeof process !== 'undefined' && (process as any)?.env?.API_BASE) ||
  'https://appomarapay-production.up.railway.app';

const POLL_INTERVAL_MS = 5000;
const MAX_ATTEMPTS = 120; // ~10 minutes

const CryptoPay: React.FC<Props> = ({ navigation, route }) => {
  const amount = useMemo(() => String(Number(route?.params?.amount ?? '0').toFixed(2)), [route?.params?.amount]);
  const currency = useMemo(() => (route?.params?.currency ?? 'USD').toUpperCase(), [route?.params?.currency]);
  const description = route?.params?.description ?? 'Crypto payment (Coingate)';

  const [creating, setCreating] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);

  const attemptsRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current as unknown as number);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startPolling = useCallback((id: string) => {
    clearTimer();
    attemptsRef.current = 0;
    intervalRef.current = setInterval(async () => {
      try {
        attemptsRef.current += 1;
        const res = await fetch(`${API_BASE}/api/payments/crypto/${encodeURIComponent(id)}/verify`);
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.success) {
          console.warn('verify crypto failed', res.status, body);
          if (attemptsRef.current % 6 === 0) {
            // surface intermittent errors gently
            setError(`Verify failed (${res.status}). Retrying...`);
          }
          if (attemptsRef.current >= MAX_ATTEMPTS) {
            clearTimer();
            navigation.replace('FinalFailure' as never);
          }
          return;
        }

        const status = String(body?.status || '').toLowerCase();
        if (status === 'succeeded' || status === 'success') {
          clearTimer();
          navigation.replace('FinalSuccess' as never);
          return;
        }
        if (status === 'failed' || status === 'expired' || status === 'canceled') {
          clearTimer();
          navigation.replace('FinalFailure' as never);
          return;
        }

        // still pending — keep polling
      } catch (err) {
        console.warn('verify error', err);
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          clearTimer();
          navigation.replace('FinalFailure' as never);
        }
      }
    }, POLL_INTERVAL_MS) as unknown as number;
  }, [API_BASE, clearTimer, navigation]);

  const createOrder = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/payments/crypto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, name: 'Crypto charge', description }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        console.error('Coingate create order failed', res.status, body);
        setError(body?.message?.error || body?.message || 'Create order failed (Coingate)');
        setCreating(false);
        return;
      }
      const id = body?.chargeId || body?.orderId || body?.id;
      const url = body?.hosted_url || body?.payment_url;
      if (!id || !url) {
        setError('Invalid response from server (missing id/hosted_url)');
        setCreating(false);
        return;
      }
      setOrderId(id);
      setHostedUrl(url);
      setCreating(false);
      startPolling(id);
    } catch (e: any) {
      console.error('create error', e?.message || e);
      setError('Network error creating Coingate order');
      setCreating(false);
    }
  }, [API_BASE, amount, currency, description, startPolling]);

  useEffect(() => {
    createOrder();
  }, [createOrder]);

  const openHosted = useCallback(async () => {
    if (!hostedUrl) return;
    const ok = await Linking.canOpenURL(hostedUrl);
    if (!ok) {
      Alert.alert('Open failed', 'Cannot open payment URL on this device.');
      return;
    }
    Linking.openURL(hostedUrl);
  }, [hostedUrl]);

  const cancel = useCallback(() => {
    clearTimer();
    navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });
  }, [clearTimer, navigation]);

  return (
    <ScrollView contentContainerStyle={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.label}>Pay with Crypto</Text>
        <Text style={styles.amount}>{currency} {amount}</Text>

        <TouchableOpacity style={styles.payBtn} onPress={onPay} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Create checkout</Text>}
        </TouchableOpacity>

        {hostedUrl ? (
          <View style={{ marginTop: 18, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Scan QR to open checkout</Text>
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(hostedUrl)}` }}
              style={{ width: 180, height: 180, borderRadius: 8 }}
            />
            <TouchableOpacity style={[styles.payBtn, { marginTop: 12 }]} onPress={() => Linking.openURL(hostedUrl)}>
              <Text style={styles.payText}>Open checkout</Text>
            </TouchableOpacity>
            {chargeId ? <Text style={styles.note}>Charge ID: {chargeId}</Text> : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 640, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
  label: { fontWeight: '800', fontSize: 18, marginBottom: 6 },
  amount: { fontSize: 24, fontWeight: '900', marginBottom: 12 },
  payBtn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  payText: { color: '#fff', fontWeight: '800' },
  note: { marginTop: 12, color: '#6b7280' },
});

export default CryptoPay;
