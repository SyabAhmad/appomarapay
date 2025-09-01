import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  TokenSelection: { chainId: string; chainName?: string } | undefined;
  AmountEntry: { chainId: string; chainName?: string; tokenId?: string; tokenSymbol?: string } | undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'TokenSelection'>;

const TOKENS_BY_CHAIN: Record<string, Array<{ id: string; symbol: string; name: string; logo?: any }>> = {
  Ethereum: [
    { id: 'Ethereum', symbol: 'ETH', name: 'Ethereum', logo: require('../../assets/Ethereum.png') },
    { id: 'Tether', symbol: 'T', name: 'Tether', logo: require('../../assets/Tether.png') },
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin', logo: require('../../assets/USDCoin.png') },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', logo: require('../../assets/Chainlink.png') },
    { id: 'dai', symbol: 'DAI', name: 'Dai', logo: require('../../assets/Dai.png') },
    { id: 'usdfx', symbol: 'usdfx', name: 'usdfx', logo: require('../../assets/USDFX.png') },
  ],
  Bitcoin: [{ id: 'btc', symbol: 'BTC', name: 'Bitcoin', logo: require('../../assets/Bitcoin.png') }],
  BNBSmartChain: [
    { id: 'bnb', symbol: 'BNB', name: 'BNB', logo: require('../../assets/Bnb.png') },
    { id: 'Tether', symbol: 'Tether', name: 'Tether', logo: require('../../assets/Tether.png') },
    { id: 'BUSD', symbol: 'BUSD', name: 'BUSD', logo: require('../../assets/BUSD.png') },
  ],
  Polygon: [
    { id: 'matic', symbol: 'MATIC', name: 'Polygon', logo: require('../../assets/Matic.png') },
    { id: 'Tether', symbol: 'tether', name: 'Tether', logo: require('../../assets/Tether.png') },
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin', logo: require('../../assets/USDCoin.png') },
  ],
  Arbitrum: [
    
    { id: 'Ethereum', symbol: 'ethereum', name: 'Ethereum', logo: require('../../assets/Ethereum.png') },
    { id: 'Arbitrum', symbol: 'ARB', name: 'Arbitrum', logo: require('../../assets/Arbitrum.png') },
    { id: 'Tether', symbol: 'tether', name: 'Tether', logo: require('../../assets/Tether.png') },
  ],
  Polkadot: [
    { id: 'Polkadot', symbol: 'DOT', name: 'Polkadot', logo: require('../../assets/Polkadot.png') },
  ],
  Tron: [
    { id: 'Tron', symbol: 'TRX', name: 'Tron', logo: require('../../assets/Tron.png') },
  ],
  NearProtocol: [
    { id: 'Near Protocol', symbol: 'NEAR', name: 'Near Protocol', logo: require('../../assets/NearProtocol.png') },
  ],
  // fallback
  default: [{ id: 'usdc', symbol: 'USDC', name: 'USD Coin', logo: require('../../assets/USDCoin.png') }],
};

const TokenSelection: React.FC<Props> = ({ navigation, route }) => {
  const chainId = route.params?.chainId ?? 'ethereum';
  const chainName = route.params?.chainName ?? chainId;
  const tokens = TOKENS_BY_CHAIN[chainId] ?? TOKENS_BY_CHAIN.default;

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select token</Text>
          <View style={{ width: 64 }} />
        </View>

        <Text style={styles.subtitle}>Network: {chainName}</Text>

        <View style={styles.grid}>
          {tokens.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('AmountEntry' as never, {
                  chainId,
                  chainName,
                  tokenId: t.id,
                  tokenSymbol: t.symbol,
                } as never)
              }
            >
              <Image source={t.logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.symbol}>{t.symbol}</Text>
              <Text style={styles.name}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 28, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  header: { width: '100%', maxWidth: 560, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '800', fontSize: 16 },
  subtitle: { color: '#6b7280', marginBottom: 12 },
  grid: { width: '100%', maxWidth: 560, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 18, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eef2ff', marginBottom: 12 },
  logo: { width: 48, height: 48, marginBottom: 8 },
  symbol: { fontWeight: '800', fontSize: 16 },
  name: { color: '#6b7280', marginTop: 4, fontSize: 12 },
});

export default TokenSelection;