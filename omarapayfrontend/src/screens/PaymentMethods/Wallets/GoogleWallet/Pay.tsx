import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, InteractionManager, Platform, ScrollView } from 'react-native';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { API_BASE } from '../../../../config/env';

type Props = {
  navigation: any;
  route: { params?: { amount?: string; currency?: string; description?: string; metadata?: Record<string, any> } };
};

const GoogleWalletPay: React.FC<Props> = ({ navigation, route }) => {
  const amount = String(Number(route?.params?.amount ?? '0').toFixed(2));
  const currency = (route?.params?.currency ?? 'usd').toLowerCase();
  const description = route?.params?.description ?? 'Payment';
  const metadata = route?.params?.metadata ?? {};

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needInitRetry, setNeedInitRetry] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const createPI = useCallback(async () => {
    setLoading(true);
    setNeedInitRetry(false);
    try {
      const res = await fetch(`${API_BASE}/api/payments/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, metadata }),
      });
      const body = await res.json().catch(() => null);
      console.debug('createPI response', { status: res.status, body });
      if (!res.ok || !body?.clientSecret) {
        const msg = body?.message || `Failed (${res.status}) creating PaymentIntent - check backend`;
        throw new Error(msg);
      }
      setClientSecret(body.clientSecret);

      // Wait for native UI to be attached before initializing PaymentSheet
      InteractionManager.runAfterInteractions(async () => {
        try {
          const { error } = await initPaymentSheet({
            merchantDisplayName: 'OmaraPay',
            merchantCountryCode: 'PH',
            paymentIntentClientSecret: body.clientSecret,
            googlePay: { merchantCountryCode: 'PH', testEnv: true },
            style: 'alwaysLight',
          });
          console.debug('initPaymentSheet result', { error });
          if (error) throw new Error(error.message);
          setReady(true);
        } catch (initErr: any) {
          const msg = String(initErr?.message || initErr);
          console.warn('initPaymentSheet failed', msg);
          if (msg.includes('Activity') || msg.includes("Activity doesn't exist")) {
            setNeedInitRetry(true);
          } else {
            try { Alert.alert('Init failed', msg); } catch {}
          }
        } finally {
          setLoading(false);
        }
      });
    } catch (e: any) {
      const msg = String(e?.message || e);
      console.error('createPI/init failed', msg);
      if (msg.includes('Activity') || msg.includes("Activity doesn't exist")) {
        setNeedInitRetry(true);
      } else {
        try { Alert.alert('Init failed', msg); } catch {}
      }
      setLoading(false);
    }
  }, [amount, currency, metadata]);

  useEffect(() => {
    // small delay to increase chance native Activity is ready on Android
    const t = setTimeout(() => createPI(), Platform.OS === 'android' ? 150 : 0);
    return () => clearTimeout(t);
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
      // Success — go to receipt
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'GoogleWalletReceipt' as never,
            params: {
              chainName: 'Google Wallet',
              tokenSymbol: 'USD',
              tokenAmount: amount,
              usdAmount: amount,
              mobile: metadata?.phone ?? '-',
              receivingAddress: clientSecret.split('_secret_')[0], // PI id
              paymentIntentId: clientSecret.split('_secret_')[0],
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
    // Navigate to manual card entry (assume you have a CardForm screen or integrate CardField here)
    Alert.alert('Manual card', 'Navigate to card form (implement CardForm screen)');
    // Example: navigation.navigate('CardForm' as never, { clientSecret, amount, ... });
  };

  return (
    <ScrollView contentContainerStyle={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation?.canGoBack && navigation.canGoBack() ? navigation.goBack() : navigation.reset({ index: 0, routes: [{ name: 'WalletStart' as never }] }))}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Google Wallet payment</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.sub}>Charge ${Number(amount).toFixed(2)}</Text>
      <Text style={{ color: '#6b7280', marginTop: 6 }}>
        {loading ? 'Initializing payment...' : ready ? 'Ready: Google Wallet available' : needInitRetry ? 'Initialization failed — retry' : 'Not initialized (tap Retry)'}
      </Text>

      <TouchableOpacity style={[styles.primary, !ready || loading ? { opacity: 0.6 } : null]} onPress={payWithGooglePay} disabled={!ready || loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Pay with Google Wallet (Tap/Swipe)</Text>}
      </TouchableOpacity>

      {!ready && !loading ? (
        <TouchableOpacity style={[styles.ghost, { marginTop: 12 }]} onPress={() => createPI()} disabled={loading}>
          <Text style={styles.ghostText}>{needInitRetry ? 'Retry initialization' : 'Retry initialization'}</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.ghost} onPress={payWithCard} disabled={loading}>
        <Text style={styles.ghostText}>Enter card manually</Text>
      </TouchableOpacity>

      {/* debug UI removed */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { width: '100%', maxWidth: 560, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { color: '#6b7280', marginBottom: 16 },
  primary: { backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 22, borderRadius: 12, minWidth: 220, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#fff', fontWeight: '800' },
  ghost: { backgroundColor: '#eef2ff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, minWidth: 220, alignItems: 'center', marginTop: 10 },
  ghostText: { fontWeight: '800', color: '#0f172a' },
});

export default GoogleWalletPay;
