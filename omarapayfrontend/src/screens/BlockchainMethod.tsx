import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  PaymentMethod: undefined;
  Login: undefined;
  BlockchainMethod: undefined;
  CardSelectedItemLite: undefined;
  GCashMethod: undefined;
  CardMethod: undefined;
  TokenSelection: { chainId: string; chainName?: string } | undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'BlockchainMethod'>;

const BlockchainMethod: React.FC<Props> = ({ navigation }) => {
  const onLogout = () => navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  const chains = [
    { id: 'ethereum', name: 'Ethereum', emoji: 'Ξ' },
    { id: 'bitcoin', name: 'Bitcoin', emoji: '₿' },
    { id: 'solana', name: 'Solana', emoji: '◎' },
    { id: 'polygon', name: 'Polygon', emoji: 'M' },
    { id: 'avalanche', name: 'Avalanche', emoji: 'A' },
    { id: 'fantom', name: 'Fantom', emoji: 'F' },
    { id: 'optimism', name: 'Optimism', emoji: 'O' },
    { id: 'arbitrum', name: 'Arbitrum', emoji: 'a' },
    { id: 'bsc', name: 'BNB Chain', emoji: '𐄷' },
    { id: 'celo', name: 'Celo', emoji: 'C' },
  ];

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>

          <Text style={styles.topTitle}>Choose Blockchain</Text>

          <TouchableOpacity style={styles.outlineBtn} onPress={onLogout}>
            <Text style={styles.outlineBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.sectionSubtitle}>Select the blockchain you want to use</Text>

        <View style={styles.chainGrid}>
          {chains.map((c) => {
            const selected = selectedChain === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.chainCard, selected ? styles.chainCardSelected : null]}
                onPress={() => {
                  setSelectedChain(c.id);
                  // open token selection for this chain
                  navigation.navigate('TokenSelection' as never, { chainId: c.id, chainName: c.name } as never);
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.chainEmoji}>{c.emoji}</Text>
                <Text style={styles.chainName}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  outlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  outlineBtnText: { color: '#111827', fontWeight: '700' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827', textAlign: 'center' },
  logo: { width: 150, height: 54, marginTop: 6, marginBottom: 18 },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 12 },
  chainGrid: {
    marginTop: 6,
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  chainCard: {
    width: '48%',
    minHeight: 90,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  chainCardSelected: {
    backgroundColor: '#eef6ff',
    borderColor: '#2563eb',
  },
  chainEmoji: { fontSize: 26, marginBottom: 6 },
  chainName: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'center' },
});

export default BlockchainMethod;