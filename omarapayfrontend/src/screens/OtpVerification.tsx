import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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

const OtpVerification: React.FC<Props> = ({ navigation, route }) => {
  const { chainId, chainName, tokenId, tokenSymbol, selectedAmount, phone, otp } = route.params ?? {};
  const [entered, setEntered] = useState('');
  const [verifying, setVerifying] = useState(false);

  const onVerify = () => {
    if (!entered) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      // simple dev verification: match the otp passed from PhoneConfirmation
      if (otp && entered === otp) {
        const sym = (tokenSymbol ?? tokenId ?? '').toUpperCase();
        const cryptoSymbols = ['ETH', 'BTC', 'SOL', 'MATIC', 'USDC', 'BNB', 'AVAX', 'TRON'];

        if (cryptoSymbols.includes(sym)) {
          // go to crypto QR / hosted flow with the amount
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'CryptoPay' as never,
                params: { amount: String(selectedAmount ?? '0.00'), currency: 'USD', description: `Pay ${sym} on ${chainName ?? ''}` } as never,
              },
            ],
          });
          return;
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
      <TextInput
        keyboardType="numeric"
        value={entered}
        onChangeText={(t) => setEntered(t.replace(/\D/g, '').slice(0, 6))}
        style={styles.input}
        placeholder="Enter code"
        maxLength={6}
      />

      <TouchableOpacity style={[styles.btn, verifying ? { opacity: 0.7 } : null]} onPress={onVerify} disabled={verifying}>
        <Text style={styles.btnText}>{verifying ? 'Verifying…' : 'Verify'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', padding: 20, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#6b7280', marginBottom: 12, textAlign: 'center' },
  input: { width: '80%', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eef2ff', backgroundColor: '#fff', textAlign: 'center', fontSize: 18, marginBottom: 12 },
  btn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '800' },
});

export default OtpVerification;