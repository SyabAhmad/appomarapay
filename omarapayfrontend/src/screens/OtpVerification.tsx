import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
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
  CryptoPay: { amount: string; currency?: string; description?: string } | undefined;
  DetailedReceipt: any;
};
type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const API_BASE = Platform.OS === 'android' ? 'http://192.168.0.109:5000' : 'http://localhost:5000';

const OtpVerification: React.FC<Props> = ({ navigation, route }) => {
  const { chainId, chainName, tokenId, tokenSymbol, selectedAmount, phone, otp } = route.params ?? {};
  const [entered, setEntered] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [creatingCheckout, setCreatingCheckout] = useState(false);

  const onVerify = async () => {
    if (!entered) return;
    setVerifying(true);
    setTimeout(async () => {
      setVerifying(false);
      // simple dev verification: match the otp passed from PhoneConfirmation
      if (otp && entered === otp) {
        const sym = (tokenSymbol ?? tokenId ?? '').toUpperCase();
        const cryptoSymbols = ['ETH', 'BTC', 'SOL', 'MATIC', 'USDC', 'BNB', 'AVAX', 'TRON'];

        if (cryptoSymbols.includes(sym)) {
          try {
            // create checkout on backend before navigating to receipt/qr
            setCreatingCheckout(true);
            const res = await fetch(`${API_BASE}/api/payments/crypto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: selectedAmount ?? '0.00',
                currency: 'USD',
                name: `Payment ${sym}`,
                description: `Pay ${sym} on ${chainName ?? ''}`,
                metadata: { tokenSymbol: sym, phone },
              }),
            });
            const body = await res.json().catch(() => null);
            if (!res.ok) {
              Alert.alert('Checkout error', body?.message ?? `Status ${res?.status}`);
              setCreatingCheckout(false);
              return;
            }

            // navigate to DetailedReceipt and show real checkout QR
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'DetailedReceipt' as never,
                  params: {
                    chainName,
                    tokenSymbol: sym,
                    tokenAmount: (Number(selectedAmount) / 1).toFixed(6), // approximate token amount shown
                    usdAmount: selectedAmount,
                    mobile: phone,
                    // pass hosted_url and chargeId so receipt shows real QR + check status
                    receivingAddress: body.hosted_url ?? '',
                    hosted_url: body.hosted_url ?? '',
                    chargeId: body.chargeId ?? body.charge_id ?? null,
                    txId: body.txId ?? null,
                  } as never,
                },
              ],
            });
            return;
          } catch (err) {
            console.error('create checkout error', err);
            Alert.alert('Error', 'Failed to create checkout');
            setCreatingCheckout(false);
            return;
          } finally {
            setCreatingCheckout(false);
          }
        }

        // non-crypto: go to DetailedReceipt (simulate success)
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'DetailedReceipt' as never,
              params: {
                chainName,
                tokenSymbol,
                tokenAmount: selectedAmount,
                usdAmount: selectedAmount,
                mobile: phone,
                receivingAddress: '-',
              } as never,
            },
          ],
        });
      } else {
        Alert.alert('Invalid code', 'The code entered does not match.');
      }
    }, 600);
  };

  return (
    <View style={styles.safe}>
      <Text style={styles.label}>Enter the 6‑digit code sent to {phone ?? 'the customer'}</Text>

      {/* visible code input */}
      <View style={styles.codeRow}>
        <Text style={styles.codeText}>{entered.padEnd(6, '•')}</Text>
      </View>

      {/* Show the OTP on screen for dev/testing */}
      {otp ? <Text style={styles.devOtp}>Sent code: {otp}</Text> : null}

      <NumberKeyboard
        value={entered}
        onChange={(v) => setEntered(v.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
      />

      <TouchableOpacity
        style={[styles.btn, (verifying || creatingCheckout || entered.length < 6) ? { opacity: 0.7 } : null]}
        onPress={onVerify}
        disabled={verifying || creatingCheckout || entered.length < 6}
      >
        {creatingCheckout ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{verifying ? 'Verifying…' : 'Verify'}</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', padding: 20, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#6b7280', marginBottom: 12, textAlign: 'center' },
  codeRow: { marginBottom: 8, padding: 10, borderRadius: 8, backgroundColor: '#fff' },
  codeText: { fontSize: 28, fontWeight: '900', letterSpacing: 8 },
  devOtp: { color: '#111827', fontWeight: '800', marginBottom: 12 },
  btn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10, marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '800' },
});

export default OtpVerification;