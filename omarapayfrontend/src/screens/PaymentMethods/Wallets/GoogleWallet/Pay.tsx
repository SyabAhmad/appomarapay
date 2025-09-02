import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, InteractionManager, Platform, ScrollView, Image } from 'react-native';
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

  // behavior state (unchanged)
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
              receivingAddress: clientSecret.split('_secret_')[0],
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
    Alert.alert('Manual card', 'Navigate to card form (implement CardForm screen)');
  };

  // UI redesigned to match other screens (PaymentMethod / Start)
  return (
    <View style={uiStyles.safe}>
      <ScrollView contentContainerStyle={uiStyles.container}>
        <View style={uiStyles.topRow}>
          <Text style={uiStyles.topTitle}>Checkout</Text>
          <TouchableOpacity style={uiStyles.outlineBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] })}>
            <Text style={uiStyles.outlineBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Image source={require('../../../../../assets/logo.png')} style={uiStyles.logo} resizeMode="contain" />

        <View style={uiStyles.panel}>
          <Text style={uiStyles.panelTitle}>Pay with Google Pay</Text>
          <Text style={uiStyles.panelSubtitle}>Quick tap-to-pay powered by Stripe</Text>

          <View style={uiStyles.row}>
            <View style={uiStyles.amountCol}>
              <Text style={uiStyles.amountLabel}>Amount</Text>
              <Text style={uiStyles.amountValue}>${Number(amount).toFixed(2)}</Text>
            </View>

            <View style={uiStyles.statusCol}>
              <Text style={uiStyles.small}>Status</Text>
              <View style={[uiStyles.statusBadge, ready ? uiStyles.statusReady : needInitRetry ? uiStyles.statusWarn : uiStyles.statusIdle]}>
                <Text style={uiStyles.statusText}>{loading ? 'Initializing' : ready ? 'Ready' : needInitRetry ? 'Init failed' : 'Not ready'}</Text>
              </View>
            </View>
          </View>

          <Text style={uiStyles.description}>{description}</Text>

          <View style={uiStyles.actions}>
            <TouchableOpacity
              style={[uiStyles.selectBtn, (!ready || loading) ? uiStyles.disabled : null]}
              onPress={payWithGooglePay}
              disabled={!ready || loading}
            >
              {loading && ready ? <ActivityIndicator color="#fff" /> : <Text style={uiStyles.selectText}>Pay with Google Pay</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={uiStyles.ghostBtn} onPress={payWithCard} disabled={loading}>
              <Text style={uiStyles.ghostText}>Pay with card</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const uiStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 24, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },

  topRow: {
    width: '100%',
    maxWidth: 680,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  topTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  outlineBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  outlineBtnText: { color: '#111827', fontWeight: '700' },

  logo: { width: 140, height: 48, marginBottom: 14 },

  panel: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  panelTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  panelSubtitle: { color: '#6b7280', marginBottom: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  amountCol: { flex: 1 },
  amountLabel: { color: '#94a3b8', fontSize: 13 },
  amountValue: { fontSize: 28, fontWeight: '900', marginTop: 4 },

  statusCol: { alignItems: 'flex-end', width: 140 },
  small: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusReady: { backgroundColor: '#ecfdf5' },
  statusWarn: { backgroundColor: '#fff7ed' },
  statusIdle: { backgroundColor: '#eef2ff' },
  statusText: { color: '#0f172a', fontWeight: '700' },

  description: { color: '#6b7280', marginBottom: 12 },

  actions: { marginTop: 8, alignItems: 'center' },
  selectBtn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, minWidth: 220, alignItems: 'center', marginBottom: 10 },
  selectText: { color: '#fff', fontWeight: '800' },
  ghostBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, minWidth: 220, alignItems: 'center' },
  ghostText: { color: '#111827', fontWeight: '800' },

  disabled: { opacity: 0.5 },
});

export default GoogleWalletPay;
