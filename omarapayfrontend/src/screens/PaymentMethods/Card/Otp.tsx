import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NumberKeyboard from '../../../components/NumberKeyboard';
import { API_BASE } from '../config/env';

type RootStackParamList = {
  OtpVerification: {
    chainId?: string;
    chainName?: string;
    tokenId?: string;
    tokenSymbol?: string;
    selectedAmount?: string;
    phone?: string;
    otp?: string;
  } | undefined;
  DetailedReceipt: any;
  FinalFailure: any;
  CardPayment: { amount: string; currency?: string; description?: string; metadata?: Record<string, any> } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CardOtp'>;

const OtpVerification: React.FC<Props> = ({ navigation, route }) => {
  const { chainId, chainName, tokenId, tokenSymbol, selectedAmount = '0.00', phone = '-', otp = '' } = route.params ?? {};
  const [code, setCode] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');

  const isCard = useMemo(() => (tokenSymbol?.toUpperCase() === 'USD') || (chainId === 'card'), [tokenSymbol, chainId]);
  const isGCash = useMemo(() => {
    const n = (chainName || '').toLowerCase();
    const s = (tokenSymbol || '').toLowerCase();
    return chainId === 'gcash' || n.includes('gcash') || n.includes('google pay') || s.includes('gcash') || s.includes('gpay');
  }, [chainId, chainName, tokenSymbol]);

  const isGoogleWallet = useMemo(() => {
    const n = (chainName || '').toLowerCase();
    const s = (tokenSymbol || '').toLowerCase();
    return chainId === 'googlewallet' || n.includes('google wallet') || s.includes('google wallet');
  }, [chainId, chainName, tokenSymbol]);

  // Generate a dummy OTP for testing (or use provided otp)
  useEffect(() => {
    if (otp && /^\d{6}$/.test(otp)) {
      setGeneratedOtp(otp);
    } else {
      const rnd = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(rnd);
    }
  }, [otp]);

  const onVerify = async () => {
    if (code.length < 6) return;
    const expected = (otp && /^\d{6}$/.test(otp)) ? otp : generatedOtp;
    if (expected && code !== expected) {
      Alert.alert('Invalid code', 'Please check the OTP and try again.');
      return;
    }

    // Treat Google Wallet like card (Stripe PaymentSheet with Google Pay)
    if (isCard || isGoogleWallet) {
      // Route to Stripe card screen; do not create crypto checkout
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'CardPayment' as never,
            params: {
              amount: selectedAmount,
              currency: 'usd',
              description: `Payment for ${chainName ?? (isGoogleWallet ? 'Google Wallet' : 'Card')}`,
              metadata: { phone, chainName, tokenSymbol: 'USD', channel: isGoogleWallet ? 'googlewallet' : 'card' },
              // helper flag so UI text says "Google Wallet" instead of "Google Pay"
              googleWallet: isGoogleWallet === true,
            } as never,
          },
        ],
      });
      return;
    }

    if (isGCash) {
      // Create a GCash payment/checkout on backend
      setVerifying(true);
      try {
        const res = await fetch(`${API_BASE}/api/payments/gcash`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: String(Number(selectedAmount || '0').toFixed(2)),
            currency: 'USD',
            description: `GCash charge ${selectedAmount} USD`,
            metadata: { phone, chainName: chainName ?? 'GCash', tokenSymbol: 'GCASH' },
          }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.success) {
          const msg = body?.message || `Failed (${res.status}) to create GCash charge`;
          Alert.alert('GCash error', msg);
          setVerifying(false);
          return;
        }
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'CardReceipt' as never,
              params: {
                chainName: chainName ?? 'GCash',
                tokenSymbol: 'USD',
                tokenAmount: undefined,
                usdAmount: selectedAmount,
                mobile: phone,
                receivingAddress: body?.hosted_url ?? body?.reference ?? body?.id ?? '-',
                hosted_url: body?.hosted_url ?? null,
                chargeId: body?.id ?? null,
                txId: body?.id ?? null,
              } as never,
            },
          ],
        });
      } catch (err: any) {
        Alert.alert('Network error', err?.message ?? 'Unable to create GCash payment');
      } finally {
        setVerifying(false);
      }
      return;
    }

    // Crypto flow: create Coinbase charge via backend
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/crypto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: String(Number(selectedAmount || '0').toFixed(2)),
          currency: 'USD',
          name: `${tokenSymbol ?? 'Crypto'} on ${chainName ?? 'Network'}`,
          description: `Charge ${selectedAmount} USD`,
          metadata: { phone, chainName, tokenSymbol },
        }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.success) {
        const msg =
          body?.message?.error?.message ||
          body?.message ||
          `Failed (${res.status}) to create checkout`;
        Alert.alert('Create checkout failed', msg);
        setVerifying(false);
        return;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'CardReceipt' as never,
            params: {
              chainName,
              tokenSymbol,
              tokenAmount: body?.raw?.pricing?.[tokenSymbol?.toUpperCase() || '']?.amount ?? undefined,
              usdAmount: selectedAmount,
              mobile: phone,
              receivingAddress: body?.hosted_url,
              hosted_url: body?.hosted_url,
              chargeId: body?.chargeId,
              txId: body?.txId ?? null,
            } as never,
          },
        ],
      });
    } catch (err: any) {
      Alert.alert('Network error', err?.message ?? 'Unable to create checkout');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={require('../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <View style={styles.header}>
        <Text style={styles.title}>Enter OTP</Text>
      </View>

      <View style={styles.codeBox}>
        <Text style={styles.hint}>We sent a 6‑digit code to {phone}</Text>
        <Text style={styles.code}>{code.padEnd(6, '•')}</Text>
        {!!generatedOtp && (
          <View style={styles.testOtpBadge}>
            <Text style={styles.testOtpText}>Test OTP: {generatedOtp}</Text>
          </View>
        )}
      </View>

      <View style={styles.keyboardWrap}>
        <NumberKeyboard
          value={code}
          onChange={(v) => setCode(v.replace(/[^\d]/g, '').slice(0, 6))}
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={[styles.verifyBtn, code.length < 6 || verifying ? { opacity: 0.6 } : null]}
        onPress={onVerify}
        disabled={code.length < 6 || verifying}
      >
        {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyText}>Verify</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', paddingTop: 16 },
  logo: { width: 120, height: 36, marginBottom: 8 },
  header: { width: '100%', maxWidth: 560, paddingHorizontal: 16, marginBottom: 6 },
  title: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  codeBox: { width: '100%', maxWidth: 560, alignItems: 'center', marginTop: 16 },
  hint: { color: '#6b7280' },
  code: { fontSize: 32, fontWeight: '900', marginTop: 10, letterSpacing: 6, color: '#0f172a' },
  testOtpBadge: { marginTop: 10, backgroundColor: '#e5f0ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  testOtpText: { color: '#1d4ed8', fontWeight: '800', letterSpacing: 1 },
  keyboardWrap: { width: '100%', maxWidth: 560, paddingHorizontal: 16, marginTop: 16, paddingBottom: 120 },
  verifyBtn: { position: 'absolute', left: 16, right: 16, bottom: 18, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  verifyText: { color: '#fff', fontWeight: '800' },
});

export default OtpVerification;
