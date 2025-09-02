import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NumberKeyboard from '../../../../components/NumberKeyboard';

type RootStackParamList = {
  GoogleWalletPhone: {
    chainId?: string;
    chainName?: string;
    tokenId?: string;
    tokenSymbol?: string;
    selectedAmount?: string;
  } | undefined;
  GoogleWalletOtp: any;
  PinAuth: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'GoogleWalletPhone'>;

const PhoneConfirmation: React.FC<Props> = ({ navigation, route }) => {
  const { chainId, chainName, tokenId, tokenSymbol, selectedAmount } = route.params ?? {};
  const [phone, setPhone] = useState<string>('');
  const [sending, setSending] = useState(false);

  // format phone for display (simple grouping)
  const displayPhone = useMemo(() => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }, [phone]);

  const sendOtp = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 6) return;
    setSending(true);

    // generate random 6-digit OTP and pass it to OtpVerification (dev console will show it)
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.info('Dev OTP:', otp);

    // simulate network latency
    setTimeout(() => {
      setSending(false);
      navigation.navigate('GoogleWalletOtp' as never, {
        chainId,
        chainName,
        tokenId,
        tokenSymbol,
        selectedAmount,
        phone: `+${digits}`,
        otp,
      } as never);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm mobile</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PinAuth' as never }] })}>
          <Text style={styles.logout}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Image source={require('../../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <View style={styles.summary}>
        <Text style={styles.summaryLine}>{chainName ?? 'Network'} • {(tokenSymbol ?? 'Token').toUpperCase()}</Text>
        <Text style={styles.amountText}>${selectedAmount ?? '0.00'}</Text>
        {selectedAmount && tokenSymbol && (
          <Text style={{ color: '#2563eb', fontWeight: '700', marginTop: 4 }}>
            {/* Example: convert USD to token (replace 1:1 with real rate) */}
            ≈ {(Number(selectedAmount) / 1).toFixed(4)} {tokenSymbol.toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.phoneCard}>
        <Text style={styles.phoneLabel}>Customer phone</Text>
        <View style={styles.phoneDisplay}>
          <Text style={styles.phoneText}>{displayPhone || '+— — —'}</Text>
        </View>
        <Text style={styles.hint}>Use the keypad below to enter digits. Country code optional — we'll prefix + if missing.</Text>
      </View>

      <View style={styles.keyboardWrap}>
        <NumberKeyboard
          value={phone}
          onChange={(v) => {
            // ensure only digits and optional leading plus are stored
            const cleaned = v.replace(/[^\d+]/g, '');
            setPhone(cleaned);
          }}
          maxLength={15}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendBtn, phone.replace(/\D/g, '').length < 6 ? styles.disabled : null]}
          disabled={phone.replace(/\D/g, '').length < 6 || sending}
          onPress={sendOtp}
          activeOpacity={0.9}
        >
          <Text style={styles.sendText}>{sending ? 'Sending…' : 'Send OTP'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 12 : 20,
  },
  header: {
    width: '100%',
    maxWidth: 560,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  logout: { color: '#2563eb', fontWeight: '700' },

  logo: { width: 140, height: 44, marginTop: 6, marginBottom: 8 },

  summary: { alignItems: 'center', marginBottom: 12 },
  summaryLine: { color: '#6b7280', fontSize: 13 },
  amountText: { fontSize: 36, fontWeight: '800', color: '#0f172a', marginTop: 6 },

  phoneCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    alignItems: 'center',
  },
  phoneLabel: { color: '#6b7280', marginBottom: 8 },
  phoneDisplay: {
    backgroundColor: '#f1f5f9',
    width: '100%',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneText: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  hint: { color: '#94a3b8', marginTop: 10, textAlign: 'center', fontSize: 13 },

  keyboardWrap: {
    width: '100%',
    maxWidth: 560,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 140, // leave room for footer
  },

  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: 'center',
  },
  sendBtn: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.6 },
});

export default PhoneConfirmation;
