import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NumberKeyboard from '../components/NumberKeyboard';

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
  ReceiptSuccess: any;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const OTP_LENGTH = 6;

const OtpVerification: React.FC<Props> = ({ navigation, route }) => {
  const { chainId, chainName, tokenId, tokenSymbol, selectedAmount, phone, otp } = route.params ?? {};
  const [code, setCode] = useState<string>('');
  const [attempting, setAttempting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expectedOtp, setExpectedOtp] = useState<string | undefined>(otp);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    // keep expectedOtp in sync with incoming navigation param (PhoneConfirmation)
    if (otp && otp !== expectedOtp) {
      setExpectedOtp(otp);
    }
    if (otp) console.info('Dev OTP (route):', otp, 'state expectedOtp:', expectedOtp);
  }, [otp]);

  useEffect(() => {
    let iv: NodeJS.Timeout;
    if (cooldown > 0) {
      iv = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    }
    return () => clearInterval(iv);
  }, [cooldown]);

  // use an optional parameter so we can verify using the freshly computed digits
  const verify = (codeArg?: string) => {
    setError(null);
    setAttempting(true);
    setTimeout(() => {
      setAttempting(false);

      // prefer codeArg (immediate value from keypad) to avoid React state race
      const raw = typeof codeArg === 'string' ? codeArg : code;
      const cleanCode = (raw ?? '').replace(/[^0-9]/g, '');
      const cleanExpected = (expectedOtp ?? '').replace(/[^0-9]/g, '');

      console.info('OTP verify check:', { rawCode: raw, cleanCode, expectedOtp, cleanExpected, routeOtp: otp });

      if (cleanCode && cleanExpected && cleanCode === cleanExpected) {
        navigation.navigate('ReceiptSuccess' as never, {
          chainId,
          chainName,
          tokenId,
          tokenSymbol,
          selectedAmount,
          phone,
        } as never);
      } else {
        setError('Invalid code — please try again');
        setCode('');
      }
    }, 700);
  };

  const resend = () => {
    if (cooldown > 0) return;
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    setExpectedOtp(newOtp);
    setError(null);
    setCooldown(30); // 30s cooldown
    console.info('Dev OTP:', newOtp);
  };

  const onKeyboardChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setCode(digits);

    // when keypad produces the final digit, call verify with the immediate value
    if (digits.length === OTP_LENGTH) {
      Keyboard.dismiss();
      setTimeout(() => verify(digits), 180);
    }
  };

  const boxes = Array.from({ length: OTP_LENGTH }).map((_, i) => {
    const char = code[i] ?? '';
    return (
      <View key={i} style={[styles.digitBox, char ? styles.digitBoxFilled : null]}>
        <Text style={[styles.digitText, char ? styles.digitTextFilled : null]}>{char || ''}</Text>
      </View>
    );
  });

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter code</Text>
        <View style={{ width: 60 }} />
      </View>

      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.prompt}>Enter the 6‑digit code sent to</Text>
      <Text style={styles.phone}>{phone ?? '—'}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verification code</Text>

        <View style={styles.digitsRowWrap}>
          <View style={styles.digitsRow}>{boxes}</View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : <Text style={styles.hint}>We sent a one‑time code to the number above.</Text>}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.resendBtn, cooldown > 0 ? styles.resendDisabled : null]}
            onPress={resend}
            disabled={cooldown > 0}
            activeOpacity={0.85}
          >
            <Text style={[styles.resendText, cooldown > 0 ? styles.resendTextDisabled : null]}>
              {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmBtn, code.length < OTP_LENGTH || attempting ? styles.confirmDisabled : null]}
            onPress={verify}
            disabled={code.length < OTP_LENGTH || attempting}
            activeOpacity={0.9}
          >
            {attempting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.keyboardWrap}>
        <NumberKeyboard value={code} onChange={onKeyboardChange} maxLength={OTP_LENGTH} />
      </View>

      <Text style={styles.devHint}>Dev OTP (console): {expectedOtp ?? '—'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 12 : 24 },
  header: { width: '100%', maxWidth: 560, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '700', fontSize: 16, color: '#0f172a' },

  logo: { width: 140, height: 44, marginVertical: 12 },

  prompt: { color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  phone: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12 },

  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: { fontSize: 14, color: '#6b7280', marginBottom: 10 },

  digitsRowWrap: { width: '100%', alignItems: 'center' },
  digitsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, width: '100%', maxWidth: 360 },
  digitBox: {
    width: 52,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6eef8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: { backgroundColor: '#eef2ff', borderColor: '#c7e0ff' },
  digitText: { fontSize: 22, fontWeight: '800', color: '#94a3b8' },
  digitTextFilled: { color: '#0f172a' },

  hint: { color: '#94a3b8', marginTop: 12, textAlign: 'center' },
  error: { color: '#ef4444', marginTop: 8 },

  actionsRow: { flexDirection: 'row', marginTop: 16, width: '100%', justifyContent: 'space-between', alignItems: 'center' },
  resendBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  resendDisabled: { opacity: 0.5 },
  resendText: { color: '#2563eb', fontWeight: '800' },
  resendTextDisabled: { color: '#7aa7ff' },

  confirmBtn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  confirmDisabled: { opacity: 0.6 },
  confirmText: { color: '#fff', fontWeight: '800' },

  keyboardWrap: { width: '100%', maxWidth: 560, marginTop: 14, paddingHorizontal: 16, paddingBottom: 120 },

  devHint: { marginTop: 14, color: '#94a3b8', fontSize: 12 },
});

export default OtpVerification;