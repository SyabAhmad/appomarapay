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

  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const canContinue = cardNumber.replace(/\D/g, '').length >= 12 && holder.length > 1 && expiry.length >= 4 && cvv.length >= 3;

  const detected = useMemo(() => detectCard(cardNumber), [cardNumber]);

  // Auto-select detected card brand as the user types
  useEffect(() => {
    if (detected) setSelectedCard(detected.id);
    else setSelectedCard(null);
  }, [detected]);

  const onChangeCard = (t: string) => {
    // allow spaces while keeping internal digits clean
    const cleaned = t.replace(/[^\d]/g, '').slice(0, 19);
    setCardNumber(formatCardNumber(cleaned));
  };

  const onCopySample = () => {
    // removed per request — kept function removed from UI
  };

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>{networkName} — Card details</Text>
          <View style={{ width: 88 }} />
        </View>

        <Text style={styles.helper}>Enter card details</Text>

        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Card number"
            value={cardNumber}
            onChangeText={onChangeCard}
            keyboardType="numeric"
            style={[styles.input, { paddingRight: 120 }]}
            maxLength={26}
          />
          {detected ? (
            <View style={styles.detected}>
              <Image source={detected.asset} style={styles.detectedImg} resizeMode="contain" />
              <Text style={styles.detectedText}>{detected.name}</Text>
            </View>
          ) : (
            <View style={styles.detectedPlaceholder}>
              <Text style={styles.detectedTextPlaceholder}>Unsupported</Text>
            </View>
          )}
        </View>

        <TextInput placeholder="Card holder name" value={holder} onChangeText={setHolder} style={styles.input} />
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <TextInput placeholder="MM/YY" value={expiry} onChangeText={setExpiry} style={[styles.input, { flex: 1 }]} />
          <TextInput placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
        </View>

        {/* supported logos row — highlight the automatically selected brand */}
        <View style={styles.supportRow}>
          {supportedCardDefinitions.map((c) => {
            const isMatch = selectedCard === c.id;
            return (
              <View key={c.id} style={[styles.supportItem, isMatch ? styles.supportItemActive : null]}>
                <Image source={c.asset} style={[styles.supportImg, isMatch ? null : { opacity: 0.45 }]} resizeMode="contain" />
                <Text style={[styles.supportLabel, isMatch ? styles.supportLabelActive : null]}>{c.name}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.proceedBtn, !canContinue ? { opacity: 0.6 } : null]}
          disabled={!canContinue}
          onPress={() =>
            navigation.navigate('AmountEntry' as never, {
              chainId: 'card',
              chainName: networkName,
              tokenId: selectedCard ?? 'card',
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