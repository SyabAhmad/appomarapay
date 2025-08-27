import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking, Platform, ScrollView, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {BASE_API_URL} from '@env';
type RootStackParamList = {
  CryptoPay: { amount: string; currency?: string; description?: string } | undefined;
  FinalSuccess: undefined;
  FinalFailure: undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CryptoPay'>;

// const API_BASE = Platform.OS === 'android' ? 'http://192.168.0.109:5000' : 'http://localhost:5000';
// For a physical device replace API_BASE with http://<PC_IP>:5000
const API_BASE = BASE_API_URL;

const POLL_INTERVAL_MS = 5000;
const MAX_ATTEMPTS = 120; // ~10 minutes

const CryptoPay: React.FC<Props> = ({ navigation, route }) => {
  const { amount = '1.00', currency = 'USD', description = '' } = route.params ?? {};
  const [loading, setLoading] = useState(false);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startPolling = (id: string) => {
    attemptsRef.current = 0;
    intervalRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      try {
        const res = await fetch(`${API_BASE}/api/payments/crypto/${id}`);
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          console.warn('poll error', res.status, body);
        } else {
          const charge = body?.charge;
          // get latest timeline status where available
          const lastStatus = charge?.timeline?.slice(-1)[0]?.status?.toUpperCase() ?? (body?.localTx?.status ?? '').toUpperCase();

          // treat typical final statuses
          if (lastStatus === 'COMPLETED' || lastStatus === 'RESOLVED' || lastStatus === 'CONFIRMED') {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'FinalSuccess' as never,
                  params: {
                    success: true,
                    chainName: 'Crypto',
                    tokenSymbol: currency,
                    tokenAmount: amount,
                    usdAmount: amount,
                    mobile: '-',
                    receivingAddress: charge?.addresses ?? charge?.hosted_url ?? '',
                  } as never,
                },
              ],
            });
            return;
          }

          if (lastStatus === 'EXPIRED' || lastStatus === 'CANCELED' || lastStatus === 'UNRESOLVED' || lastStatus === 'FAILED') {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'FinalFailure' as never,
                  params: {
                    chainName: 'Crypto',
                    tokenSymbol: currency,
                    tokenAmount: amount,
                    usdAmount: amount,
                    mobile: '-',
                    receivingAddress: charge?.addresses ?? '',
                    errorMessage: `Payment status: ${lastStatus}`,
                  } as never,
                },
              ],
            });
            return;
          }
        }
      } catch (err) {
        console.error('poll fetch error', err);
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        Alert.alert('Timeout', 'Payment not completed within expected time. Please try again or contact support.');
      }
    }, POLL_INTERVAL_MS) as unknown as number;
  };

  const onPay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/crypto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, name: 'Order', description }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert('Error', body?.message ?? `Status ${res.status}`);
        setLoading(false);
        return;
      }
      const hosted = body.hosted_url;
      const id = body.chargeId;
      setChargeId(id);
      setHostedUrl(hosted ?? null);

      // open hosted_url in external browser
      if (hosted) {
        const ok = await Linking.canOpenURL(hosted);
        if (ok) Linking.openURL(hosted);
      }

      // start polling for charge status
      startPolling(id);
    } catch (err: any) {
      console.error('create crypto error', err);
      Alert.alert('Error', err?.message ?? 'Network error');
    } finally {
      setLoading(false);
    }
  };

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