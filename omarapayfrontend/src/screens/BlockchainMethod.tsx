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
    // add more chains here
  ];

  const goBackWithSelection = () =>
    navigation.navigate('PaymentMethod' as never, { selectedMethod: 'Blockchain' } as never);

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={goBackWithSelection}>
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
                // open TokenSelection for the tapped chain
                onPress={() => navigation.navigate('TokenSelection' as never, { chainId: c.id } as never)}
                activeOpacity={0.9}
              >
                <Text style={styles.chainEmoji}>{c.emoji}</Text>
                <Text style={styles.chainName}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.proceedBtn, !selectedChain ? { opacity: 0.6 } : null]}
          disabled={!selectedChain}
          onPress={() => {
            // proceed action: navigate to payment flow for selectedChain or handle selection
            // currently returns to PaymentMethod with Blockchain selected
            navigation.navigate('PaymentMethod' as never, { selectedMethod: 'Blockchain' } as never);
          }}
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
  chainName: { fontSize: 15, fontWeight: '700', color: '#111827' },
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

export default BlockchainMethod;