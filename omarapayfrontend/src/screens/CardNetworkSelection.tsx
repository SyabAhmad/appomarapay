import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  CardNetworkSelection: undefined;
  CardDetails: { networkId: string; networkName: string } | undefined;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardNetworkSelection'>;

const networks = [
  { id: 'visa', name: 'Visa', emoji: 'V' },
  { id: 'mastercard', name: 'Mastercard', emoji: 'M' },
  { id: 'amex', name: 'American Express', emoji: 'A' },
  { id: 'discover', name: 'Discover', emoji: 'D' },
  { id: 'jcb', name: 'JCB', emoji: 'J' },
  { id: 'diners', name: 'Diners Club', emoji: 'DC' },
];

const CardNetworkSelection: React.FC<Props> = ({ navigation }) => {
  const onLogout = () => navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>

          <Text style={styles.topTitle}>Choose Card Network</Text>

          <TouchableOpacity style={styles.outlineBtn} onPress={onLogout}>
            <Text style={styles.outlineBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.sectionSubtitle}>Select the card network</Text>

        <View style={styles.grid}>
          {networks.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={styles.networkCard}
              onPress={() => navigation.navigate('CardDetails' as never, { networkId: n.id, networkName: n.name } as never)}
              activeOpacity={0.9}
            >
              <Text style={styles.networkEmoji}>{n.emoji}</Text>
              <Text style={styles.networkName}>{n.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 30, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  topRow: {
    width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  back: { color: '#2563eb', fontWeight: '800' },
  outlineBtn: {
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb',
  },
  outlineBtnText: { color: '#111827', fontWeight: '700' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  logo: { width: 150, height: 54, marginTop: 6, marginBottom: 12 },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 12 },

  grid: {
    width: '100%', maxWidth: 560, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12,
  },
  networkCard: {
    width: '48%', minHeight: 90, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 12, marginTop: 8,
  },
  networkCardSelected: { backgroundColor: '#eef6ff', borderColor: '#2563eb' },
  networkEmoji: { fontSize: 28, marginBottom: 6 },
  networkName: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'center' },
});

export default CardNetworkSelection;