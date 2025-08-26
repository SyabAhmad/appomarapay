import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NumberKeyboard from '../components/NumberKeyboard';

type RootStackParamList = {
  AmountEntry: { chainId: string; chainName?: string; tokenId?: string; tokenSymbol?: string } | undefined;
  PaymentMethod: { selectedMethod?: 'Card' | 'Blockchain' | 'GCash'; selectedToken?: string; chainId?: string } | undefined;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'AmountEntry'>;

const AmountEntry: React.FC<Props> = ({ navigation, route }) => {
  const chainId = route.params?.chainId ?? 'ethereum';
  const chainName = route.params?.chainName ?? chainId;
  const tokenId = route.params?.tokenId ?? null;
  const tokenSymbol = route.params?.tokenSymbol ?? '';

  const [amount, setAmount] = React.useState<string>('');

  const displayAmount = useMemo(() => {
    if (!amount) return '0.00';
    if (amount.includes('.')) {
      return amount;
    }
    return amount;
  }, [amount]);

  const onConfirm = () => {
    navigation.navigate('PaymentMethod' as never, {
      selectedMethod: 'Blockchain',
      selectedToken: tokenId ?? tokenSymbol ?? undefined,
      chainId,
      selectedAmount: amount || undefined,
    } as never);
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter amount of the bill</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] })}>
          <Text style={styles.logout}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.prompt}>How much is the amount the customer will pay in Crypto?</Text>

      <View style={styles.amountWrapper}>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.amountText}>{displayAmount}</Text>
        </View>
        <Text style={styles.helperText}>{chainName} • {tokenSymbol ?? 'Token'}</Text>
      </View>

      <View style={styles.keyboardContainer}>
        <NumberKeyboard value={amount} onChange={setAmount} maxLength={12} />
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !amount ? { opacity: 0.6 } : null]}
        disabled={!amount}
        onPress={onConfirm}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 12 : 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '700', fontSize: 16, textAlign: 'center' },
  logout: { color: '#2563eb', fontWeight: '700' },
  logo: { width: 140, height: 44, marginTop: 8, marginBottom: 12, alignSelf: 'center' },
  prompt: { color: '#6b7280', textAlign: 'center', marginBottom: 18, paddingHorizontal: 20 },

  amountWrapper: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currency: { color: '#9ca3af', fontSize: 34, marginRight: 8 },
  amountText: { fontSize: 64, fontWeight: '800', color: '#0f172a' },
  helperText: { color: '#94a3b8', marginTop: 8 },

  keyboardContainer: {
    width: '100%',
    maxWidth: 560,
    paddingHorizontal: 16,
    marginTop: 6,
    // leave room at bottom for the confirm button
    paddingBottom: 140,
  },

  continueBtn: {
    position: 'absolute',
    bottom: 18,
    left: 16,
    right: 16,
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  continueText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default AmountEntry;