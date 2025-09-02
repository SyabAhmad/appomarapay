import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NumberKeyboard from '../../../components/NumberKeyboard';

type RootStackParamList = {
  OtpVerification: {
    selectedAmount?: string;
    phone?: string;
    otp?: string;
  } | undefined;
  CardPayment: { amount: string; currency?: string; description?: string; metadata?: Record<string, any> } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CardOtp'>;

const OtpVerification: React.FC<Props> = ({ navigation, route }) => {
  const { selectedAmount = '0.00', phone = '-', otp = '' } = route.params ?? {};
  const [code, setCode] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');

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

    // Card-only flow: navigate to CardPay (Stripe PaymentSheet)
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CardPay' as never,
          params: {
            amount: selectedAmount,
            currency: 'usd',
            description: `Payment (Card)`,
            metadata: { phone, channel: 'card' },
          } as never,
        },
      ],
    });
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
