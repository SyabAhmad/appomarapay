import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  GoogleWalletConfirm: {
    chainId?: string;
    chainName?: string;
    tokenId?: string;
    tokenSymbol?: string;
    selectedAmount?: string;
  } | undefined;
  GoogleWalletPhone: any;
};
type Props = NativeStackScreenProps<RootStackParamList, 'GoogleWalletConfirm'>;

const getTokenLogo = () => {
  try {
    return require('../../../../assets/logo.png');
  } catch {
    return null as any;
  }
};

const GoogleWalletConfirm: React.FC<Props> = ({ navigation, route }) => {
  const { chainId, chainName = 'Google Wallet', tokenSymbol = 'USD', selectedAmount = '0.00' } = route.params ?? {};
  const usd = Number(selectedAmount ?? '0') || 0;
  const tokenLogo = getTokenLogo();

  const onConfirm = () => {
    navigation.navigate('GoogleWalletPhone' as never, {
      chainId,
      chainName,
      tokenId: route.params?.tokenId,
      tokenSymbol,
      selectedAmount: String(usd.toFixed(2)),
    } as never);
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Google Wallet payment</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.smallLabel}>Amount (USD)</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.amount}>{usd.toFixed(2)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.tokenInfo}>
              {tokenLogo ? <Image source={tokenLogo} style={styles.tokenLogo} resizeMode="contain" /> : null}
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.tokenSymbol}>{tokenSymbol.toUpperCase()}</Text>
                <Text style={styles.tokenSub}>{chainName}</Text>
              </View>
            </View>

            <View style={styles.rateBox}>
              <Text style={styles.tokenAmount}>{usd.toFixed(2)} USD</Text>
              <Text style={styles.rateLine}>No conversion — direct USD</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.9}>
          <Text style={styles.confirmText}>Confirm & send OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', paddingTop: 20, alignItems: 'center' },
  header: { width: '100%', maxWidth: 560, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '700', fontSize: 16, color: '#0f172a' },
  content: { width: '100%', maxWidth: 560, paddingHorizontal: 16, marginTop: 18 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, elevation: 3 },
  smallLabel: { color: '#6b7280', marginBottom: 8, fontSize: 13 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  currency: { color: '#9ca3af', fontSize: 26, marginRight: 8 },
  amount: { fontSize: 44, fontWeight: '800', color: '#0f172a' },
  separator: { height: 1, backgroundColor: '#eef2ff', marginVertical: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tokenInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tokenLogo: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f3f4f6' },
  tokenSymbol: { fontWeight: '800', fontSize: 15, color: '#0f172a' },
  tokenSub: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  rateBox: { minWidth: 140, alignItems: 'flex-end' },
  tokenAmount: { fontWeight: '800', fontSize: 18, color: '#0f172a' },
  rateLine: { color: '#6b7280', marginTop: 6, fontSize: 12 },
  bottom: { position: 'absolute', left: 16, right: 16, bottom: 18, alignItems: 'center' },
  confirmBtn: { width: '100%', maxWidth: 560, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800' },
});

export default GoogleWalletConfirm;
