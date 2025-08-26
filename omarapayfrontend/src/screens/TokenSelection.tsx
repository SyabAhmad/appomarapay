import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  TokenSelection: { chainId: string; chainName?: string } | undefined;
  PaymentMethod: { selectedMethod?: 'Card' | 'Blockchain' | 'GCash'; selectedToken?: string; chainId?: string } | undefined;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'TokenSelection'>;

const TOKENS_BY_CHAIN: Record<string, Array<{ id: string; symbol: string; name: string; logo?: any }>> = {
  ethereum: [
    { id: 'eth', symbol: 'ETH', name: 'Ether', logo: require('../../assets/Etherum.png') },
    { id: 'usdt', symbol: 'USDT', name: 'Tether', logo: require('../../assets/Tether.png') },
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin', logo: require('../../assets/USD Coin.png') },
    { id: 'dai', symbol: 'DAI', name: 'Dai', logo: require('../../assets/Dai.png') },
    { id: 'usdfx', symbol: 'USDFX', name: 'USDFX', logo: require('../../assets/Dai.png') },
    // { id: 'weth', symbol: 'WETH', name: 'Wrapped Ether', logo: require('../../assets/Etherum.png') },
    { id: 'link', symbol: 'LINK', name: 'Chainlink', logo: require('../../assets/Chainlink.png') },
    // { id: 'matic', symbol: 'MATIC', name: 'Matic', logo: require('../../assets/Matic.png') },
  ],
  bnbsmart: [
    { id: 'bnb', symbol: 'BNB', name: 'BNB', logo: require('../../assets/Bnb.png') },
    { id: 'tether', symbol: 'Tether', name: 'Tether', logo: require('../../assets/Tether.png') },
    { id: 'busd', symbol: 'BUSD', name: 'BUSD', logo: require('../../assets/Tether.png') },
  ],
  bitcoin: [
    { id: 'btc', symbol: 'BTC', name: 'Bitcoin', logo: require('../../assets/Bitcoin.png') },
    { id: 'tbtc', symbol: 'tBTC', name: 'tBTC (wrapped)', logo: require('../../assets/Bitcoin.png') },
  ],
  solana: [
    { id: 'sol', symbol: 'SOL', name: 'Solana', logo: require('../../assets/logo.png') },
    { id: 'usdc_s', symbol: 'USDC', name: 'USDC', logo: require('../../assets/USD Coin.png') },
  ],
  polygon: [
    { id: 'matic', symbol: 'MATIC', name: 'Polygon', logo: require('../../assets/Matic.png') },
    { id: 'usdc_p', symbol: 'USDC', name: 'USDC', logo: require('../../assets/USD Coin.png') },
  ],
  avalanche: [{ id: 'avax', symbol: 'AVAX', name: 'Avalanche', logo: require('../../assets/logo.png') }],
  bsc: [{ id: 'bnb', symbol: 'BNB', name: 'BNB', logo: require('../../assets/Bnb.png') }],
  // extend as needed
};

const TokenSelection: React.FC<Props> = ({ navigation, route }) => {
  const chainId = route.params?.chainId ?? 'ethereum';
  const chainName = route.params?.chainName ?? chainId;
  const tokens = useMemo(() => TOKENS_BY_CHAIN[chainId] ?? [], [chainId]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = tokens.filter(
    (t) => !query || t.symbol.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>{chainName} — Select token</Text>
          <View style={{ width: 88 }} />
        </View>

        <Text style={styles.helper}>Pick a token to use with {chainName}</Text>

        <TextInput
          placeholder="Search token (symbol or name)"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.grid}>
          {filtered.map((t) => {
            const selected = selectedToken === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tokenCard, selected ? styles.tokenSelected : null]}
                onPress={() => setSelectedToken(t.id)}
                activeOpacity={0.9}
              >
                <View style={[styles.tokenIcon, selected ? styles.tokenIconSelected : null]}>
                  {t.logo ? <Image source={t.logo} style={styles.tokenLogo} resizeMode="contain" /> : <Text style={{ fontWeight: '700' }}>{t.symbol[0]}</Text>}
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.tokenSymbol}>{t.symbol}</Text>
                  <Text style={styles.tokenName}>{t.name}</Text>
                </View>
                {selected ? <View style={styles.check}><Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text></View> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* sticky confirm bar */}
      <View style={styles.confirmBar}>
        <Text style={styles.confirmText}>{selectedToken ? `Selected: ${selectedToken.toUpperCase()}` : 'No token selected'}</Text>
        <TouchableOpacity
          style={[styles.proceedBtn, !selectedToken ? { opacity: 0.6 } : null]}
          disabled={!selectedToken}
          onPress={() =>
            navigation.navigate(
              'AmountEntry' as never,
              { chainId, chainName, tokenId: selectedToken, tokenSymbol: (TOKENS_BY_CHAIN[chainId] || []).find(t => t.id === selectedToken)?.symbol } as never
            )
          }
        >
          <Text style={styles.proceedText}>Enter amount</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 40, paddingBottom: 120, paddingHorizontal: 16, alignItems: 'center' },
  topRow: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 56,
  },
  back: { color: '#2563eb', fontWeight: '800' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827', textAlign: 'center' },
  helper: { color: '#6b7280', marginBottom: 56, textAlign: 'center' },
  search: {
    width: '100%',
    maxWidth: 560,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6eef8',
    backgroundColor: '#f8fafc',
    marginBottom: 56,
    color: '#0f172a',
  },
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
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    backgroundColor: '#fff',
    position: 'relative',
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
  tokenIconSelected: { backgroundColor: '#dbeafe' },
  tokenLogo: { width: 36, height: 36, marginBottom: 8 },
  tokenSymbol: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  tokenName: { color: '#6b7280', marginTop: 4, textAlign: 'center' },
  check: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#e6eef8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmText: { color: '#111827', fontWeight: '700' },
  proceedBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  proceedText: { color: '#fff', fontWeight: '800' },
});

export default TokenSelection;