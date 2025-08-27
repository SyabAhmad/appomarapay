import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ToastAndroid,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  CardDetails: { networkId: string; networkName: string } | undefined;
  AmountEntry: { chainId: string; chainName?: string; tokenId?: string; tokenSymbol?: string } | undefined;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardDetails'>;

const supportedCardDefinitions = [
  { id: 'visa', name: 'Visa', test: (n: string) => /^4/.test(n), asset: require('../../assets/visa.png') },
  { id: 'mastercard', name: 'Mastercard', test: (n: string) => /^(5[1-5]|22)/.test(n), asset: require('../../assets/mastercard.png') },
  { id: 'amex', name: 'American Express', test: (n: string) => /^(34|37)/.test(n), asset: require('../../assets/amex.png') },
  { id: 'discover', name: 'Discover', test: (n: string) => /^(6011|65|64[4-9])/.test(n), asset: require('../../assets/discover.png') },
  { id: 'unionpay', name: 'UnionPay', test: (n: string) => /^(62|88)/.test(n), asset: require('../../assets/unionpay.png') },
];

const formatCardNumber = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  // group into 4-4-4-4-3 (simple)
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const detectCard = (raw: string) => {
  const n = raw.replace(/\D/g, '');
  for (const def of supportedCardDefinitions) {
    if (def.test(n)) return def;
  }
  return null;
};

const CardDetails: React.FC<Props> = ({ navigation, route }) => {
  const networkName = route.params?.networkName ?? 'Card';

  // simplified: do not collect raw card details here.
  // Collect card details once at payment (CardPayment) using Stripe CardField.
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>{networkName}</Text>
          <View style={{ width: 88 }} />
        </View>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.helper}>You will enter card details on the payment screen.</Text>

        <View style={styles.supportRow}>
          {supportedCardDefinitions.map((c) => (
            <View key={c.id} style={styles.supportItem}>
              <Image source={c.asset} style={styles.supportImg} resizeMode="contain" />
              <Text style={styles.supportLabel}>{c.name}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={() =>
            navigation.navigate('AmountEntry' as never, {
              chainId: 'card',
              chainName: networkName,
              tokenId: 'card',
              tokenSymbol: 'USD',
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

  inputWrap: { width: '100%', maxWidth: 560, position: 'relative', marginBottom: 12 },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6eef8',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  detected: {
    position: 'absolute',
    right: 12,
    top: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
    height: 48,
    flexDirection: 'row',
    gap: 8,
  },
  detectedImg: { width: 36, height: 24, marginRight: 8 },
  detectedText: { fontSize: 12, color: '#0f172a', fontWeight: '700' },
  detectedPlaceholder: {
    position: 'absolute',
    right: 12,
    top: 8,
    width: 96,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectedTextPlaceholder: { fontSize: 12, color: '#94a3b8' },

  supportRow: { width: '100%', maxWidth: 560, flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 12 },
  supportItem: { alignItems: 'center', flex: 1 },
  supportItemActive: { transform: [{ scale: 1.03 }] },
  supportImg: { width: 56, height: 22, marginBottom: 6 },
  supportLabel: { fontSize: 11, color: '#6b7280' },
  supportLabelActive: { fontWeight: '800', color: '#0f172a' },

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