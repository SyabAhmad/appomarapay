import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Terminal, DiscoveryMethod } from '@stripe/stripe-terminal-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_BASE } from '../config/env';

type RootStackParamList = {
  TapToPay: { amount: string; description?: string; metadata?: Record<string, any> } | undefined;
  DetailedReceipt: any;
  FinalSuccess: any;
  FinalFailure: any;
  CardPayment: any;
};
type Props = NativeStackScreenProps<RootStackParamList, 'TapToPay'>;

const TapToPay: React.FC<Props> = ({ navigation, route }) => {
  const { amount = '0.00', description = '', metadata = {} } = route.params ?? {};
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Terminal.initialize({
          fetchConnectionToken: async () => {
            const res = await fetch(`${API_BASE}/api/payments/terminal/connection_token`, { method: 'POST' });
            const body = await res.json();
            if (!res.ok || !body?.secret) throw new Error(body?.message || 'No connection token');
            return body.secret;
          },
        });
        const { discoveredReaders, error } = await Terminal.discoverReaders({ discoveryMethod: DiscoveryMethod.LocalMobile });
        if (error) throw new Error(error.message);
        const reader = discoveredReaders?.[0];
        if (!reader) throw new Error('No Tap-to-Pay reader available');
        const { error: connectErr } = await Terminal.connectReader(reader);
        if (connectErr) throw new Error(connectErr.message);
        if (mounted) setReady(true);
      } catch (err: any) {
        Alert.alert('Reader error', err?.message ?? 'Tap-to-Pay not available');
        // fallback to manual card entry
        navigation.replace('CardPayment' as never, {
          amount,
          currency: 'usd',
          description,
          metadata,
        } as never);
      }
    })();
    return () => {
      mounted = false;
      try { Terminal.cancelDiscoverReaders(); } catch {}
    };
  }, [amount, description, metadata, navigation]);

  const startCharge = async () => {
    setBusy(true);
    try {
      // create a card_present PaymentIntent on backend
      const res = await fetch(`${API_BASE}/api/payments/terminal/payment_intents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'usd', metadata }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.clientSecret) throw new Error(body?.message || 'Failed to create PaymentIntent');

      const clientSecret = body.clientSecret;

      const { paymentIntent: afterCollect, error: collectErr } = await Terminal.collectPaymentMethod(clientSecret);
      if (collectErr) throw new Error(collectErr.message);

      const { paymentIntent: afterProcess, error: processErr } = await Terminal.processPayment(clientSecret);
      if (processErr) throw new Error(processErr.message);

      const status = String(afterProcess?.status || '').toLowerCase();
      if (status === 'succeeded' || status === 'processing' || status === 'requires_capture') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'FinalSuccess' as never,
              params: {
                success: true,
                chainName: 'Card (Tap to Pay)',
                tokenSymbol: 'USD',
                tokenAmount: amount,
                usdAmount: amount,
                mobile: metadata?.phone ?? '-',
                receivingAddress: afterProcess?.id,
              } as never,
            },
          ],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'DetailedReceipt' as never,
              params: {
                chainName: 'Card (Tap to Pay)',
                tokenSymbol: 'USD',
                tokenAmount: amount,
                usdAmount: amount,
                mobile: metadata?.phone ?? '-',
                receivingAddress: body?.id ?? '-',
                txId: body?.id ?? null,
                hosted_url: null,
              } as never,
            },
          ],
        });
      }
    } catch (e: any) {
      Alert.alert('Payment error', e?.message ?? 'Unable to process payment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.safe}>
      <Text style={styles.title}>Tap or swipe card</Text>
      <Text style={styles.sub}>Charge ${Number(amount).toFixed(2)} — hold a card near the device</Text>

      <TouchableOpacity style={[styles.btn, !ready || busy ? { opacity: 0.6 } : null]} onPress={startCharge} disabled={!ready || busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Start charge</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#6b7280', marginBottom: 16 },
  btn: { backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 26, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '800' },
});

export default TapToPay;