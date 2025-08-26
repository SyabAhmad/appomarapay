import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  TokenSelection: { chainId: string };
  PaymentMethod: { selectedMethod?: 'Card' | 'Blockchain' | 'GCash'; selectedToken?: string; chainId?: string };
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'TokenSelection'>;

const TOKENS_BY_CHAIN: Record<string, Array<{ id: string; symbol: string; name: string }>> = {
  ethereum: [
    { id: 'eth', symbol: 'ETH', name: 'Ether' },
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin' },
    { id: 'dai', symbol: 'DAI', name: 'Dai' },
    { id: 'weth', symbol: 'WETH', name: 'Wrapped Ether' },
  ],
  bitcoin: [
    { id: 'btc', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'tbtc', symbol: 'tBTC', name: 'tBTC (wrapped)' },
  ],
  solana: [
    { id: 'sol', symbol: 'SOL', name: 'Solana' },
    { id: 'usdc_s', symbol: 'USDC', name: 'USDC' },
  ],
  polygon: [
    { id: 'matic', symbol: 'MATIC', name: 'Polygon' },
    { id: 'usdc_p', symbol: 'USDC', name: 'USDC' },
  ],
};

const TokenSelection: React.FC<Props> = ({ navigation, route }) => {
  const chainId = route.params?.chainId ?? 'ethereum';
  const tokens = useMemo(() => TOKENS_BY_CHAIN[chainId] ?? [], [chainId]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Select token — {chainId}</Text>
          <View style={{ width: 88 }} />
        </View>

        <Text style={styles.sectionSubtitle}>Pick a token for {chainId}</Text>

        <View style={styles.grid}>
          {tokens.map((t) => {
            const selected = selectedToken === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tokenCard, selected ? styles.tokenSelected : null]}
                onPress={() => setSelectedToken(t.id)}
                activeOpacity={0.9}
              >
                <View style={styles.tokenIcon}>
                  <Text style={{ fontWeight: '700' }}>{t.symbol[0]}</Text>
                </View>
                <Text style={styles.tokenSymbol}>{t.symbol}</Text>
                <Text style={styles.tokenName}>{t.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.proceedBtn, !selectedToken ? { opacity: 0.6 } : null]}
          disabled={!selectedToken}
          onPress={() =>
            navigation.navigate(
              'PaymentMethod' as never,
              { selectedMethod: 'Blockchain', selectedToken, chainId } as never
            )
          }
        >
          <Text style={styles.proceedText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 30, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  topRow: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  back: { color: '#2563eb', fontWeight: '800' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 12 },
  grid: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tokenCard: {
    width: '48%',
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  tokenSelected: { backgroundColor: '#eef6ff', borderColor: '#2563eb' },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tokenSymbol: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  tokenName: { color: '#6b7280', marginTop: 4, textAlign: 'center' },
  proceedBtn: {
    marginTop: 20,
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  proceedText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default TokenSelection;