import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  CardDetails: { networkId: string; networkName: string } | undefined;
  AmountEntry: { chainId: string; chainName?: string; tokenId?: string; tokenSymbol?: string } | undefined;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardDetails'>;

const CardDetails: React.FC<Props> = ({ navigation, route }) => {
  const networkId = route.params?.networkId ?? 'visa';
  const networkName = route.params?.networkName ?? 'Card';

  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const canContinue = cardNumber.length >= 12 && holder.length > 1 && expiry.length >= 4 && cvv.length >= 3;

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>{'< Back'}</Text></TouchableOpacity>
          <Text style={styles.topTitle}>{networkName} — Card details</Text>
          <View style={{ width: 88 }} />
        </View>

        <Text style={styles.helper}>Enter card details</Text>

        <TextInput
          placeholder="Card number"
          value={cardNumber}
          onChangeText={(t) => setCardNumber(t.replace(/\s/g, ''))}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput placeholder="Card holder name" value={holder} onChangeText={setHolder} style={styles.input} />
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <TextInput placeholder="MM/YY" value={expiry} onChangeText={setExpiry} style={[styles.input, { flex: 1 }]} />
          <TextInput placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
        </View>

        <TouchableOpacity
          style={[styles.proceedBtn, !canContinue ? { opacity: 0.6 } : null]}
          disabled={!canContinue}
          onPress={() =>
            navigation.navigate('AmountEntry' as never, {
              chainId: 'card',
              chainName: networkName,
              tokenId: networkId,
              tokenSymbol: networkName,
            } as never)
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
  container: { paddingTop: 30, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  topRow: { width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '800' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  helper: { color: '#6b7280', marginBottom: 12 },

  input: {
    width: '100%',
    maxWidth: 560,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6eef8',
    backgroundColor: '#fff',
    marginBottom: 12,
  },

  proceedBtn: {
    marginTop: 14,
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  proceedText: { color: '#fff', fontWeight: '800' },
});

export default CardDetails;