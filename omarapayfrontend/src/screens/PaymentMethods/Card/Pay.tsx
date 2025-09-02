import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { API_BASE } from '../config/env';

type Props = {
  navigation: any;
  route: { params?: { amount?: string; currency?: string; description?: string; metadata?: Record<string, any> } };
};

const CardPayment: React.FC<Props> = ({ navigation, route }) => {
  const amount = String(Number(route?.params?.amount ?? '0').toFixed(2));
  const currency = (route?.params?.currency ?? 'usd').toLowerCase();
  const description = route?.params?.description ?? 'Payment';
  const metadata = route?.params?.metadata ?? {};

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const createPI = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, metadata }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.clientSecret) {
        throw new Error(body?.message || `Failed (${res.status}) creating PaymentIntent`);
      }
      setClientSecret(body.clientSecret);

      // Initialize PaymentSheet with Google Pay enabled
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'OmaraPay',
        merchantCountryCode: 'PH', // set to your legal country
        paymentIntentClientSecret: body.clientSecret,
        googlePay: {
          merchantCountryCode: 'PH',
          testEnv: true, // set false in production when your Google Pay merchant is approved
        },
        style: 'alwaysLight',
      });
      if (error) throw new Error(error.message);
      setReady(true);
    } catch (e: any) {
      Alert.alert('Init failed', e?.message ?? 'Unable to initialize payment');
    } finally {
      setLoading(false);
    }
  }, [amount, currency, metadata]);

  useEffect(() => {
    createPI();
  }, [createPI]);

  const payWithGooglePay = async () => {
    if (!clientSecret) return;
    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        Alert.alert('Payment error', error.message);
        setLoading(false);
        return;
      }
      // Success — go to receipt (no hosted_url for card)
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'CardReceipt' as never,
            params: {
              chainName: 'Card (Google Pay)',
              tokenSymbol: 'USD',
              tokenAmount: amount,
              usdAmount: amount,
              mobile: metadata?.phone ?? '-',
              receivingAddress: clientSecret.split('_secret_')[0], // show PI id
              hosted_url: null,
              chargeId: null,
              txId: clientSecret.split('_secret_')[0],
            } as never,
          },
        ],
      });
    } catch (e: any) {
      Alert.alert('Payment error', e?.message ?? 'Failed to complete payment');
    } finally {
      setLoading(false);
    }
  };

  const payWithCard = async () => {
    // If you already have your CardField flow, keep it here as a fallback.
    Alert.alert('Use card form', 'Fallback to manual card entry (existing flow).');
  };

  return (
    <View style={styles.safe}>
      <Text style={styles.title}>Card payment</Text>
      <Text style={styles.sub}>Charge ${Number(amount).toFixed(2)}</Text>

      <TouchableOpacity
        style={[styles.primary, !ready || loading ? { opacity: 0.6 } : null]}
        onPress={payWithGooglePay}
        disabled={!ready || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Pay with Google Pay</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.ghost} onPress={payWithCard} disabled={loading}>
        <Text style={styles.ghostText}>Pay with card</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sub: { color: '#6b7280', marginBottom: 16 },
  primary: { backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 22, borderRadius: 12, minWidth: 220, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#fff', fontWeight: '800' },
  ghost: { backgroundColor: '#eef2ff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, minWidth: 220, alignItems: 'center', marginTop: 10 },
  ghostText: { fontWeight: '800', color: '#0f172a' },
});

export default CardPayment;
