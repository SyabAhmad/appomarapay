import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NumberKeyboard from '../../../../components/NumberKeyboard';

type RootStackParamList = {
  GCashAmountEntry: { chainId: string; chainName?: string } | undefined;
  GCashConfirm: {
    chainId?: string;
    chainName?: string;
    selectedAmount?: string; // PHP amount
  } | undefined;
  PinAuth: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'GCashAmountEntry'>;

const addCommas = (val: string) => {
  if (!val) return '0.00';
  if (val.includes('.')) {
    const [intPart, fracPart] = val.split('.');
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
    return `${intFormatted}.${fracPart}`;
  }
  return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const AmountEntry: React.FC<Props> = ({ navigation, route }) => {
  const chainId = route.params?.chainId ?? 'gcash';
  const chainName = route.params?.chainName ?? 'GCash';
  const [amount, setAmount] = React.useState<string>('');

  const displayAmount = useMemo(() => (amount ? addCommas(amount) : '0.00'), [amount]);

  const onConfirm = () => {
    navigation.navigate('GCashConfirm' as never, {
      chainId,
      chainName,
      selectedAmount: amount || '0.00',
    } as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter GCash amount (PHP)</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PinAuth' as never }] })}>
          <Text style={styles.logout}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brandRow}>
        <Image source={require('../../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.prompt}>How much will the customer pay with GCash?</Text>

      <View style={styles.centerArea}>
        <View style={styles.amountCard}>
          <View style={styles.amountTop}>
            <View style={styles.currencyWrap}>
              <Text style={styles.currency}>₱</Text>
            </View>
            <View style={styles.amountWrap}>
              <Text accessible accessibilityLabel={`Amount ${displayAmount}`} style={styles.amountText}>
                {displayAmount}
              </Text>
              <Text style={styles.subtle}>Tap numbers to edit — decimals allowed</Text>
            </View>
          </View>
        </View>

        <Text style={styles.helperText}>Method: {chainName} • Amount in PHP</Text>

        <View style={styles.keyboardContainer}>
          <NumberKeyboard value={amount} onChange={setAmount} maxLength={12} />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !amount ? styles.disabled : null]}
          disabled={!amount}
          onPress={onConfirm}
          activeOpacity={0.9}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 12 : 20 },
  header: {
    width: '100%',
    maxWidth: 560,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  logout: { color: '#2563eb', fontWeight: '700' },
  brandRow: { width: '100%', alignItems: 'center', marginTop: 6 },
  logo: { width: 140, height: 44 },
  prompt: { color: '#6b7280', textAlign: 'center', marginTop: 12, paddingHorizontal: 28 },
  centerArea: { width: '100%', maxWidth: 560, paddingHorizontal: 16, marginTop: 18, alignItems: 'center' },
  amountCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 12,
  },
  amountTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currencyWrap: { alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  currency: { color: '#9ca3af', fontSize: 28 },
  amountWrap: { alignItems: 'center', justifyContent: 'center' },
  amountText: { fontSize: 56, fontWeight: '900', color: '#0f172a' },
  subtle: { color: '#94a3b8', marginTop: 6, fontSize: 12 },
  helperText: { color: '#94a3b8', marginTop: 8, marginBottom: 6 },
  keyboardContainer: { width: '100%', marginTop: 6, paddingBottom: 160 },
  footer: { position: 'absolute', left: 16, right: 16, bottom: 18, alignItems: 'center' },
  continueBtn: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  continueText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  disabled: { opacity: 0.6 },
});

export default AmountEntry;
