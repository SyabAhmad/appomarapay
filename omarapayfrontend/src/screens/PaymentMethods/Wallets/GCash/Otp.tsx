import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NumberKeyboard from '../../../../components/NumberKeyboard';
import { API_BASE } from '../../../../config/env';

type RootStackParamList = {
  GCashOtp: { chainId?: string; chainName?: string; selectedAmount?: string; phone?: string; otp?: string } | undefined;
  GCashReceipt: any;
};

type Props = NativeStackScreenProps<RootStackParamList, 'GCashOtp'>;

const OtpVerification: React.FC<Props> = ({ navigation, route }) => {
  const { chainId = 'gcash', chainName = 'GCash', selectedAmount = '0.00', phone = '-', otp = '' } = route.params ?? {};
  const [code, setCode] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');

  useEffect(() => {
    if (otp && /^\d{6}$/.test(otp)) setGeneratedOtp(otp);
    else setGeneratedOtp(Math.floor(100000 + Math.random() * 900000).toString());
  }, [otp]);

  const onVerify = async () => {
    if (code.length < 6) return;
    const expected = (otp && /^\d{6}$/.test(otp)) ? otp : generatedOtp;
    if (expected && code !== expected) {
      Alert.alert('Invalid code', 'Please check the OTP and try again.');
      return;
    }

    // Create GCash checkout in PHP
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/gcash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: String(Number(selectedAmount || '0').toFixed(2)),
          currency: 'PHP',
          description: `GCash charge ₱${selectedAmount}`,
          metadata: { phone, chainName: chainName ?? 'GCash', currency: 'PHP' },
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        Alert.alert('GCash error', body?.message || `Failed (${res.status}) to create GCash charge`);
        setVerifying(false);
        return;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'GCashReceipt' as never,
            params: {
              chainName: chainName ?? 'GCash',
              phpAmount: selectedAmount,
              mobile: phone,
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
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={require('../../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
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
        <NumberKeyboard value={code} onChange={(v) => setCode(v.replace(/[^\d]/g, '').slice(0, 6))} maxLength={6} />
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
