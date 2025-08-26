import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  GCashDetails: { walletId: string; walletName: string } | undefined;
  AmountEntry: { chainId: string; chainName?: string; tokenId?: string; tokenSymbol?: string } | undefined;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'GCashDetails'>;

const GCashDetails: React.FC<Props> = ({ navigation, route }) => {
  const walletId = route.params?.walletId ?? 'gcash';
  const walletName = route.params?.walletName ?? 'Wallet';

  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');

  const canProceed = phone.trim().length >= 6;

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>{'< Back'}</Text></TouchableOpacity>
          <Text style={styles.topTitle}>{walletName}</Text>
          <View style={{ width: 88 }} />
        </View>

        <Text style={styles.helper}>Enter wallet details</Text>

        <TextInput placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
        <TextInput placeholder="Reference (optional)" value={reference} onChangeText={setReference} style={styles.input} />

        <TouchableOpacity
          style={[styles.proceedBtn, !canProceed ? { opacity: 0.6 } : null]}
          disabled={!canProceed}
          onPress={() =>
            navigation.navigate(
              'AmountEntry' as never,
              { chainId: 'gcash', chainName: walletName, tokenId: walletId, tokenSymbol: walletName } as never
            )
          }
        >
          <Text style={styles.proceedText}>Enter amount</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 26, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  topRow: { width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '800' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  helper: { color: '#6b7280', marginBottom: 12, textAlign: 'center' },
  input: { width: '100%', maxWidth: 560, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e6eef8', backgroundColor: '#fff', marginBottom: 12 },
  proceedBtn: { marginTop: 14, width: '100%', maxWidth: 560, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  proceedText: { color: '#fff', fontWeight: '800' },
});

export default GCashDetails;